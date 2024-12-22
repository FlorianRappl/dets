import { test, expect } from 'vitest';
import { resolve } from 'path';
import { createDiffPlugin } from '../src';
import { runTestFor } from './helper';

test('should handle simple declaration diffing without used imports (pilet from app shell)', async () => {
  const shell = resolve(__dirname, 'assets', 'pilet-shell1.ts');
  const result = await runTestFor('pilet-entry1.ts', {
    name: 'pilet',
    imports: ['react'],
    types: [],
    apis: [{
      file: shell,
      name: 'PiletApi',
    }],
    noModuleDeclaration: true,
    plugins: [createDiffPlugin(shell)],
  });
  expect(result).toBe(`/**
 * Custom extension slots outside of piral-core.
 */
export interface PiralCustomExtensionSlotMap {
  foo: {
    num: number;
  };
}`);
});

test('should handle simple declaration using correct name', async () => {
  const shell = resolve(__dirname, 'assets', 'pilet-shell1.ts');
  const result = await runTestFor('pilet-entry1.ts', {
    name: 'app-shell',
    imports: ['react'],
    types: [],
    apis: [{
      file: shell,
      name: 'PiletApi',
    }],
    plugins: [createDiffPlugin(shell)],
  });
  expect(result).toBe(`declare module "app-shell" {
  /**
   * Custom extension slots outside of piral-core.
   */
  export interface PiralCustomExtensionSlotMap {
    foo: {
      num: number;
    };
  }
}`);
});

test('should handle simple declaration diffing with used imports (pilet from app shell)', async () => {
  const shell = resolve(__dirname, 'assets', 'pilet-shell2.ts');
  const result = await runTestFor('pilet-entry2.ts', {
    name: 'pilet',
    imports: ['react'],
    types: [],
    apis: [{
      file: shell,
      name: 'PiletApi',
    }],
    noModuleDeclaration: true,
    plugins: [createDiffPlugin(shell)],
  });
  expect(result).toBe(`import * as React from 'react';

/**
 * Custom extension slots outside of piral-core.
 */
export interface PiralCustomExtensionSlotMap {
  foo: {
    num: React.FC<any>;
  };
}`);
});
