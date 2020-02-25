import {
  TypeMemberModel,
  TypeModelAlias,
  TypeModelAny,
  TypeModelBigInt,
  TypeModelBigIntLiteral,
  TypeModelBoolean,
  TypeModelBooleanLiteral,
  TypeModelConditional,
  TypeModelDefault,
  TypeModelESSymbol,
  TypeModelEnum,
  TypeModelEnumLiteral,
  TypeModelFunction,
  TypeModelFunctionParameter,
  TypeModelIndex,
  TypeModelIndexKey,
  TypeModelIndexedAccess,
  TypeModelInfer,
  TypeModelIntersection,
  TypeModelKeyOf,
  TypeModelString,
  TypeModelProp,
  TypeModelNumber,
  TypeModelVariable,
  TypeModelObject,
  TypeModelUnidentified,
  TypeModelUnknown,
  TypeModelStringLiteral,
  TypeModelNumberLiteral,
  TypeModelUniqueESSymbol,
  TypeModelVoid,
  TypeModelUndefined,
  TypeModelNull,
  TypeModelNever,
  TypeModelTypeParameter,
  TypeModelUnion,
  TypeModelSubstitution,
  TypeModelNonPrimitive,
  TypeModelTuple,
  TypeModelRef,
  TypeModelMapped,
} from './models';

export type TypeModel =
  | TypeModelString
  | TypeMemberModel
  | TypeModelDefault
  | TypeModelProp
  | TypeModelBoolean
  | TypeModelNumber
  | TypeModelVariable
  | TypeModelObject
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
  | TypeModelFunctionParameter
  | TypeModelUnion
  | TypeModelIntersection
  | TypeModelDefault
  | TypeModelIndex
  | TypeModelIndexedAccess
  | TypeModelConditional
  | TypeModelSubstitution
  | TypeModelNonPrimitive
  | TypeModelTuple
  | TypeModelFunction
  | TypeModelRef
  | TypeModelKeyOf
  | TypeModelAlias
  | TypeModelMapped
  | TypeModelInfer;

export type TypeModelKinds = TypeModel['kind'];
