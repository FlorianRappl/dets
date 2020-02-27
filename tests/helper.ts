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
