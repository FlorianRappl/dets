import { stringifyExports } from './exports';
import { formatContent } from '../helpers';
import { TypeRefs } from '../types';

export function stringifyModule(name: string, refs: TypeRefs) {
  const content = stringifyExports(refs);
  const formattedContent = formatContent(content);
  return `declare module "${name}" {\n${formattedContent}}`;
}
