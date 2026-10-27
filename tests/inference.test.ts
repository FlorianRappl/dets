import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('should be able to infere default types correctly', async () => {
  const result = await runTestFor('inference1.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(a?: string, b?: number): void;
}`);
});

test('should be able to use given types instead of infered one', async () => {
  const result = await runTestFor('inference2.ts');
  expect(result).toBe(`declare module "test" {
  export function foo(a?: "foo" | "bar", b?: 5 | 10): void;
}`);
});

test('should preserve nested generic arguments in imported tuple types', async () => {
  const result = await runTestFor('inference-dispatch.d.ts', {
    imports: ['react'],
  });

  expect(result).toBe(`import * as React from 'react';

declare module "test" {
  export function usePagination<T>(allItems: Array<T>): readonly [Array<T>, React.Dispatch<React.SetStateAction<number>>];
}`);
});

test('should preserve instantiated generic arguments in inferred return types', async () => {
  const result = await runTestFor('inference-state.ts', {
    imports: ['react'],
  });
  expect(result).toBe(`import * as React from 'react';

declare module "test" {
  export function useCounter(): [number, React.Dispatch<React.SetStateAction<number>>];
}`);
});
