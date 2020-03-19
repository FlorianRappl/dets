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
  export function myGenerator(): Generator<string, string, unknown>;
}`);
});

test('should handle dotted arguments', () => {
  const result = runTestFor('function4.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(index: number, ...args: Array<any>): void;
}`);
});

test('should handle object destructuring', () => {
  const result = runTestFor('function5.ts');
  expect(result).toBe(`declare module "test" {
  export function foo({ a, b }: Record<string, any>): void;
}`);
});

test('should handle array destructuring', () => {
  const result = runTestFor('function6.ts');
  expect(result).toBe(`declare module "test" {
  export function foo([, second]: Array<any>): void;
}`);
});

test('should handle ReadonlyArray from es2015 lib', () => {
  const result = runTestFor('function7.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(s: ReadonlyArray<string>): void;
}`);
});
