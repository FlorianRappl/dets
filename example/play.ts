import { resolve } from 'path';
import { generateDeclaration } from '../src';

generateDeclaration({
  name: 'piral-sample',
  root: resolve(__dirname, '..', 'tests', 'assets'),
  files: ['react10.tsx'],
  types: ['react10.tsx'],
  apis: [],
  imports: ['react'],
}).then((res) => console.log(res));
