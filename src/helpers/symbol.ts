import { Symbol, SymbolFlags } from 'typescript';
import { globalIndicator } from './constants';
import { isPrivate, isProtected, isStatic, isReadonly } from './node';

export function fullyQualifiedName(symbol: Symbol) {
  const parts = [];

  do {
    parts.push(symbol.name);
    symbol = symbol.parent;
  } while (symbol && symbol.flags === SymbolFlags.NamespaceModule && symbol.name !== globalIndicator);

  return parts.reverse().join('.');
}

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
  const decorators: Array<string> = [];

  if (symbol) {
    const modifiers = symbol.declarations?.[0]?.modifiers ?? [];
    modifiers.some(isPrivate) && decorators.push('private');
    modifiers.some(isProtected) && decorators.push('protected');
    modifiers.some(isStatic) && decorators.push('static');
    modifiers.some(isReadonly) && decorators.push('readonly');
  }

  return decorators.join(' ');
}
