import { stringifyExports } from './exports';
import { TypeRefs } from '../types';

export function stringifyModule(name: string, refs: TypeRefs) {
  const content = stringifyExports(refs);
  const formattedContent = content
    .split('\n')
    .map(line => `  ${line}\n`)
    .join('');
  return `declare module "${name}" {\n${formattedContent}}`;
}
