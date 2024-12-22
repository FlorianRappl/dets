import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('should support satisfies operator', async () => {
  const result = await runTestFor('satisfies1.ts', {
    imports: [],
  });
  expect(result).toBe(`declare module "test" {
  export const myColor: "red";
}`);
});
