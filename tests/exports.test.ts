import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('should handle nested selected exports', async () => {
  const result = await runTestFor('exports1.ts');
  expect(result).toBe(`declare module "test" {
  export const Fail3: "";

  export function Fail3b(): string;
}`);
});

test('should handle nested star exports', async () => {
  const result = await runTestFor('exports2.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(): string;

  export interface Foo {
    bar: string;
  }

  export function bar(): number;

  export interface Bar {
    qxz: number;
  }
}`);
});

test('should handle deeply nested selected export', async () => {
  const result = await runTestFor('exports3.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {}
}`);
});

test('should handle nested selected export with rename', async () => {
  const result = await runTestFor('exports4.ts');
  expect(result).toBe(`declare module "test" {
  export interface Foo {}

  export interface Qxz {}
}`);
});
