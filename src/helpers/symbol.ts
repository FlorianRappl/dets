import { Symbol } from 'typescript';
import { globalIndicator } from './constants';

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
