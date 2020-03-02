import { TypeModel } from './model';
import { TypeModelRef } from './models';

export interface WithTypeArgs {
  readonly types: Array<TypeModel>;
}

export interface WithTypeComments {
  readonly comment?: string;
}

export interface WithTypeExtends {
  readonly extends: Array<TypeModelRef>;
}
