import {
  stringifyComment,
  stringifyNode,
  stringifyTypeArgs,
  stringifyInterface,
  stringifyEnum,
  stringifySignature,
} from './stringify';
import { TypeModel, TypeRefs } from '../types';

export function stringifyExport(name: string, type: TypeModel) {
  switch (type?.kind) {
    case 'object':
      const x = type.extends.length > 0 ? ` extends ${type.extends.map(stringifyNode).join(', ')}` : '';
      return `${stringifyComment(type)}export interface ${name}${stringifyTypeArgs(type)}${x} ${stringifyInterface(
        type,
      )}`;
    case 'alias':
      return `${stringifyComment(type)}export type ${name}${stringifyTypeArgs(type)} = ${stringifyNode(type.child)};`;
    case 'enumLiteral':
      const e = type.const ? 'const enum' : 'enum';
      return `${stringifyComment(type)}export ${e} ${name} ${stringifyEnum(type.values)}`;
    case 'default':
      return `${stringifyComment(type)}export default ${stringifyNode(type.value)};`;
    case 'const':
      return `${stringifyComment(type)}export const ${name}: ${stringifyNode(type.value)};`;
    case 'function':
      return `${stringifyComment(type)}export function ${name}${stringifySignature(type)};`;
    case 'default':
      return `${stringifyComment(type)}export default ${stringifyNode(type.value)};`;
  }

  return '';
}

export function stringifyExports(refs: TypeRefs) {
  return Object.keys(refs)
    .map(r => stringifyExport(r, refs[r]))
    .filter(m => !!m)
    .join('\n\n');
}
