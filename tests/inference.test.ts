import { runTestFor } from './helper';

test('should be able to infere default types correctly', () => {
  const result = runTestFor('inference1.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(a?: string, b?: number): void;
}`);
});

test('should be able to use given types instead of infered one', () => {
  const result = runTestFor('inference2.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(a?: "foo" | "bar", b?: 5 | 10): void;
}`);
});
