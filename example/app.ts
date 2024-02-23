import { resolve } from 'path';
import { generateDeclaration } from '../src';

const piralCoreRoot = 'piral-base/lib/types';

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

    if (typings) {
      return [resolve(root, typings)];
    }
  } catch {}

  return [];
}

// const root = resolve('/mnt/d/Code/Smapiot/piral/src/samples/sample-piral-core');

// console.log(
//   generateDeclaration({
//     name: 'sample-piral-core',
//     root,
//     files: ['src/index.tsx'],
//     types: findDeclaredTypings(root),
//     apis: [
//       {
//         file: findPiralCoreApi(root),
//         name: 'PiletApi',
//       },
//     ],
//     imports: [
//       'react',
//       'react-router',
//       '@libre/atom',
//     ],
//   }),
// );

//const root = resolve(__dirname, "../../../Temp/piral-instance-094");
//const root = resolve(__dirname, "../../../Smapiot/piral/src/samples/sample-piral");
//const root = resolve(__dirname, "../../../Piral-Playground/piral-010");
//const root = resolve(__dirname, "../../../Piral-Playground/piral-010-alpha");
//const root = resolve(__dirname, "../../../Smapiot/piral/src/samples/sample-cross-fx");
//const root = resolve(__dirname, '../../../Piral-Playground/shell-mwe');
const root = resolve(__dirname, '../../../Temp/shell-mwe');

generateDeclaration({
  name: 'piral-sample',
  root,
  files: ['src/index.tsx'],
  types: findDeclaredTypings(root),
  apis: [
    {
      file: findPiralCoreApi(root)!,
      name: 'PiletApi',
    },
  ],
  imports: ['vue', 'react', 'angular', 'inferno', 'preact', 'react-router', '@libre/atom', 'riot', 'styled-components'],
}).then((res) => console.log(res));
