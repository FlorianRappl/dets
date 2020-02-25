import { TypeModel } from './model';

export interface WithTypeArgs {
  readonly types: Array<TypeModel>;
}

export interface WithTypeComments {
  readonly comment?: string;
}
