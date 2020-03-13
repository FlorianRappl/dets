import { TypeModel } from './model';
import { TypeModelRef, TypeModelProp, TypeModelFunction, TypeModelIndex } from './models';

export interface WithTypeArgs {
  readonly types: Array<TypeModel>;
}

export interface WithTypeComments {
  readonly comment?: string;
}

export interface WithTypeExtends {
  readonly extends: Array<TypeModelRef>;
  readonly implements: Array<TypeModelRef>;
}

export interface WithTypeProps {
  readonly props: Array<TypeModelProp>;
  readonly calls: Array<TypeModelFunction>;
  readonly indices: Array<TypeModelIndex>;
}
