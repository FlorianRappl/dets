import { Identifier, IndexInfo, Symbol } from 'typescript';
import { typesRoot, modulesRoot, anonymousIndicator, globalIndicator } from './constants';

export function isAnonymous(name: string) {
  return name === anonymousIndicator;
}

export function getRefName(libName: string) {
  if (libName[0] === '@') {
    libName = libName.substr(1);
  }

  const parts = libName.split(/[\/\-]/g);
  return parts.map(p => p[0].toUpperCase() + p.substr(1)).join('');
}

export function getLibName(fileName: string) {
  if (fileName) {
    if (fileName.indexOf(typesRoot) !== -1) {
      const start = fileName.lastIndexOf(typesRoot) + typesRoot.length;
      const name = fileName
        .substr(start)
        .split('/')
        .shift();

      if (name.indexOf('__') !== -1) {
        const [scope, lib] = name.split('__');
        return `@${scope}/${lib}`;
      }

      return name;
    } else if (fileName.indexOf(modulesRoot) !== -1) {
      const start = fileName.lastIndexOf(modulesRoot) + modulesRoot.length;
      const [scope, lib] = fileName.substr(start).split('/');

      if (scope.indexOf('@') === 0) {
        return `${scope}/${lib}`;
      }

      return scope;
    }
  }

  return undefined;
}

export function getLib(fileName: string, imports: Array<string>) {
  const libName = getLibName(fileName);

  if (libName && imports.includes(libName)) {
    return libName;
  }

  return undefined;
}

export function getKeyName(info: IndexInfo) {
  return (<Identifier>info?.declaration?.parameters?.[0].name)?.text ?? 'index';
}

export function getGlobalName(symbol: Symbol) {
  const { parent, name } = symbol;

  if (parent.name !== globalIndicator) {
    return `${getGlobalName(parent)}.${name}`;
  }

  return name;
}
