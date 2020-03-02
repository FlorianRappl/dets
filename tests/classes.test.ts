import { runTestFor } from './helper';

test('should be able to handle exported classes', () => {
  const result = runTestFor('class1.ts');
  expect(result).toBe(`declare module "test" {
  export class SomeClass {
    constructor(value: string);
    value: string;
    foo(): string;
  }
}`);
});
