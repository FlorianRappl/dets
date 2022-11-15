import { runTestFor } from './helper';

// skipped for now; will work with typescript@4.9
test.skip('should support satisfies operator', () => {
  const result = runTestFor('satisfies1.ts', {
    imports: [],
  });
  expect(result).toBe(`declare module "test" {
  export const myColor: "red";
}`);
});
