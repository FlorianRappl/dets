import {
  TypeChecker,
  Type,
  TypeFlags,
  SymbolFlags,
  ObjectFlags,
  TypeReference,
  Symbol,
  InterfaceTypeWithDeclaredMembers
} from "typescript";
import {
  getLib,
  getRefName,
  isBaseLib,
  isTypeParameter,
  isAnonymousObject,
  isObjectType,
  isReferenceType,
  isBigIntLiteral,
  getKeyName,
  isIndexType
} from "./helpers";
import {
  TypeModel,
  TypeModelIndex,
  TypeModelProp,
  TypeModelFunction,
  DeclVisitorContext,
  TypeModelAlias
} from "./types";

function getTypeParameters(context: DeclVisitorContext, type: Type) {
  const typeRef = type as TypeReference;
  return typeRef.typeArguments?.map(t => includeType(context, t)) ?? [];
}

function getComment(checker: TypeChecker, symbol: Symbol) {
  const doc = symbol.getDocumentationComment(checker);

  if (doc) {
    return doc.map(item => item.text).join("\n");
  }

  return undefined;
}

function includeExternal(context: DeclVisitorContext, type: Type) {
  const name = type.symbol.name;
  const fn = type.symbol.declarations?.[0]?.parent?.getSourceFile()?.fileName;

  if (isBaseLib(fn)) {
    const typeName = name;
    return includeRef(context, type, typeName);
  }

  // const parent = type.symbol.parent?.valueDeclaration?.parent;
  // const fileName = parent?.getSourceFile()?.fileName;
  const lib = getLib(fn, context.imports);

  if (lib) {
    const typeName = `${getRefName(lib)}.${name}`;
    return includeRef(context, type, typeName);
  }
}

export function includeType(
  context: DeclVisitorContext,
  type: Type
): TypeModel {
  const name = type.symbol?.name;

  if (name) {
    const ext = includeExternal(context, type);

    if (ext) {
      return ext;
    } else if (name === "__type") {
      return {
        kind: "ref",
        types: [],
        refName: "any"
      };
    } else if (!isAnonymousObject(type)) {
      return makeRef(context, type, name, includeObject);
    }

    return includeObject(context, type);
  }

  const alias = type.aliasSymbol?.name;

  if (alias) {
    return makeAliasRef(context, type, alias);
  }

  return includeAnonymous(context, type);
}

function makeAliasRef(
  context: DeclVisitorContext,
  type: Type,
  name: string
): TypeModel {
  const decl: any = type.aliasSymbol.declarations[0];

  if (!(name in context.refs)) {
    context.refs[name] = {
      kind: "ref",
      types: [],
      refName: name
    };

    context.refs[name] = {
      kind: "alias",
      comment: getComment(context.checker, decl.symbol),
      types: decl.typeParameters?.map(t => includeType(context, t)) ?? [],
      child: includeAnonymous(context, context.checker.getTypeAtLocation(decl))
    };
  }

  return {
    kind: "ref",
    types: type.aliasTypeArguments?.map(t => includeType(context, t)) ?? [],
    refName: name
  };
}

function makeRef(
  context: DeclVisitorContext,
  type: Type,
  name: string,
  cb: (context: DeclVisitorContext, type: Type) => TypeModel
) {
  const refType = type;

  if (!(name in context.refs)) {
    context.refs[name] = {
      kind: "ref",
      types: [],
      refName: name
    };

    if (isObjectType(type) && isReferenceType(type)) {
      type = type.target;
    }

    context.refs[name] = cb(context, type);
  }

  return includeRef(context, refType, name);
}

function includeRef(
  context: DeclVisitorContext,
  type: Type,
  refName: string
): TypeModel {
  return {
    kind: "ref",
    types: getTypeParameters(context, type),
    refName
  };
}

function includeBasic(context: DeclVisitorContext, type: Type): TypeModel {
  // We're not handling things SomethingLike cause there're unions of flags
  // and would be handled anyway into more specific types
  // VoidLike is Undefined or Void,
  // StringLike is String or StringLiteral
  // NumberLike is Number or NumberLiteral or Enum
  // BigIntLike is BigInt or BigIntLiteral
  // ESSymbolLike is ESSymbol or ESUniqueSymbol
  // Don't take those ^ definitions too seriously, they're subject to change

  if (type.flags & TypeFlags.Any) {
    return {
      kind: "any"
    };
  }

  if (type.flags & TypeFlags.Unknown) {
    return {
      kind: "unknown"
    };
  }

  if (type.isStringLiteral()) {
    return {
      kind: "stringLiteral",
      value: type.value
    };
  }

  if (type.isNumberLiteral()) {
    return {
      kind: "numberLiteral",
      value: type.value
    };
  }

  if (type.flags & TypeFlags.BooleanLiteral) {
    return {
      kind: "booleanLiteral",
      // FIXME It's a dirty hack but i can't seem to find any other way to get a value of BooleanLiteral
      value: (type as any).intrinsicName === "true"
    };
  }

  if (type.flags & TypeFlags.EnumLiteral && type.isUnion()) {
    return {
      kind: "enumLiteral",
      values: type.types.map(t => includeType(context, t))
    };
  }

  if (isBigIntLiteral(type)) {
    return {
      kind: "bigintLiteral",
      value: type.value
    };
  }

  if (type.flags & TypeFlags.String) {
    return {
      kind: "string"
    };
  }

  if (type.flags & TypeFlags.Boolean) {
    return {
      kind: "boolean"
    };
  }

  if (type.flags & TypeFlags.Number) {
    return {
      kind: "number"
    };
  }

  if (type.flags & TypeFlags.Enum && type.isUnion()) {
    return {
      kind: "enum",
      values: type.types.map(t => includeType(context, t))
    };
  }

  if (type.flags & TypeFlags.BigInt) {
    return {
      kind: "bigint"
    };
  }

  if (type.flags & TypeFlags.ESSymbol) {
    return {
      kind: "esSymbol"
    };
  }

  if (type.flags & TypeFlags.UniqueESSymbol) {
    return {
      kind: "uniqueEsSymbol"
    };
  }

  if (type.flags & TypeFlags.Void) {
    return {
      kind: "void"
    };
  }

  if (type.flags & TypeFlags.Undefined) {
    return {
      kind: "undefined"
    };
  }

  if (type.flags & TypeFlags.Null) {
    return {
      kind: "null"
    };
  }

  if (type.flags & TypeFlags.Never) {
    return {
      kind: "never"
    };
  }

  if (type.flags & TypeFlags.Conditional) {
    return {
      kind: "conditional"
    };
  }

  if (type.flags & TypeFlags.Substitution) {
    return {
      kind: "substitution"
    };
  }

  if (type.flags & TypeFlags.NonPrimitive) {
    return {
      kind: "nonPrimitive"
    };
  }
}

function getAllExternals(context: DeclVisitorContext, type: Type) {
  const decl: any = type?.symbol?.declarations?.[0];
  const types = decl.heritageClauses?.[0]?.types || [];
  const baseTypes = types.map(t => context.checker.getTypeAtLocation(t));

  for (let i = baseTypes.length; i--; ) {
    const t = baseTypes[i];
    const ext = includeExternal(context, t);

    if (!ext) {
      baseTypes.splice(i, 1, ...getAllExternals(context, t));
    }
  }

  return baseTypes;
}

function includeTypeParameter(
  context: DeclVisitorContext,
  type: Type
): TypeModel {
  if (isTypeParameter(type)) {
    const symbol = type.getSymbol();
    const decl: any = symbol.declarations?.[0];
    const constraint = decl?.constraint?.type ?? type.getConstraint();
    const name = constraint?.typeName?.text;
    return {
      kind: "typeParameter",
      typeName: symbol.name,
      constraint: name
        ? {
            kind: "ref",
            refName: `keyof ${name}`,
            types: []
          }
        : constraint && includeType(context, constraint)
    };
  }
}

function getAllExternalProperties(externals) {
  const externalsProperties = [];

  for (const external of externals) {
    externalsProperties.push(...external.getProperties());
  }

  return externalsProperties;
}

function includeObject(context: DeclVisitorContext, type: Type): TypeModel {
  if (isObjectType(type)) {
    const externals = getAllExternals(context, type);
    const externalProperties = getAllExternalProperties(externals);
    const targets = externalProperties.map(m => m.target.id);
    const props = type.getProperties();
    const propsDescriptor: Array<TypeModelProp> = props
      .filter(m => !targets.includes(m.target?.id))
      .map(prop => {
        const propType = context.checker.getTypeOfSymbolAtLocation(
          prop,
          prop.valueDeclaration
        );

        return {
          kind: "prop",
          name: prop.name,
          optional: !!(prop.flags & SymbolFlags.Optional),
          comment: getComment(context.checker, prop),
          valueType: includeType(context, propType)
        };
      });

    // index types
    const stringIndexType = type.getStringIndexType();
    const numberIndexType = type.getNumberIndexType();
    const indicesDescriptor: Array<TypeModelIndex> = [];

    if (numberIndexType) {
      const info = (<InterfaceTypeWithDeclaredMembers>type)
        .declaredNumberIndexInfo;
      indicesDescriptor.push({
        kind: "index",
        keyType: { kind: "number" },
        keyName: getKeyName(info),
        valueType: includeType(context, numberIndexType)
      });
    }

    if (stringIndexType) {
      const info = (<InterfaceTypeWithDeclaredMembers>type)
        .declaredStringIndexInfo;
      indicesDescriptor.push({
        kind: "index",
        keyType: { kind: "string" },
        keyName: getKeyName(info),
        valueType: includeType(context, stringIndexType)
      });
    }

    const callSignatures = type.getCallSignatures();
    const callsDescriptor: Array<TypeModelFunction> =
      callSignatures?.map(sign => ({
        kind: "function",
        value: context.checker.signatureToString(sign),
        types:
          sign.typeParameters?.map(t => {
            return includeType(context, t);
          }) ?? [],
        parameters: sign.getParameters().map(param => {
          const type = context.checker.getTypeAtLocation(
            param.valueDeclaration
          );
          return {
            kind: "parameter",
            param: param.name,
            type: includeType(context, type)
          };
        }),
        returnType: includeType(context, sign.getReturnType())
      })) ?? [];

    const types = type.getBaseTypes();

    if (types) {
      for (const t of types) {
        t.getCallSignatures()
        console.log(t.getBaseTypes());
      }
    }

    return {
      kind: "object",
      extends: externals.map(e => includeExternal(context, e)),
      comment: getComment(context.checker, type.symbol),
      props: propsDescriptor,
      calls: callsDescriptor,
      types: getTypeParameters(context, type),
      indices: indicesDescriptor
    };
  }
}

function includeCombinator(context: DeclVisitorContext, type: Type): TypeModel {
  // Tuple special handling
  if (
    isObjectType(type) &&
    isReferenceType(type) &&
    type.target.objectFlags & ObjectFlags.Tuple &&
    !!type.typeArguments &&
    type.typeArguments.length > 0
  ) {
    return {
      kind: "tuple",
      types: type.typeArguments.map(t => includeType(context, t))
    };
  }

  if (type.isUnion()) {
    return {
      kind: "union",
      types: type.types.map(t => includeType(context, t))
    };
  }

  if (type.isIntersection()) {
    return {
      kind: "intersection",
      types: type.types.map(t => includeType(context, t))
    };
  }

  if (isIndexType(type)) {
    return {
      kind: "indexedAccess",
      index: includeType(context, type.indexType),
      object: includeType(context, type.objectType)
    };
  }
}

function includeAnonymous(context: DeclVisitorContext, type: Type): TypeModel {
  return (
    includeBasic(context, type) ??
    includeTypeParameter(context, type) ??
    includeObject(context, type) ??
    includeCombinator(context, type) ?? {
      kind: "unidentified"
    }
  );
}
