import { getLibRefName } from './helpers';
import { TypeModel, TypeModelRef } from './types';

export function findRefs(types: Array<TypeModel>) {
  const queue = [...types];
  const refs: Array<TypeModelRef> = [];

  for (let i = 0; i < queue.length; i++) {
    const type = queue[i];

    switch (type?.kind) {
      case 'ref':
        refs.push(type);
        break;
      case 'alias':
        queue.push(type.child, ...type.types);
        break;
      case 'function':
        queue.push(...type.parameters, type.returnType, ...type.types);
        break;
      case 'default':
        queue.push(type.value);
        break;
      case 'const':
        queue.push(type.value);
        break;
      case 'interface':
        queue.push(...type.extends, type.mapped, ...type.props, ...type.types);
        break;
      case 'class':
        queue.push(...type.extends, ...type.implements, ...type.props, ...type.types);
        break;
      case 'enumLiteral':
        queue.push(...type.values);
        break;
      case 'member':
        queue.push(type.value);
        break;
      case 'prop':
        queue.push(type.valueType);
        break;
      case 'typeParameter':
        queue.push(type.constraint, type.parameter);
        break;
      case 'parameter':
        queue.push(type.value);
        break;
      case 'union':
        queue.push(...type.types);
        break;
      case 'intersection':
        queue.push(...type.types);
        break;
      case 'index':
        queue.push(type.valueType, ...type.parameters);
        break;
      case 'indexedAccess':
        queue.push(type.index, type.object);
        break;
      case 'conditional':
        queue.push(type.alternate, type.check, type.extends, type.primary);
        break;
      case 'substitution':
        queue.push(type.variable);
        break;
      case 'tuple-prop':
        queue.push(type.valueType);
        break;
      case 'tuple':
        queue.push(...type.types);
        break;
      case 'constructor':
        queue.push(...type.parameters);
        break;
      case 'keyof':
        queue.push(type.value);
        break;
      case 'readonly':
        queue.push(type.value);
        break;
      case 'unique':
        queue.push(type.value);
        break;
      case 'predicate':
        queue.push(type.value);
        break;
      case 'mapped':
        queue.push(type.constraint, type.value);
        break;
      case 'infer':
        queue.push(type.parameter);
        break;
      case 'new':
        queue.push(...type.parameters, type.returnType, ...type.types);
        break;
      case 'get':
        queue.push(type.type);
        break;
      case 'set':
        queue.push(...type.parameters);
        break;
      case 'parenthesis':
        queue.push(type.value);
        break;
      case 'rest':
        queue.push(type.value);
        break;
      case 'template':
        queue.push(...type.parts.map((m) => (typeof m !== 'string' ? m : undefined)).filter(Boolean));
        break;
      default:
        break;
    }
  }

  return refs;
}

export function updateImports(imprts: Array<string>, refs: Array<TypeModelRef>) {
  for (let i = imprts.length; i--; ) {
    const refName = getLibRefName(imprts[i]);
    const prefix = `${refName}.`;
    const hasRef = refs.some((ref) => ref.refName.startsWith(prefix));

    if (!hasRef) {
      imprts.splice(i, 1);
    }
  }
}
