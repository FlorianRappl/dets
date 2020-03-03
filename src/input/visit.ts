import {
  TypeChecker,
  Type,
  TypeFlags,
  SymbolFlags,
  TypeReference,
  Symbol,
  InterfaceTypeWithDeclaredMembers,
  InterfaceType,
  VariableDeclaration,
  TypeAliasDeclaration,
  isIdentifier,
  isInterfaceDeclaration,
  isClassDeclaration,
  FunctionDeclaration,
  Signature,
  ExportAssignment,
  TypeNode,
  ObjectFlags,
  IndexInfo,
  SignatureDeclarationBase,
} from 'typescript';
import {
  getLib,
  isBaseLib,
  isAnonymousObject,
  isObjectType,
  isReferenceType,
  isBigIntLiteral,
  getKeyName,
  isIndexType,
  isGlobal,
  getGlobalName,
  isTupleType,
  isKeyOfType,
  isIdentifierType,
  isConditionalType,
  isInferType,
  isSubstitutionType,
  isAnonymous,
} from '../helpers';
import {
  TypeModel,
  TypeModelIndex,
  TypeModelProp,
  TypeModelFunction,
  DeclVisitorContext,
  TypeModelRef,
  TypeMemberModel,
  TypeModelKeyOf,
  TypeModelObject,
  TypeModelIndexKey,
  TypeModelClass,
  TypeModelConstructor,
} from '../types';
import { createBinding } from './utils';

function getTypeArguments(context: DeclVisitorContext, type: Type) {
  const typeRef = type as TypeReference;
  return typeRef.typeArguments?.map(t => includeType(context, t)) ?? [];
}

function getTypeParameters(context: DeclVisitorContext, type: Type) {
  const typeRef = type as InterfaceType;
  return typeRef.typeParameters?.map(t => includeTypeParameter(context, t)) ?? [];
}

function getDefaultTypeId(context: DeclVisitorContext, type: Type) {
  const symbol = type?.symbol;
  const decl = symbol?.declarations?.[0];
  const defaultNode = decl?.default;

  if (defaultNode) {
    const defaultType = context.checker.getTypeAtLocation(defaultNode);
    return defaultType?.id;
  }

  return undefined;
}

function getComment(checker: TypeChecker, symbol: Symbol) {
  const doc = symbol?.getDocumentationComment(checker);
  return doc?.map(item => item.text).join('\n');
}

function getTypeModel(context: DeclVisitorContext, type: Type, name?: string) {
  if (name) {
    if (type.aliasSymbol) {
      if (!type.symbol || type.aliasSymbol.id !== type.symbol.id) {
        return makeAliasRef(context, type, name);
      }
    }

    const ext = includeExternal(context, type);

    if (ext) {
      return ext;
    } else if (!isAnonymous(name) && !isAnonymousObject(type)) {
      return makeRef(context, type, name, includeNamed);
    }
  }

  return includeAnonymous(context, type);
}

function getParameterType(context: DeclVisitorContext, type: TypeNode): TypeModel {
  if (isIdentifierType(type)) {
    const t = context.checker.getTypeAtLocation(type);
    return getTypeModel(context, t, (type.typeName as any).text);
  } else if (isInferType(type)) {
    const t = context.checker.getDeclaredTypeOfSymbol(type.typeParameter.symbol);
    return {
      kind: 'infer',
      parameter: includeType(context, t),
    };
  } else {
    return includeAnonymousNode(context, type);
  }
}

function getFunctionType(context: DeclVisitorContext, sign: Signature): TypeModelFunction {
  return {
    kind: 'function',
    types: getTypeParameters(context, sign as any),
    parameters: sign.getParameters().map(param => ({
      kind: 'parameter',
      param: param.name,
      spread: param.valueDeclaration.dotDotDotToken !== undefined,
      optional: param.valueDeclaration.questionToken !== undefined,
      value: getParameterType(context, param.valueDeclaration.type as any),
    })),
    returnType: includeType(context, sign.getReturnType()),
  };
}

function getConstructorType(context: DeclVisitorContext, sign: SignatureDeclarationBase): TypeModelConstructor {
  return {
    kind: 'constructor',
    types: getTypeParameters(context, sign as any),
    parameters: sign.parameters.map((p) => p.symbol).map((param: Symbol) => ({
      kind: 'parameter',
      param: param.name,
      spread: param.valueDeclaration.dotDotDotToken !== undefined,
      optional: param.valueDeclaration.questionToken !== undefined,
      value: getParameterType(context, param.valueDeclaration.type as any),
    })),
  };
}

function getKeyOfType(context: DeclVisitorContext, type: Type): TypeModelKeyOf {
  return {
    kind: 'keyof',
    value: includeType(context, type),
  };
}

function getPropType(context: DeclVisitorContext, prop: Symbol): TypeModelProp {
  const propType = context.checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
  const type = prop.valueDeclaration?.type;
  const valueType = isKeyOfType(type)
    ? getKeyOfType(context, context.checker.getTypeFromTypeNode(type.type))
    : includeType(context, propType);
  return {
    kind: 'prop',
    name: prop.name,
    id: prop.id || prop.target?.id,
    optional: !!(prop.flags & SymbolFlags.Optional),
    comment: getComment(context.checker, prop),
    valueType,
  };
}

function getIndexType(
  context: DeclVisitorContext,
  type: Type,
  keyType: TypeModelIndexKey,
  info: IndexInfo,
): TypeModelIndex {
  return {
    kind: 'index',
    keyType,
    optional: false,
    keyName: getKeyName(info),
    valueType: includeType(context, type),
  };
}

function normalizeTypeParameters(context: DeclVisitorContext, type: Type, decl: Type, types: Array<TypeModel>) {
  const typeParameterIds = decl?.typeParameters?.map(t => getDefaultTypeId(context, t)) ?? [];
  const typeArgumentIds = type.aliasTypeArguments?.map(t => t.id) ?? [];

  for (let i = typeParameterIds.length; i--; ) {
    const id = typeParameterIds[i];

    if (!id || id !== typeArgumentIds[i]) {
      break;
    }

    types.pop();
  }

  return types;
}

function includeExternal(context: DeclVisitorContext, type: Type) {
  if (isGlobal(type.symbol)) {
    const globalName = getGlobalName(type.symbol);
    return includeRef(context, type, globalName);
  }

  const name = type.symbol?.name;
  const fn = type.symbol?.declarations?.[0]?.parent?.getSourceFile()?.fileName;

  if (isBaseLib(fn)) {
    // Include items from the ts core lib (no need to ref. them)
    return includeRef(context, type, name, type);
  }

  const lib = getLib(fn, context.availableImports);

  if (lib) {
    const anonymous = isAnonymous(name);

    if (anonymous) {
      // Right now this catches the JSXElementConstructor; but
      // I guess this code should be made "more robust" and also
      // more generic.
      const parent: any = type.symbol?.declarations?.[0]?.parent;
      const hiddenType = parent?.type?.parent?.parent?.parent;
      const hiddenTypeName = hiddenType?.symbol?.name;

      if (hiddenTypeName) {
        return includeRef(
          context,
          {
            ...hiddenType,
            typeArguments:
              hiddenType.typeParameters?.map(() => ({
                flags: TypeFlags.Any,
              })) || [],
          },
          createBinding(context, lib, hiddenTypeName),
        );
      }
    } else if (!isAnonymousObject(type)) {
      return includeRef(context, type, createBinding(context, lib, name), type);
    }
  }
}

export function includeExportedType(context: DeclVisitorContext, type: Type) {
  const name = type.symbol.name;
  const node = includeType(context, type);

  // okay we got a non-ref back, hence it was not yet added to the refs
  if (node.kind !== 'ref') {
    context.refs[name] = node;
  }
}

export function includeDefaultExport(context: DeclVisitorContext, node: ExportAssignment) {
  const type = context.checker.getTypeAtLocation(node.expression);
  const symbol = context.checker.getSymbolAtLocation(node.expression);

  if (symbol) {
    if (symbol.flags === SymbolFlags.TypeAlias) {
      includeExportedTypeAlias(context, symbol.declarations[0] as any);
    } else if (symbol.flags === SymbolFlags.Function) {
      includeExportedFunction(context, symbol.valueDeclaration as any);
    } else {
      includeExportedVariable(context, symbol.valueDeclaration as any);
    }

    context.refs.default = {
      kind: 'default',
      comment: getComment(context.checker, node.symbol),
      value: includeRef(context, type, symbol.name),
    };
  } else {
    context.refs._default = {
      kind: 'const',
      value: includeAnonymous(context, type),
    };
    context.refs.default = {
      kind: 'default',
      comment: getComment(context.checker, node.symbol),
      value: includeRef(context, type, '_default'),
    };
  }
}

export function includeExportedTypeAlias(context: DeclVisitorContext, variable: TypeAliasDeclaration) {
  const name = (variable.name as any).text;

  context.refs[name] = {
    kind: 'alias',
    comment: getComment(context.checker, variable.symbol),
    types: getTypeParameters(context, variable as any),
    child: getParameterType(context, variable.type),
  };
}

export function includeExportedVariable(context: DeclVisitorContext, variable: VariableDeclaration) {
  const name = (variable.name as any).text;
  const type = variable.type
    ? context.checker.getTypeFromTypeNode(variable.type)
    : context.checker.getTypeAtLocation(variable.initializer);
  context.refs[name] = {
    kind: 'const',
    comment: getComment(context.checker, variable.symbol),
    value: includeType(context, type),
  };
}

export function includeExportedFunction(context: DeclVisitorContext, func: FunctionDeclaration) {
  const name = func.name.text;
  const type = context.checker.getTypeAtLocation(func as any);
  const [signature] = type.getCallSignatures();
  const funcType = getFunctionType(context, signature);
  context.refs[name] = {
    ...funcType,
    comment: getComment(context.checker, func.symbol),
  };
}

function includeType(context: DeclVisitorContext, type: Type): TypeModel {
  const ta = type as any;

  if (ta.stringsOnly === false) {
    return {
      kind: 'keyof',
      value: includeType(context, ta.type),
    };
  } else {
    const alias = type.aliasSymbol?.name;
    return getTypeModel(context, type, alias || type.symbol?.name);
  }
}

function makeAliasRef(context: DeclVisitorContext, type: Type, name: string): TypeModel {
  const decl: any = type.aliasSymbol.declarations[0];
  const ext = includeExternal(context, decl);

  if (ext && ext.kind === 'ref') {
    name = ext.refName;
  } else if (!(name in context.refs)) {
    context.refs[name] = {
      kind: 'ref',
      types: [],
      refName: name,
    };

    context.refs[name] = {
      kind: 'alias',
      comment: getComment(context.checker, decl.symbol),
      types: decl.typeParameters?.map(t => includeTypeParameter(context, t)) ?? [],
      child: includeAnonymous(context, context.checker.getTypeAtLocation(decl)),
    };
  }

  const types = type.aliasTypeArguments?.map(t => includeType(context, t)) ?? [];

  return {
    kind: 'ref',
    types: normalizeTypeParameters(context, type, decl, types),
    refName: name,
  };
}

function makeRef(
  context: DeclVisitorContext,
  type: Type,
  name: string,
  cb: (context: DeclVisitorContext, type: Type) => TypeModel,
) {
  const refType = type;

  if (!(name in context.refs)) {
    context.refs[name] = {
      kind: 'ref',
      types: [],
      refName: name,
    };

    if (isObjectType(type) && isReferenceType(type)) {
      type = type.target;
    }

    context.refs[name] = cb(context, type);
  }

  return includeRef(context, refType, name);
}

function includeRef(context: DeclVisitorContext, type: Type, refName: string, external?: Type): TypeModel {
  const decl: any = type.symbol?.declarations[0];
  const types = getTypeArguments(context, type);

  return {
    kind: 'ref',
    types: normalizeTypeParameters(context, type, decl, types),
    refName,
    external,
  };
}

function includeMember(context: DeclVisitorContext, type: Type): TypeMemberModel {
  return {
    kind: 'member',
    name: type.symbol.name,
    value: includeAnonymous(context, type),
    comment: getComment(context.checker, type.symbol),
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
      kind: 'any',
    };
  }

  if (type.flags & TypeFlags.Unknown) {
    return {
      kind: 'unknown',
    };
  }

  if (typeof type.isStringLiteral === 'function' && type.isStringLiteral()) {
    return {
      kind: 'stringLiteral',
      value: type.value,
    };
  }

  if (typeof type.isNumberLiteral === 'function' && type.isNumberLiteral()) {
    return {
      kind: 'numberLiteral',
      value: type.value,
    };
  }

  if (type.flags & TypeFlags.BooleanLiteral) {
    return {
      kind: 'booleanLiteral',
      // FIXME It's a dirty hack but i can't seem to find any other way to get a value of BooleanLiteral
      value: (type as any).intrinsicName === 'true',
    };
  }

  if (type.flags & TypeFlags.EnumLiteral && type.isUnion()) {
    return {
      kind: 'enumLiteral',
      const: type.symbol.flags === SymbolFlags.ConstEnum,
      comment: getComment(context.checker, type.symbol),
      values: type.types.map(t => includeMember(context, t)),
    };
  }

  if (type.flags & TypeFlags.Enum && type.isUnion()) {
    return {
      kind: 'enum',
      comment: getComment(context.checker, type.symbol),
      values: type.types.map(t => includeMember(context, t)),
    };
  }

  if (isBigIntLiteral(type)) {
    return {
      kind: 'bigintLiteral',
      value: type.value,
    };
  }

  if (type.flags & TypeFlags.String) {
    return {
      kind: 'string',
    };
  }

  if (type.flags & TypeFlags.Boolean) {
    return {
      kind: 'boolean',
    };
  }

  if (type.flags & TypeFlags.Number) {
    return {
      kind: 'number',
    };
  }

  if (type.flags & TypeFlags.BigInt) {
    return {
      kind: 'bigint',
    };
  }

  if (type.flags & TypeFlags.ESSymbol) {
    return {
      kind: 'esSymbol',
    };
  }

  if (type.flags & TypeFlags.UniqueESSymbol) {
    return {
      kind: 'uniqueEsSymbol',
    };
  }

  if (type.flags & TypeFlags.Void) {
    return {
      kind: 'void',
    };
  }

  if (type.flags & TypeFlags.Undefined) {
    return {
      kind: 'undefined',
    };
  }

  if (type.flags & TypeFlags.Null) {
    return {
      kind: 'null',
    };
  }

  if (type.flags & TypeFlags.Never) {
    return {
      kind: 'never',
    };
  }

  if (isConditionalType(type)) {
    return {
      kind: 'conditional',
      condition: {
        kind: 'typeParameter',
        parameter: includeType(context, type.root.checkType),
        constraint: includeType(context, type.root.extendsType),
      },
      primary: includeType(context, type.root.trueType),
      alternate: includeType(context, type.root.falseType),
    };
  }

  if (isSubstitutionType(type)) {
    return {
      kind: 'substitution',
      variable: includeType(context, type.typeVariable),
    };
  }

  if (type.flags & TypeFlags.NonPrimitive) {
    return {
      kind: 'nonPrimitive',
      name: type.intrinsicName,
    };
  }
}

function includeInheritedTypes(context: DeclVisitorContext, type: Type) {
  const decl = type?.symbol?.declarations?.[0];

  if (decl && (isInterfaceDeclaration(decl) || isClassDeclaration(decl))) {
    const types = decl?.heritageClauses?.[0]?.types;
    return (
      types?.map(t => {
        const ti = context.checker.getTypeAtLocation(t as any);
        const res = includeType(context, ti) as TypeModelRef;

        if (res.kind !== 'ref' && isIdentifier(t.expression)) {
          return {
            kind: 'ref',
            refName: t.expression.text,
            types: [],
            external: ti,
          } as TypeModelRef;
        }

        return res;
      }) ?? []
    );
  }

  return [];
}

function includeConstraint(context: DeclVisitorContext, type: Type): TypeModel {
  const symbol = type.symbol;
  const decl: any = symbol.declarations?.[0];
  const c = decl?.constraint;
  const constraint = c?.type ?? type.getConstraint?.();

  if (isKeyOfType(c)) {
    const ct = context.checker.getTypeAtLocation(c.type);
    return getKeyOfType(context, ct);
  } else if (c) {
    const ct = context.checker.getTypeAtLocation(c);
    return includeType(context, ct);
  } else if (constraint) {
    return includeType(context, constraint);
  }

  return undefined;
}

function includeDefaultTypeArgument(context: DeclVisitorContext, type: Type): TypeModel {
  const symbol = type.symbol;
  const decl: any = symbol.declarations?.[0];
  const defaultNode = decl?.default;

  if (defaultNode) {
    const defaultType = context.checker.getTypeAtLocation(defaultNode);
    return includeType(context, defaultType);
  }

  return undefined;
}

function includeTypeParameter(context: DeclVisitorContext, type: Type): TypeModel {
  const symbol = type.symbol;

  if (symbol) {
    return {
      kind: 'typeParameter',
      parameter: {
        kind: 'ref',
        refName: symbol.name,
        types: [],
      },
      constraint: includeConstraint(context, type),
      default: includeDefaultTypeArgument(context, type),
    };
  }
}

function getAllPropIds(context: DeclVisitorContext, types: Array<TypeModelRef>) {
  const propIds: Array<number> = [];

  for (const type of types) {
    const baseType = context.refs[type.refName];

    if (baseType && baseType.kind === 'object') {
      for (const prop of baseType.props) {
        if (prop.id) {
          propIds.push(prop.id);
        }
      }

      propIds.push(...getAllPropIds(context, baseType.extends));
    } else if (type.external) {
      const props = type.external.getProperties() || [];

      for (const prop of props) {
        propIds.push(prop.id || prop.target?.id);
      }
    }
  }

  return propIds;
}

function includeStandardObject(context: DeclVisitorContext, type: Type): TypeModelObject {
  const inherited = includeInheritedTypes(context, type);
  const targets = getAllPropIds(context, inherited);
  const props = type.getProperties();
  const propsDescriptor: Array<TypeModelProp> = props
    .filter(prop => !targets.includes(prop.id || prop.target?.id))
    .map(prop => getPropType(context, prop));

  // index types
  const stringIndexType = type.getStringIndexType();
  const numberIndexType = type.getNumberIndexType();
  const indicesDescriptor: Array<TypeModelIndex> = [];

  if (numberIndexType && !inherited.some(m => m.external?.getNumberIndexType() === numberIndexType)) {
    indicesDescriptor.push(
      getIndexType(
        context,
        numberIndexType,
        { kind: 'number' },
        (<InterfaceTypeWithDeclaredMembers>type).declaredNumberIndexInfo,
      ),
    );
  }

  if (stringIndexType && !inherited.some(m => m.external?.getStringIndexType() === stringIndexType)) {
    indicesDescriptor.push(
      getIndexType(
        context,
        stringIndexType,
        { kind: 'string' },
        (<InterfaceTypeWithDeclaredMembers>type).declaredStringIndexInfo,
      ),
    );
  }

  const callSignatures = type.getCallSignatures();
  const callsDescriptor: Array<TypeModelFunction> = callSignatures?.map(sign => getFunctionType(context, sign)) ?? [];

  return {
    kind: 'object',
    extends: inherited,
    comment: getComment(context.checker, type.symbol),
    props: propsDescriptor,
    calls: callsDescriptor,
    types: getTypeParameters(context, type),
    indices: indicesDescriptor,
  };
}

function includeClassObject(context: DeclVisitorContext, type: Type): TypeModelClass {
  const obj = includeStandardObject(context, type);
  const ctor: Symbol | undefined = type.symbol.members.get('__constructor' as any);

  return {
    ...obj,
    ctors: ctor ? ctor.declarations.map((decl) => getConstructorType(context, decl as SignatureDeclarationBase)) : [],
    kind: 'class',
  };
}

function includeMappedObject(context: DeclVisitorContext, type: Type): TypeModelObject {
  const parent: any = type.typeParameter.symbol.declarations[0].parent;
  const index = parent.typeParameter;
  const declType: any = type.symbol.declarations[0].type;
  const valueType = context.checker.getTypeFromTypeNode(declType);
  return {
    kind: 'object',
    calls: [],
    extends: [],
    indices: [],
    props: [],
    types: [],
    comment: getComment(context.checker, type.symbol),
    mapped: {
      kind: 'mapped',
      name: index.symbol.name,
      constraint: includeConstraint(context, index),
      optional: parent.questionToken !== undefined,
      value: includeType(context, valueType),
    },
  };
}

function includeObject(context: DeclVisitorContext, type: Type): TypeModel {
  if (isObjectType(type)) {
    switch (type.objectFlags) {
      case ObjectFlags.Mapped:
        return includeMappedObject(context, type);
      case ObjectFlags.Class | ObjectFlags.Reference:
        return includeClassObject(context, type);
      default:
        return includeStandardObject(context, type);
    }
  }

  return undefined;
}

function includeIndex(context: DeclVisitorContext, type: Type): TypeModel {
  switch (type?.flags) {
    case TypeFlags.TypeParameter:
      return includeType(context, type);
    case TypeFlags.Index:
      return getKeyOfType(context, (type as any).type);
    default:
      return undefined;
  }
}

function includeCombinator(context: DeclVisitorContext, type: Type): TypeModel {
  if (isTupleType(type)) {
    return {
      kind: 'tuple',
      types: type.typeArguments.map(t => includeType(context, t)),
    };
  }

  if (isReferenceType(type)) {
    return {
      kind: 'ref',
      refName: type.symbol.name,
      types: getTypeArguments(context, type),
      external: type,
    };
  }

  if (typeof type.isUnion === 'function' && type.isUnion()) {
    return {
      kind: 'union',
      types: type.types.map(t => includeType(context, t)),
    };
  }

  if (typeof type.isIntersection === 'function' && type.isIntersection()) {
    return {
      kind: 'intersection',
      types: type.types.map(t => includeType(context, t)),
    };
  }

  if (isIndexType(type)) {
    return {
      kind: 'indexedAccess',
      index: includeIndex(context, type.indexType),
      object: type.objectType && includeType(context, type.objectType),
    };
  }
}

function includeNamed(context: DeclVisitorContext, type: Type): TypeModel {
  return includeBasic(context, type) ?? includeObject(context, type);
}

function includeAnonymousNode(context: DeclVisitorContext, type: TypeNode): TypeModel {
  if (isKeyOfType(type)) {
    return getKeyOfType(context, context.checker.getTypeFromTypeNode(type.type));
  }

  return includeAnonymous(context, context.checker.getTypeFromTypeNode(type));
}

function includeAnonymous(context: DeclVisitorContext, type: Type): TypeModel {
  return (
    includeBasic(context, type) ??
    includeCombinator(context, type) ??
    includeObject(context, type) ?? {
      kind: 'unidentified',
    }
  );
}
