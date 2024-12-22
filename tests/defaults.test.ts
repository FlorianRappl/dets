import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('should handle renaming of default exports', async () => {
  const result = await runTestFor('defaults1.ts');
  expect(result).toBe(`declare module "test" {
  export function one(): string;

  export function two(): string;
}`);
});

test('should handle renaming of function default exports', async () => {
  const result = await runTestFor('defaults2.ts');
  expect(result).toBe(`declare module "test" {
  export function three(): string;
}`);
});

test('should handle a plain default exports', async () => {
  const result = await runTestFor('defaults3.ts');
  expect(result).toBe(`declare module "test" {
  export default foo;

  export const foo: "hello";
}`);
});

test('should handle a default class', async () => {
  const result = await runTestFor('defaults4.ts');
  expect(result).toBe(`declare module "test" {
  export default class {
    togglePopover(): void;
    closePopover(): void;
  }
}`);
});
