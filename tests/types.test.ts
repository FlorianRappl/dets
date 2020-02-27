import { runTestFor } from './helper';

test('should be able to handle a simple mapped type', () => {
  const result = runTestFor('type1.ts');
  expect(result).toBe(`declare module "test" {
  export type Foo = {
    [index: string]: string;
  };
}`);
});
