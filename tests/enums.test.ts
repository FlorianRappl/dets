import { runTestFor } from './helper';

test('should be able to handle default enums', () => {
  const result = runTestFor('enum1.ts');
  expect(result).toBe(`declare module "test" {
  export enum Foo {
    first,
    second,
  }
}`);
});

test('should be able to handle enums with custom values', () => {
  const result = runTestFor('enum2.ts');
  expect(result).toBe(`declare module "test" {
  export enum Foo {
    first = 2,
    second = 5,
  }
}`);
});

test('should be able to handle const enums with values', () => {
  const result = runTestFor('enum3.ts');
  expect(result).toBe(`declare module "test" {
  export const enum Foo {
    first = "first",
    second = "second",
  }
}`);
});
