import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('should handle unique symbol', async () => {
  const result = await runTestFor('symbol1.ts');
  expect(result).toEqual(`declare module "test" {
  export interface Foo {
    readonly hasInstance: unique symbol;
  }
}`);
});

test('should handle unique symbol', async () => {
  const result = await runTestFor('symbol2.ts');
  expect(result).toEqual(`declare module "test" {
  export interface String {
    split(splitter: {
      [Symbol.split](string: string, limit?: number): Array<string>;
    }, limit?: number): Array<string>;
  }
}`);
});
