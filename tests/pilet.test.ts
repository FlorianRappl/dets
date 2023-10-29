import { resolve } from 'path';
import { createDiffPlugin } from '../src';
import { runTestFor } from './helper';

test('should handle simple declaration diffing (pilet from app shell)', () => {
  const shell = resolve(__dirname, 'assets', 'pilet-shell.ts');
  const result = runTestFor('pilet-entry.ts', {
    name: 'pilet',
    imports: ['react'],
    types: [],
    apis: [{
      file: shell,
      name: 'PiletApi',
    }],
    noModuleDeclaration: true,
    plugins: [createDiffPlugin(shell)],
  });
  expect(result).toBe(``);
});
