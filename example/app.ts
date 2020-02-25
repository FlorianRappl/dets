import { resolve } from 'path';
import { generateDeclaration } from '../src';

const piralCoreRoot = 'piral-core/lib/types/api';

function findPiralCoreApi(root: string) {
  try {
    return require
      .resolve(piralCoreRoot, {
        paths: [root],
      })
      ?.replace(/\.js$/, '.d.ts');
  } catch {
    return undefined;
  }
}

function findDeclaredTypings(root: string) {
  try {
    const { typings } = require(resolve(root, 'package.json'));
    return typings && resolve(root, typings);
  } catch {
    return undefined;
  }
}

//const root = resolve(__dirname, "../../../Temp/piral-instance-094");
//const root = resolve(__dirname, "../../../Smapiot/piral/src/samples/sample-piral");
//const root = resolve(__dirname, "../../../Piral-Playground/piral-010");
//const root = resolve(__dirname, "../../../Piral-Playground/piral-010-alpha");
//const root = resolve(__dirname, "../../../Smapiot/piral/src/samples/sample-cross-fx");
const root = resolve(__dirname, '../../../Piral-Playground/shell-mwe');
//const root = resolve(__dirname, "../../../Temp/shell-mwe");

console.log(
  generateDeclaration({
    name: 'piral-sample',
    root,
    files: ['src/index.tsx'],
    types: [findDeclaredTypings(root)],
    apis: [
      {
        file: findPiralCoreApi(root),
        name: 'PiletApi',
      },
    ],
    imports: [
      'vue',
      'react',
      'angular',
      'inferno',
      'preact',
      'react-router',
      '@libre/atom',
      'riot',
      'styled-components',
    ],
  }),
);
