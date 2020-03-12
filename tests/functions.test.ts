import { runTestFor } from './helper';

test('should generate a single function with inferred return', () => {
  const result = runTestFor('function1.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(a: string, b: number, c: boolean): {
    a: string;
    b: number;
    c: boolean;
  };
}`);
});

test('should handle simple generics and ignore internals', () => {
  const result = runTestFor('function2.ts');
  expect(result).toBe(`declare module "test" {
  export function foo<T>(a: string, b: T): {
    a: string;
    b: T;
  };

  export function bar(): "foo";
}`);
});

test('should handle generator functions', () => {
  const result = runTestFor('function3.ts');
  expect(result).toBe(`declare module "test" {
  export function myGenerator(): Generator<string, string>;
}`);
});

test('should handle dotted arguments', () => {
  const result = runTestFor('function4.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(index: number, ...args: Array<any>): void;
}`);
});
