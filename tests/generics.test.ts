import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('should handle extends with conditionals', async () => {
  const result = await runTestFor('generic1.ts');
  expect(result).toBe(`declare module "test" {
  export function f<T extends boolean>(x: T): T extends true ? string : number;
}`);
});

test('should handle default values with conditionals', async () => {
  const result = await runTestFor('generic2.ts');
  expect(result).toBe(`declare module "test" {
  export type Ternary<T = undefined> = (T extends undefined ? {} : {
    ternary: T;
  });
}`);
});

test('should not omit substitutions', async () => {
  const result = await runTestFor('generic3.ts');
  expect(result).toBe(`declare module "test" {
  export type Action<TType extends string, TPayload = undefined, TMeta = undefined> = TPayload extends undefined ? TMeta extends undefined ? {
    type: TType;
  } : {
    type: TType;
    meta: TMeta;
  } : TPayload extends Error ? TMeta extends undefined ? {
    type: TType;
    payload: TPayload;
    error: true;
  } : {
    type: TType;
    payload: TPayload;
    meta: TMeta;
    error: true;
  } : TMeta extends undefined ? {
    type: TType;
    payload: TPayload;
  } : {
    type: TType;
    payload: TPayload;
    meta: TMeta;
  };
}`);
});
