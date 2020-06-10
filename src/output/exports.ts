import {
  stringifyComment,
  stringifyNode,
  stringifyTypeArgs,
  stringifyEnum,
  stringifyClass,
  stringifyInterface,
  stringifySignature,
  stringifyExtends,
  stringifyImplements,
  StringifyMode,
} from './stringify';
import { TypeModelExport, TypeRefs } from '../types';

export function stringifyExport(type: TypeModelExport) {
  switch (type?.kind) {
    case 'interface':
      return `${stringifyComment(type)}export interface ${type.name}${stringifyTypeArgs(type)}${stringifyExtends(
        type,
      )} ${stringifyInterface(type)}`;
    case 'class':
      return `${stringifyComment(type)}export class ${type.name}${stringifyTypeArgs(type)}${stringifyExtends(
        type,
      )}${stringifyImplements(type)} ${stringifyClass(type)}`;
    case 'alias':
      return `${stringifyComment(type)}export type ${type.name}${stringifyTypeArgs(type)} = ${stringifyNode(
        type.child,
      )};`;
    case 'enumLiteral':
      return `${stringifyComment(type)}export ${type.const ? 'const enum' : 'enum'} ${type.name} ${stringifyEnum(
        type.values,
      )}`;
    case 'const':
      return `${stringifyComment(type)}export const ${type.name}: ${stringifyNode(type.value)};`;
    case 'function':
      return `${stringifyComment(type)}export function ${type.name}${stringifySignature(
        type,
        StringifyMode.property,
      )};`;
    case 'default':
      const sc = type.value.kind === 'class' ? '' : ';';
      return `${stringifyComment(type)}export default ${stringifyNode(type.value)}${sc}`;
  }

  return '';
}

export function stringifyExports(refs: TypeRefs) {
  return refs
    .map((r) => stringifyExport(r))
    .filter((m) => !!m)
    .join('\n\n');
}
