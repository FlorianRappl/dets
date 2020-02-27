const test1 = {
  foo: '',
  bar: ''
};

export type Test1 = typeof test1;

const test2 = {
  hello: '',
  world: ''
};

export type Test2 = typeof test2;

export interface Test extends Test1, Test2 {}
