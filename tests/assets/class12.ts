export interface Bar {
  bar: string;
}

export interface Foo extends Bar {
  foo: number;
}

export class Foo {
  constructor(a: string, b: number) {}
}
