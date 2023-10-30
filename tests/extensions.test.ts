import { createExcludePlugin } from '../src';
import { runTestFor } from './helper';

test('should combine merging if not told otherwise', async () => {
  const result = await runTestFor('extensions1-one.ts');
  expect(result).toBe(`declare module "test" {
  export interface Api {
    foo: string;
    bar: number;
  }
}`);
});

test('should exclude parent if told so', async () => {
  const result = await runTestFor('extensions1-one.ts', {
    imports: ['./extensions1-two'],
  });
  expect(result).toBe(`declare module "./extensions1-two" {
  export interface Api {
    bar: number;
  }
}`);
});

test('successfully exports only added part of PiletApi', async () => {
  const result = await runTestFor('extensions2.ts', {
    imports: ['sample-piral'],
  });
  expect(result).toBe(`declare module "sample-piral" {
  export interface PiletApi {
    registerFoo(): number;
  }
}`);
});

test('is able to deal with pilet extension slot merging', async () => {
  const result = await runTestFor('extensions3.ts', {
    name: 'my-pilet',
    imports: ['sample-piral'],
    plugins: [createExcludePlugin(['my-pilet'])],
  });
  expect(result).toBe(`declare module "sample-piral" {
  export interface PiralCustomExtensionSlotMap {
    "my-extension-slot": {
      foo: string;
      bar: number;
    };
  }
}`);
});
