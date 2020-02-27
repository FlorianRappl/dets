import { generateDeclaration } from '../src';
import { resolve } from 'path';

export function runTestFor(name: string) {
  return generateDeclaration({
    name: 'test',
    root: resolve(__dirname, 'assets'),
    files: [name],
    types: [name]
  });
}
