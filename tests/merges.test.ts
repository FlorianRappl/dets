import { runTestFor } from './helper';

test('should merge interfaces appropriately', () => {
  const result = runTestFor('', {
    files: ['merge1.ts', 'merge1-one.ts', 'merge1-two.ts'],
    types: ['merge1.ts'],
  });
  expect(result).toBe(`declare module "test" {
  export interface MyApi extends MyOtherApi, MyCustomApi {
    foo: string;
  }

  export interface MyOtherApi {
    bar: number;
  }

  export interface MyCustomApi {
    qxz: [string, number];
  }
}`);
});

test('should strip out duplicated type parameters', () => {
  const result = runTestFor('', {
    files: ['merge2.ts', 'merge2-one.ts', 'merge2-two.ts'],
    types: ['merge2.ts'],
  });
  expect(result).toBe(`declare module "test" {
  export interface MyApi<T> {
    first: T;
    second: T;
  }
}`);
});
