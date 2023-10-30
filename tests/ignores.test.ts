import { runTestFor } from './helper';

test('should drop ignored properties', async () => {
  const result = await runTestFor('ignore1.ts');
  expect(result).toBe(`declare module "test" {
  export interface MyApi {
    bar: boolean;
  }
}`);
});

test('should not drop ignored properties if noIgnore set to true', async () => {
  const result = await runTestFor('ignore1.ts', {
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

test('should remove prop in interface merging', async () => {
  const result = await runTestFor('ignore2.ts');
  expect(result).toBe(`declare module "test" {
  export interface MyApi {
    foo: string;
  }
}`);
});

test('should remove cause in interface merging', async () => {
  const result = await runTestFor('ignore3.ts');
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

test('should not drop ignored properties if @dets_preserve', async () => {
  const result = await runTestFor('ignore4.ts');
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

test('should still drop (dets) ignored properties if noIgnore set to true', async () => {
  const result = await runTestFor('ignore5.ts', {
    noIgnore: true,
  });
  expect(result).toBe(`declare module "test" {
  export interface MyApi {
    /**
     * @ignore
     */
    bar: boolean;
  }
}`);
});
