import { runTestFor } from './helper';

test('should handle inheritance of interfaces without dropping', () => {
  const result = runTestFor('interface1.ts');
  expect(result).toBe(`declare module "test" {
  export interface CustomMerged {
    C: string;
    D: string;
  }

  export interface Merged extends CustomMerged {
    A: string;
    B: string;
  }
}`);
});

test('should work with inheritance and types from consts', () => {
  const result = runTestFor('interface2.ts');
  expect(result).toBe(`declare module "test" {
  export type Test1 = {
    foo: string;
    bar: string;
  };

  export type Test2 = {
    hello: string;
    world: string;
  };

  export interface Test extends Test1, Test2 {}
}`);
});

test('should work with type alias of constants', () => {
  const result = runTestFor('interface3.ts');
  expect(result).toBe(`declare module "test" {
  export type MenuType = "user" | "footer";

  export interface MenuSettings {
    type: MenuType;
  }
}`);
});

test('should work with boolean return narrowing', () => {
  const result = runTestFor('interface4.ts');
  expect(result).toBe(`declare module "test" {
  export interface Type {
    isUnion(): this is UnionType;
  }

  export interface UnionType {}
}`);
});

test('should work with merging', () => {
  const result = runTestFor('interface5.ts');
  expect(result).toBe(`declare module "test" {
  export interface Merged {
    kind: "hello";
    first: boolean;
    other: number;
    second: string;
  }
}`);
});

test('should handle overloads as-is', () => {
  const result = runTestFor('interface6.ts');
  expect(result).toBe(`declare module "test" {
  export interface Overloads {
    /**
     * First
     */
    foo(a: string, b: number): void;
    /**
     * Second
     */
    foo(a: string): void;
    /**
     * Third
     */
    foo(b: number): void;
  }
}`);
});

test('should take over JSDoc comments and tags', () => {
  const result = runTestFor('interface7.ts');
  expect(result).toBe(`declare module "test" {
  export interface MethodsWithJSDoc {
    /**
     * First one start with a comment
     * @param a description of parameter a
     * @param b description of parameter b
     * @example
     * var str = "abc";
     * console.log(foo(str, 3)); // abcabcabc
     */
    method1(a: string, b: number): void;
    /**
     * @param p description of parameter p, no comment before
     */
    method2(p: string): void;
    /**
     * Third one has an inline {@link https://piral.io} tag
     */
    method3(): void;
    /**
     * @abstract
     */
    method4(): void;
  }
}`);
});
