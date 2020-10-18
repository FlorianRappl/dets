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
