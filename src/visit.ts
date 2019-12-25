import {
    TypeChecker,
    Type,
    TypeFlags,
    SymbolFlags,
    BigIntLiteralType,
    PseudoBigInt,
    ObjectType,
    ObjectFlags,
    TypeReference
  } from "typescript";
  
  export type TypeModel =
    | TypeModelString
    | TypeModelBoolean
    | TypeModelNumber
    | TypeModelObject
    | TypeModelObjectWithIndex
    | TypeModelUnidentified
    | TypeModelAny
    | TypeModelUnknown
    | TypeModelEnum
    | TypeModelBigInt
    | TypeModelStringLiteral
    | TypeModelNumberLiteral
    | TypeModelBooleanLiteral
    | TypeModelEnumLiteral
    | TypeModelBigIntLiteral
    | TypeModelESSymbol
    | TypeModelUniqueESSymbol
    | TypeModelVoid
    | TypeModelUndefined
    | TypeModelNull
    | TypeModelNever
    | TypeModelTypeParameter
    | TypeModelUnion
    | TypeModelIntersection
    | TypeModelIndex
    | TypeModelIndexedAccess
    | TypeModelConditional
    | TypeModelSubstitution
    | TypeModelNonPrimitive
    | TypeModelArray
    | TypeModelTuple
    | TypeModelFunction;
  
  type MapWithIntersect<TOrig, TAdd> = TOrig extends any ? TOrig & TAdd : never;
  
  export type TypeModelWithPropFields = MapWithIntersect<TypeModel, PropFields>;
  
  export interface PropFields {
    readonly name: string;
    readonly optional: boolean;
  }
  
  export interface TypeModelAny {
    readonly kind: "any";
  }
  
  export interface TypeModelUnknown {
    readonly kind: "unknown";
  }
  
  export interface TypeModelString {
    readonly kind: "string";
  }
  
  export interface TypeModelNumber {
    readonly kind: "number";
  }
  
  export interface TypeModelBoolean {
    readonly kind: "boolean";
  }
  
  export interface TypeModelFunction {
    readonly kind: "function";
    readonly parameters: any;
    readonly returnType: any;
  }
  
  export interface TypeModelEnum {
    readonly kind: "enum";
    readonly values: TypeModel[];
  }
  
  export interface TypeModelBigInt {
    readonly kind: "bigint";
  }
  
  export interface TypeModelStringLiteral {
    readonly kind: "stringLiteral";
    readonly value: string;
  }
  
  export interface TypeModelNumberLiteral {
    readonly kind: "numberLiteral";
    readonly value: number;
  }
  
  export interface TypeModelBooleanLiteral {
    readonly kind: "booleanLiteral";
    readonly value: boolean;
  }
  
  export interface TypeModelEnumLiteral {
    readonly kind: "enumLiteral";
    readonly values: TypeModel[];
  }
  
  export interface TypeModelBigIntLiteral {
    readonly kind: "bigintLiteral";
    readonly value: PseudoBigInt;
  }
  
  export interface TypeModelESSymbol {
    readonly kind: "esSymbol";
  }
  
  export interface TypeModelUniqueESSymbol {
    readonly kind: "uniqueEsSymbol";
  }
  
  export interface TypeModelVoid {
    readonly kind: "void";
  }
  
  export interface TypeModelUndefined {
    readonly kind: "undefined";
  }
  
  export interface TypeModelNull {
    readonly kind: "null";
  }
  
  export interface TypeModelNever {
    readonly kind: "never";
  }
  
  export interface TypeModelTypeParameter {
    readonly kind: "typeParameter";
  }
  
  export interface TypeModelUnion {
    readonly kind: "union";
    readonly types: TypeModel[];
  }
  
  export interface TypeModelIntersection {
    readonly kind: "intersection";
    readonly types: TypeModel[];
  }
  
  export interface TypeModelIndex {
    readonly kind: "index";
    readonly keyType: TypeModelUnion | TypeModelString | TypeModelNumber;
    readonly valueType: TypeModel;
  }
  
  export interface TypeModelIndexedAccess {
    readonly kind: "indexedAccess";
  }
  
  export interface TypeModelConditional {
    readonly kind: "conditional";
  }
  
  export interface TypeModelSubstitution {
    readonly kind: "substitution";
  }
  
  export interface TypeModelNonPrimitive {
    readonly kind: "nonPrimitive";
  }
  
  export interface TypeModelUnidentified {
    readonly kind: "unidentified";
  }
  
  export interface TypeModelObject {
    readonly kind: "object";
    readonly props: Array<TypeModel |TypeModelWithPropFields>;
  }
  
  export interface TypeModelObjectWithIndex {
    readonly kind: "objectWithIndex";
    readonly props: Array<TypeModelWithPropFields>;
    readonly index: TypeModelIndex;
  }
  
  export interface TypeModelArray {
    readonly kind: "array";
    readonly type: TypeModel;
  }
  
  export interface TypeModelTuple {
    readonly kind: "tuple";
    readonly types: TypeModel[];
  }
  
  export type TypeModelKinds = TypeModel["kind"];
  
  function isBigIntLiteral(type: Type): type is BigIntLiteralType {
    return !!(type.flags & TypeFlags.BigIntLiteral);
  }
  
  function isObjectType(type: Type): type is ObjectType {
    return !!(type.flags & TypeFlags.Object);
  }
  
  function isReferenceType(type: ObjectType): type is TypeReference {
    return !!(type.objectFlags & ObjectFlags.Reference);
  }
  
  export const typeVisitor = (checker: TypeChecker, type: Type): TypeModel => {
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
        values: type.types.map(t => typeVisitor(checker, t))
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
        values: type.types.map(t => typeVisitor(checker, t))
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
  
    if (type.flags & TypeFlags.TypeParameter) {
      return {
        kind: "typeParameter"
      };
    }
  
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
        types: type.typeArguments.map(t => typeVisitor(checker, t))
      };
    }
  
    // Array special handling
    if (
      isObjectType(type) &&
      isReferenceType(type) &&
      !!type.typeArguments &&
      type.typeArguments.length > 0
    ) {
      const symbol = type.getSymbol();
      if (!!symbol && symbol.getName() === "Array") {
        return {
          kind: "array",
          type: typeVisitor(checker, type.typeArguments[0])
        };
      }
    }
  
    if (type.flags & TypeFlags.Object) {
      const props = type.getProperties();
      const propsDescriptor = props.map(prop => ({
        name: prop.name,
        optional: !!(prop.flags & SymbolFlags.Optional),
        ...typeVisitor(
          checker,
          checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration)
        )
      }));
  
      // index types
      const stringIndexType = type.getStringIndexType();
      const numberIndexType = type.getNumberIndexType();
  
      if (!!stringIndexType && !!numberIndexType) {
        return {
          kind: "objectWithIndex",
          props: propsDescriptor,
          index: {
            kind: "index",
            keyType: {
              kind: "union",
              types: [{ kind: "string" }, { kind: "number" }]
            },
            valueType: typeVisitor(checker, stringIndexType)
          }
        };
      }
  
      if (!!numberIndexType) {
        return {
          kind: "objectWithIndex",
          props: propsDescriptor,
          index: {
            kind: "index",
            keyType: { kind: "number" },
            valueType: typeVisitor(checker, numberIndexType)
          }
        };
      }
  
      if (!!stringIndexType) {
        return {
          kind: "objectWithIndex",
          props: propsDescriptor,
          index: {
            kind: "index",
            keyType: { kind: "string" },
            valueType: typeVisitor(checker, stringIndexType)
          }
        };
      }

      const callSignatures = type.getCallSignatures();

      if (callSignatures && callSignatures.length > 0) {
        return {
          kind: "object",
          props: callSignatures.map(sign => ({
            kind: "function",
            parameters: [],//sign.getParameters().map(param => typeVisitor(checker, checker.getDeclaredTypeOfSymbol(param))),
            returnType: typeVisitor(checker, sign.getReturnType()),
          })),
        };
      }
  
      return {
        kind: "object",
        props: propsDescriptor
      };
    }
  
    if (type.isUnion()) {
      return {
        kind: "union",
        types: type.types.map(t => typeVisitor(checker, t))
      };
    }
  
    if (type.isIntersection()) {
      return {
        kind: "intersection",
        types: type.types.map(t => typeVisitor(checker, t))
      };
    }
  
    // TODO Find out where i can meet TypeFlags.Index
    // if (type.flags & TypeFlags.Index) {
    //   return {
    //     kind: "index"
    //   };
    // }
  
    if (type.flags & TypeFlags.IndexedAccess) {
      return {
        kind: "indexedAccess"
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
  
    return {
      kind: "unidentified"
    };
  };