import { test, expect } from 'vitest';
import { runTestFor } from './helper';

test('should include a referenced interface merged with a namespace', async () => {
  const result = await runTestFor('merge-crs.ts');
  expect(result).toBe(`declare module "test" {
  export interface MapOptions {
    crs?: CRS;
  }

  export interface CRS {
    scale(zoom: number): number;
  }
}`);
});

test('should include a merged interface referenced by an import type', async () => {
  const result = await runTestFor('merge-crs-import.ts');
  expect(result).toBe(`declare module "test" {
  export type MapCRS = CRS;

  export interface CRS {
    scale(zoom: number): number;
  }
}`);
});

test('should include a merged interface referenced by a heritage clause', async () => {
  const result = await runTestFor('merge-crs-extends.ts');
  expect(result).toBe(`declare module "test" {
  export interface CustomCRS extends CRS {
    code: string;
  }

  export interface CRS {
    scale(zoom: number): number;
  }
}`);
});

test('should merge interfaces appropriately', async () => {
  const result = await runTestFor('', {
    files: ['merge1.ts', 'merge1-one.ts', 'merge1-two.ts'],
    types: ['merge1.ts'],
  });
  expect(result).toBe(`declare module "test" {
  export interface MyApi extends MyOtherApi, MyCustomApi {
    foo: string;
  }

  export interface MyOtherApi {
    bar: number;
  }

  export interface MyCustomApi {
    qxz: [string, number];
  }
}`);
});

test('should strip out duplicated type parameters', async () => {
  const result = await runTestFor('', {
    files: ['merge2.ts', 'merge2-one.ts', 'merge2-two.ts'],
    types: ['merge2.ts'],
  });
  expect(result).toBe(`declare module "test" {
  export interface MyApi<T> {
    first: T;
    second: T;
  }
}`);
});
