import { runTestFor } from './helper';

test('should handle renaming of default exports', () => {
  const result = runTestFor('defaults.ts');
  expect(result).toBe(`declare module "test" {
  export const one: {
    (): string;
  };

  export const two: {
    (): string;
  };

  export const three: {
    (): string;
  };
}`);
});
