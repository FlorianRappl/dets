import {
  TypeMemberModel,
  TypeModelAlias,
  TypeModelAny,
  TypeModelBigInt,
  TypeModelBigIntLiteral,
  TypeModelBoolean,
  TypeModelClass,
  TypeModelConditional,
  TypeModelDefault,
  TypeModelESSymbol,
  TypeModelEnum,
  TypeModelEnumLiteral,
  TypeModelConstructor,
  TypeModelFunction,
  TypeModelFunctionParameter,
  TypeModelIndex,
  TypeModelIndexedAccess,
  TypeModelInfer,
  TypeModelIntersection,
  TypeModelPrefix,
  TypeModelString,
  TypeModelProp,
  TypeModelNumber,
  TypeModelVariable,
  TypeModelInterface,
  TypeModelUnidentified,
  TypeModelUnknown,
  TypeModelLiteral,
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
  TypeModelThis,
  TypeModelNew,
  TypeModelPredicate,
} from './models';

export type TypeModel =
  | TypeModelString
  | TypeMemberModel
  | TypeModelDefault
  | TypeModelProp
  | TypeModelBoolean
  | TypeModelNumber
  | TypeModelVariable
  | TypeModelInterface
  | TypeModelUnidentified
  | TypeModelAny
  | TypeModelUnknown
  | TypeModelEnum
  | TypeModelBigInt
  | TypeModelLiteral
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
  | TypeModelConstructor
  | TypeModelRef
  | TypeModelPrefix
  | TypeModelPredicate
  | TypeModelAlias
  | TypeModelMapped
  | TypeModelInfer
  | TypeModelClass
  | TypeModelThis
  | TypeModelNew;

export type TypeModelKinds = TypeModel['kind'];
