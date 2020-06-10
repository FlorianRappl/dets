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

function resolveTypes(typeRoot: string) {
  const typePath = require.resolve(typeRoot);
  return typePath.replace(/\.js$/, '.d.ts');
}

export function getPiralBaseTypes() {
  return resolveTypes('piral-base/lib/types');
}

export function getPiralCoreTypes() {
  return resolveTypes('piral-core/lib/types');
}

export function getPiralBaseApi() {
  return {
    file: getPiralBaseTypes(),
    name: 'PiletApi',
  };
}
