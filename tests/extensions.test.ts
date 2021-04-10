import { runTestFor } from './helper';

test('should combine merging if not told otherwise', () => {
  const result = runTestFor('extensions1-one.ts');
  expect(result).toBe(`declare module "test" {
  export interface Api {
    foo: string;
    bar: number;
  }
}`);
});

test('should exclude parent if told so', () => {
  const result = runTestFor('extensions1-one.ts', {
    imports: ['./extensions1-two'],
  });
  expect(result).toBe(`declare module "./extensions1-two" {
  export interface Api {
    bar: number;
  }
}`);
});