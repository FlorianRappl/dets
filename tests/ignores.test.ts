import { runTestFor } from './helper';

test('should drop ignored properties', () => {
  const result = runTestFor('ignore1.ts');
  expect(result).toBe(`declare module "test" {
  export interface MyApi {
    bar: boolean;
  }
}`);
});

test('should not drop ignored properties if noIgnore set to true', () => {
  const result = runTestFor('ignore1.ts', {
    noIgnore: true,
  });
  expect(result).toBe(`declare module "test" {
  export interface MyApi {
    /**
     * @ignore
     */
    foo: string;
    bar: boolean;
  }
}`);
});

test('should remove prop in interface merging', () => {
  const result = runTestFor('ignore2.ts');
  expect(result).toBe(`declare module "test" {
  export interface MyApi {
    foo: string;
  }
}`);
});

test('should remove cause in interface merging', () => {
  const result = runTestFor('ignore3.ts');
  expect(result).toBe(`declare module "test" {
  /**
   * This comment should still exist.
   */
  export interface MyApi extends MyApi2 {}

  export interface MyApi2 {
    bar: boolean;
  }
}`);
});

test('should not drop ignored properties if @dets_preserve', () => {
  const result = runTestFor('ignore4.ts');
  expect(result).toBe(`declare module "test" {
  export interface MyApi {
    /**
     * @ignore
     */
    foo: string;
    bar: boolean;
  }
}`);
});
