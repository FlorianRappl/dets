import { resolve } from 'path';
import { generateDeclaration } from '../src';

console.log(
  generateDeclaration({
    name: 'piral-sample',
    root: resolve(__dirname, '..', 'tests', 'assets'),
    files: ['import6.ts'],
    types: ['import6.ts'],
    apis: [],
    imports: [],
  }),
);
