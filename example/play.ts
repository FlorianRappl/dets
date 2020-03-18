import { resolve } from 'path';
import { generateDeclaration } from '../src';

console.log(
  generateDeclaration({
    name: 'piral-sample',
    root: resolve(__dirname, '..', 'tests', 'assets'),
    files: ['merge1.ts', 'merge1-one.ts', 'merge1-two.ts'],
    types: ['merge1.ts'],
    apis: [],
    imports: [],
  }),
);
