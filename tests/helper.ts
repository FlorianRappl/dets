import { resolve } from 'path';
import { generateDeclaration, DeclOptions } from '../src';

export function runTestFor(name: string, options: Partial<DeclOptions> = {}) {
  return generateDeclaration({
    name: 'test',
    root: resolve(__dirname, 'assets'),
    files: [name],
    types: [name],
    ...options,
  });
}

export function getPiralCorePath() {
  const piralCoreRoot = 'piral-core/lib/types/api';
  const piralCorePath = require.resolve(piralCoreRoot);
  return piralCorePath.replace(/\.js$/, '.d.ts');
}

export function getPiralCoreApi() {
  return {
    file: getPiralCorePath(),
    name: 'PiletApi',
  };
}
