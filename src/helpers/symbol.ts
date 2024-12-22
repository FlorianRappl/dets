import { Symbol, SymbolFlags } from 'typescript';
import { globalIndicator } from './constants';
import { isPrivate, isPublic, isProtected, isStatic, isReadonly } from './node';

export function fullyQualifiedName(symbol: Symbol, delimiter: string) {
  const parts: Array<string> = [];

  do {
    parts.push(symbol.name);
    symbol = symbol.parent;
  } while (symbol && symbol.flags === SymbolFlags.NamespaceModule && symbol.name !== globalIndicator);

  return parts.reverse().join(delimiter);
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

export function getSymbolName(symbol: Symbol): string {
  if (symbol.flags === SymbolFlags.EnumMember) {
    return `${symbol.parent.name}.${symbol.name}`;
  } else if (symbol.parent?.flags === SymbolFlags.NamespaceModule) {
    return fullyQualifiedName(symbol, '.');
  }

  return symbol.name;
}

export function getModifiers(symbol: Symbol) {
  const decorators: Array<string> = [];

  if (symbol) {
    // @ts-ignore
    const modifiers = symbol.declarations?.[0]?.modifiers ?? [];
    modifiers.some(isPrivate) && decorators.push('private');
    modifiers.some(isPublic) && decorators.push('public');
    modifiers.some(isProtected) && decorators.push('protected');
    modifiers.some(isStatic) && decorators.push('static');
    modifiers.some(isReadonly) && decorators.push('readonly');
  }

  return decorators.join(' ');
}
