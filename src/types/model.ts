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
  TypeModelNew,
  TypeModelPredicate,
  TypeModelGetAccessor,
  TypeModelSetAccessor,
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
  | TypeModelNew
  | TypeModelGetAccessor
  | TypeModelSetAccessor;

export type TypeModelKinds = TypeModel['kind'];
