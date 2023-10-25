import { createExcludePlugin } from '../src';
import { runTestFor } from './helper';

test('should handle simple declaration diffing (pilet from app shell)', () => {
  const result = runTestFor('pilet-entry.ts', {
    name: 'pilet',
    imports: ['react'],
    types: [],
    apis: [],
    plugins: [createExcludePlugin(['pilet'])],
  });
  expect(result).toBe(``);
});
