import { runTestFor } from './helper';

test('should handle triple-slash import', async () => {
  const result = await runTestFor('triple.ts');
  expect(result).toBe(`declare module "test" {
  export interface Bar {
    qxz: number;
  }
}`);
});
