import { WithTypeArgs, WithTypeComments, WithTypeExtends, WithTypeProps, WithTypeImplements } from './helper';
import { TypeModel } from './model';

export interface TypeModelDefault extends WithTypeComments {
  readonly kind: 'default';
  readonly name: string;
  readonly value: TypeModelRef | TypeModelClass;
}

export interface TypeModelClass
  extends WithTypeComments,
    WithTypeArgs,
    WithTypeExtends,
    WithTypeImplements,
    WithTypeProps {
  readonly kind: 'class';
  readonly name: string;
}

export interface TypeModelProp extends WithTypeComments {
  readonly name: string | TypeModel;
  readonly modifiers: string;
  readonly optional: boolean;
  readonly kind: 'prop';
  readonly valueType: TypeModel;
}

export interface TypeModelTupleProp extends WithTypeComments {
  readonly name: string | TypeModel;
  readonly optional: boolean;
  readonly kind: 'tuple-prop';
  readonly valueType: TypeModel;
}

export interface TypeModelPredicate {
  readonly kind: 'predicate';
  readonly name: string;
  readonly value: TypeModel;
}

export interface TypeModelVariable extends WithTypeComments {
  readonly kind: 'const';
  readonly name: string;
  readonly value: TypeModel;
}

export interface TypeModelRef extends WithTypeArgs {
  readonly kind: 'ref';
  readonly refName: string;
}

export interface TypeModelPrefixReadonly {
  readonly kind: 'readonly';
  readonly value: TypeModel;
}

export interface TypeModelPrefixUnique {
  readonly kind: 'unique';
  readonly value: TypeModel;
}

export interface TypeModelPrefixKeyof {
  readonly kind: 'keyof';
  readonly value: TypeModel;
}

export interface TypeModelImport {
  readonly kind: 'import';
  readonly value: TypeModel;
  readonly qualifier?: string;
}

export type TypeModelPrefix = TypeModelPrefixKeyof | TypeModelPrefixReadonly | TypeModelPrefixUnique;

export interface TypeModelAny {
  readonly kind: 'any';
}

export interface TypeModelUnknown {
  readonly kind: 'unknown';
}

export interface TypeModelString {
  readonly kind: 'string';
}

export interface TypeModelNumber {
  readonly kind: 'number';
}

export interface TypeModelBoolean {
  readonly kind: 'boolean';
}

export interface TypeModelConstructor {
  readonly kind: 'constructor';
  readonly comment?: string;
  readonly modifiers: string;
  readonly parameters: Array<TypeModelFunctionParameter>;
}

export interface TypeModelNew extends WithTypeArgs {
  readonly kind: 'new';
  readonly comment?: string;
  readonly parameters: Array<TypeModelFunctionParameter>;
  readonly returnType: TypeModel;
}

export interface TypeModelFunction extends WithTypeArgs {
  readonly kind: 'function';
  readonly name: string;
  readonly comment?: string;
  readonly parameters: Array<TypeModelFunctionParameter>;
  readonly returnType: TypeModel;
}

export interface TypeModelFunctionParameter {
  readonly kind: 'parameter';
  readonly param: string;
  readonly value: TypeModel;
  readonly optional: boolean;
  readonly modifiers: string;
  readonly spread: boolean;
}

export interface TypeModelBigInt {
  readonly kind: 'bigint';
}

export interface TypeModelLiteral {
  readonly kind: 'literal';
  readonly value: boolean | string | number;
}

export interface TypeModelEnumLiteral extends WithTypeComments {
  readonly kind: 'enumLiteral';
  readonly name: string;
  readonly const: boolean;
  readonly values: Array<TypeMemberModel>;
}

export interface TypeMemberModel extends WithTypeComments {
  readonly kind: 'member';
  readonly name: string | TypeModel;
  readonly value: TypeModel;
}

export interface TypeModelBigIntLiteral {
  readonly kind: 'bigintLiteral';
  readonly value: string;
}

export interface TypeModelESSymbol {
  readonly kind: 'esSymbol';
}

export interface TypeModelUniqueESSymbol {
  readonly kind: 'uniqueEsSymbol';
}

export interface TypeModelVoid {
  readonly kind: 'void';
}

export interface TypeModelUndefined {
  readonly kind: 'undefined';
}

export interface TypeModelNull {
  readonly kind: 'null';
}

export interface TypeModelNever {
  readonly kind: 'never';
}

export interface TypeModelInfer {
  readonly kind: 'infer';
  readonly parameter: TypeModel;
}

export interface TypeModelGetAccessor extends WithTypeComments {
  readonly kind: 'get';
  readonly name: string | TypeModel;
  readonly type: TypeModel;
  readonly modifiers: string;
}

export interface TypeModelSetAccessor extends WithTypeComments {
  readonly kind: 'set';
  readonly name: string | TypeModel;
  readonly parameters: Array<TypeModelFunctionParameter>;
  readonly modifiers: string;
}

export interface TypeModelTypeParameter {
  readonly kind: 'typeParameter';
  readonly parameter: TypeModel;
  readonly constraint?: TypeModel;
  readonly default?: TypeModel;
}

export interface TypeModelUnion extends WithTypeArgs {
  readonly kind: 'union';
}

export interface TypeModelIntersection extends WithTypeArgs {
  readonly kind: 'intersection';
}

export type TypeModelIndexKey = TypeModelUnion | TypeModelString | TypeModelNumber;

export interface TypeModelIndex {
  readonly kind: 'index';
  readonly parameters: Array<TypeModelFunctionParameter>;
  readonly valueType: TypeModel;
  readonly optional: boolean;
}

export interface TypeModelAccess {
  readonly kind: 'access';
  readonly name: TypeModel;
  readonly object: TypeModel;
}

export interface TypeModelIndexedAccess {
  readonly kind: 'indexedAccess';
  readonly index: TypeModel;
  readonly object: TypeModel;
}

export interface TypeModelConditional {
  readonly kind: 'conditional';
  readonly check: TypeModel;
  readonly extends: TypeModel;
  readonly primary: TypeModel;
  readonly alternate: TypeModel;
}

export interface TypeModelSubstitution {
  readonly kind: 'substitution';
  readonly variable: TypeModel;
}

export interface TypeModelNonPrimitive {
  readonly kind: 'nonPrimitive';
  readonly name?: string;
}

export interface TypeModelUnidentified {
  readonly kind: 'unidentified';
}

export interface TypeModelMapped {
  readonly kind: 'mapped';
  readonly name: string;
  readonly constraint: TypeModel;
  readonly optional: boolean;
  readonly value: TypeModel;
}

export interface TypeModelInterface extends WithTypeArgs, WithTypeComments, WithTypeExtends, WithTypeProps {
  readonly kind: 'interface';
  readonly name: string;
  readonly mapped?: TypeModelMapped;
}

export interface TypeModelParenthesis {
  readonly kind: 'parenthesis';
  readonly value: TypeModel;
}

export interface TypeModelTuple extends WithTypeArgs {
  readonly kind: 'tuple';
}

export interface TypeModelAlias extends WithTypeArgs, WithTypeComments {
  readonly kind: 'alias';
  readonly name: string;
  readonly child: TypeModel;
}

export interface TypeModelRest {
  readonly kind: 'rest';
  readonly value: TypeModel;
}

export interface TypeModelTemplate {
  readonly kind: 'template';
  readonly parts: Array<string | TypeModel>;
}
