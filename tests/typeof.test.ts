import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('Should export the typeof reference, too', async () => {
  const result = await runTestFor('typeof1.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {
    bar: typeof Bar;
  }

  export class Bar {}
}`);
});
