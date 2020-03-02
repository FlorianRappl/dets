import {
  stringifyComment,
  stringifyNode,
  stringifyTypeArgs,
  stringifyEnum,
  stringifyClass,
  stringifyInterface,
  stringifySignature,
  stringifyExtends,
} from './stringify';
import { TypeModel, TypeRefs } from '../types';

export function stringifyExport(name: string, type: TypeModel) {
  switch (type?.kind) {
    case 'object':
      return `${stringifyComment(type)}export interface ${name}${stringifyTypeArgs(type)}${stringifyExtends(
        type,
      )} ${stringifyInterface(type)}`;
    case 'class':
      return `${stringifyComment(type)}export class ${name}${stringifyTypeArgs(type)}${stringifyExtends(
        type,
      )} ${stringifyClass(type)}`;
    case 'alias':
      return `${stringifyComment(type)}export type ${name}${stringifyTypeArgs(type)} = ${stringifyNode(type.child)};`;
    case 'enumLiteral':
      return `${stringifyComment(type)}export ${type.const ? 'const enum' : 'enum'} ${name} ${stringifyEnum(
        type.values,
      )}`;
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
