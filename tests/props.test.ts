import { runTestFor } from './helper';

test('Should get the right property name of a const member expression', () => {
  const result = runTestFor('prop1.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    ["hello"]: Bar;
  }

  export interface Bar {}
}`);
});

test('Should get the right property name of a const identifier', () => {
  const result = runTestFor('prop2.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    [c]: Bar;
  }

  export const c: "hello";

  export interface Bar {}
}`);
});
