import { TypeModel } from './model';

export interface WithTypeArgs {
  readonly types: Array<TypeModel>;
}

export interface WithTypeComments {
  readonly comment?: string;
}

export interface WithTypeExtends {
  readonly extends: Array<TypeModel>;
}

export interface WithTypeImplements {
  readonly implements: Array<TypeModel>;
}

export interface WithTypeProps {
  readonly props: Array<TypeModel>;
}
