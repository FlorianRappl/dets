import { resolve } from 'path';
import { generateDeclaration } from '../src';

generateDeclaration({
  name: 'piral-sample',
  root: resolve(__dirname, '..', 'tests', 'assets'),
  files: ['type10.ts'],
  types: ['type10.ts'],
  apis: [],
  imports: ['react'],
}).then((res) => console.log(res));
