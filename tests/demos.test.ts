import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('should be able to handle unnecessary semicolons (issue 44)', async () => {
  const result = await runTestFor('demo1.ts');
  expect(result).toBe(`declare module "test" {
  export class Demo {
    private x: number;
    private y: number;
    constructor(x: number, y: number);
    public getSum(): number;
  }
}`);
});
