import { resolve } from 'path';
import { generateDeclaration } from '../src';

generateDeclaration({
  name: 'piral-sample',
  root: resolve(__dirname, '..', 'tests', 'assets'),
  files: ['prop1.ts'],
  types: ['prop1.ts'],
  apis: [],
  imports: [],
}).then((res) => console.log(res));
