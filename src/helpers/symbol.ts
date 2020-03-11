import { Symbol } from 'typescript';
import { globalIndicator } from './constants';
import { isPrivate, isProtected, isStatic } from './node';

export function isGlobal(symbol: Symbol) {
  const parent = symbol?.parent;

  if (parent) {
    if (parent.name === globalIndicator) {
      return true;
    }

    return isGlobal(parent);
  }

  return false;
}

export function getModifiers(symbol: Symbol) {
  const modifiers = symbol.declarations?.[0]?.modifiers ?? [];
  const decorators: Array<string> = [];
  modifiers.some(isPrivate) && decorators.push('private');
  modifiers.some(isProtected) && decorators.push('protected');
  modifiers.some(isStatic) && decorators.push('static');
  return decorators.join(' ');
}
