import { runTestFor } from './helper';

test('should be able to handle default enums', async () => {
  const result = await runTestFor('enum1.ts');
  expect(result).toBe(`declare module "test" {
  export enum Foo {
    first,
    second,
  }
}`);
});

test('should be able to handle enums with custom values', async () => {
  const result = await runTestFor('enum2.ts');
  expect(result).toBe(`declare module "test" {
  export enum Foo {
    first = 2,
    second = 5,
  }
}`);
});

test('should be able to handle const enums with values', async () => {
  const result = await runTestFor('enum3.ts');
  expect(result).toBe(`declare module "test" {
  export const enum Foo {
    first = "first",
    second = "second",
  }
}`);
});

test('should be able to handle exported members', async () => {
  const result = await runTestFor('enum4.ts');
  expect(result).toBe(`declare module "test" {
  export type Bar = Foo.first;

  export enum Foo {
    first = 1,
    second = 2,
  }
}`);
});
