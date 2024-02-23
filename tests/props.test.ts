import { runTestFor } from './helper';

test('Should get the right property name of a const member expression', async () => {
  const result = await runTestFor('prop1.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    [c.d]: Bar;
  }

  export const c: {
    d: "hello";
  };

  export interface Bar {}
}`);
});

test('Should get the right property name of a const identifier', async () => {
  const result = await runTestFor('prop2.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    [c]: Bar;
  }

  export const c: "hello";

  export interface Bar {}
}`);
});
