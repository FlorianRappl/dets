import { runTestFor } from './helper';

test('should be able to handle exported classes with constructor', () => {
  const result = runTestFor('class1.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass {
    constructor(value: string);
    private value: string;
    foo(): string;
  }
}`);
});

test('should be able to handle exported classes with differnet modifiers', () => {
  const result = runTestFor('class2.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass {
    constructor(bar: boolean, value: string);
    protected bar: boolean;
    private value: string;
    foo(): string;
    private qxz(): boolean;
    protected name: string;
  }
}`);
});

test('should be able to handle exported generic classes with explicit parameters', () => {
  const result = runTestFor('class3.ts');
  expect(result).toBe(`declare module "test" {
  export class OtherClass<P, S> {}

  export class SomeClass extends OtherClass<{}, {}> {
    constructor();
  }
}`);
});

test('should be able to handle exported generic classes with implicit parameters', () => {
  const result = runTestFor('class4.ts');
  expect(result).toBe(`declare module "test" {
  export class OtherClass<P, S = {}> {}

  export class SomeClass extends OtherClass<{}> {
    constructor();
  }
}`);
});
