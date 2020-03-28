import * as x from './import3-one';

export interface Foo {
  b: string;
}

export type Bar = x.Foo;
