import { resolve } from 'path';
import { generateDeclaration } from '../src';

generateDeclaration({
  name: 'piral-sample',
  root: resolve(__dirname, '..', 'tests', 'assets'),
  files: ['react8.tsx'],
  types: ['react8.tsx'],
  apis: [],
  imports: ['react'],
}).then((res) => console.log(res));
