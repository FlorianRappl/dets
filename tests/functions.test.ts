import { runTestFor } from './helper';

test('should generate a single function with inferred return', async () => {
  const result = await runTestFor('function1.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(a: string, b: number, c: boolean): {
    a: string;
    b: number;
    c: boolean;
  };
}`);
});

test('should handle simple generics and ignore internals', async () => {
  const result = await runTestFor('function2.ts');
  expect(result).toBe(`declare module "test" {
  export function foo<T>(a: string, b: T): {
    a: string;
    b: T;
  };

  export function bar(): "foo";
}`);
});

test('should handle generator functions', async () => {
  const result = await runTestFor('function3.ts');
  expect(result).toBe(`declare module "test" {
  export function myGenerator(): Generator<string, string, unknown>;
}`);
});

test('should handle dotted arguments', async () => {
  const result = await runTestFor('function4.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(index: number, ...args: Array<any>): void;
}`);
});

test('should handle object destructuring', async () => {
  const result = await runTestFor('function5.ts');
  expect(result).toBe(`declare module "test" {
  export function foo({ a, b }: Record<string, any>): void;
}`);
});

test('should handle array destructuring', async () => {
  const result = await runTestFor('function6.ts');
  expect(result).toBe(`declare module "test" {
  export function foo([, second]: Array<any>): void;
}`);
});

test('should handle ReadonlyArray from es2015 lib', async () => {
  const result = await runTestFor('function7.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(s: ReadonlyArray<string>): void;
}`);
});

test('should handle default arguments', async () => {
  const result = await runTestFor('function8.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(canManage?: boolean): boolean;
}`);
});

test('should use array literal for readonly modifiers', async () => {
  const result = await runTestFor('function9.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(): readonly string[];
}`);
});

test('should be prepared to include function overload correctly', async () => {
  const result = await runTestFor('function10.ts');
  expect(result).toBe(`declare module "test" {
  export interface NgComponent {
    /**
     * Comment on top.
     */
    foo(): void;
  }

  /**
   * Gives you the ability to use a component from a lazy loaded module.
   */
  export interface NgComponentLoader {
    /**
     * Uses a component from a lazy loaded module.
     * @param selector The selector defined for the component to load.
     */
    (selector: string): NgComponent;
  }

  export interface NgModuleDefiner {
    /**
     * Defines the module to use when bootstrapping the Angular pilet.
     * @param ngModule The module to use for running Angular.
     * @param opts The options to pass when bootstrapping.
     */
    <T>(module: Type<T>): void;
    /**
     * Defines the module to lazy load for bootstrapping the Angular pilet.
     * @param getModule The module lazy loader to use for running Angular.
     * @param opts The options to pass when bootstrapping.
     * @returns The module ID to be used to reference components.
     */
    <T>(getModule: () => Promise<{
      default: Type<T>;
    }>): NgComponentLoader;
  }

  export const foo: NgModuleDefiner;

  export interface Type<T> extends Function {
    new (...args: Array<any>): T;
  }
}`);
});
