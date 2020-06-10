import { runTestFor } from './helper';

test('should handle triple-slash import', () => {
  const result = runTestFor('triple.ts');
  expect(result).toBe(`declare module "test" {
  export interface Bar {
    qxz: number;
  }
}`);
});
