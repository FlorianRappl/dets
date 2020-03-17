import { runTestFor } from './helper';

test('should handle renaming of default exports', () => {
  const result = runTestFor('defaults.ts');
  expect(result).toBe(`declare module "test" {
  export function one(): string;

  export function two(): string;
}`);
});
