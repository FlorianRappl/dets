import { resolve } from 'path';
import { generateDeclaration } from '../src';

console.log(
  generateDeclaration({
    name: 'piral-sample',
    root: resolve(__dirname, '..', 'tests', 'assets'),
    files: ['doc1.ts'],
    types: ['doc1.ts'],
    apis: [],
    imports: [],
  }),
);
