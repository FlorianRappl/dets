import { runTestFor } from './helper';

test('should handle nested selected exports', () => {
  const result = runTestFor('exports1.ts');
  expect(result).toBe(`declare module "test" {
  export const Fail3: "";

  export const Fail3b: {
    (): string;
  };
}`);
});
