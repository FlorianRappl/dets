import { runTestFor } from './helper';

test('should handle renaming of function default exports', () => {
  const result = runTestFor('defaults2.ts');
  expect(result).toBe(`declare module "test" {
  export function three(): string;
}`);
});
