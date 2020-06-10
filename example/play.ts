import { resolve } from 'path';
import { generateDeclaration } from '../src';

console.log(
  generateDeclaration({
    name: 'piral-sample',
    root: resolve(__dirname, '..', 'tests', 'assets'),
    files: ['defaults4.ts'],
    types: ['defaults4.ts'],
    apis: [],
    imports: ['react'],
  }),
);
