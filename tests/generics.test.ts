import { runTestFor } from './helper';

test('should handle extends with conditionals', () => {
  const result = runTestFor('generic1.ts');
  expect(result).toBe(`declare module "test" {
  export function f<T extends boolean>(x: T): T extends true ? string : number;
}`);
});

test('should handle default values with conditionals', () => {
  const result = runTestFor('generic2.ts');
  expect(result).toBe(`declare module "test" {
  export type Ternary<T = undefined> = T extends undefined ? {} : {
    ternary: T;
  };
}`);
});
