import { relative, extname } from 'path';
import {
  Identifier,
  IndexInfo,
  Symbol,
  isIdentifier,
  isStringLiteral,
  EntityName,
  ThisTypeNode,
  BindingName,
  isObjectBindingPattern,
  isArrayBindingPattern,
  OmittedExpression,
  isBindingElement,
  ArrayBindingElement,
  StringLiteral,
  NumericLiteral,
} from 'typescript';

import { typesRoot, modulesRoot, anonymousIndicator, globalIndicator } from './constants';

export function isAnonymous(name: string) {
  return name === anonymousIndicator;
}

export function getLibRefName(libName: string) {
  if (libName[0] === '@') {
    libName = libName.substring(1);
  }

  const parts = libName.split(/[\/\-\.]/g);
  return parts.map((p) => p[0].toUpperCase() + p.substring(1)).join('');
}

export function getTypeRefName(name: EntityName): string {
  if (isIdentifier(name)) {
    return name.text;
  } else {
    // must be isQualifiedName(name)
    const ns = getTypeRefName(name.left);
    return `${ns}.${name.right.text}`;
  }
}

export function getPredicateName(name: Identifier | ThisTypeNode): string {
  if (isIdentifier(name)) {
    return name.text;
  } /* is ThisTypeNode */ else {
    return 'this';
  }
}

export function getExportName(name: Identifier | StringLiteral | NumericLiteral): string | undefined {
  if (!name) {
    return undefined;
  } else if (isIdentifier(name)) {
    return name.text;
  } else if (isStringLiteral(name)) {
    return name.text;
  } /* is NumericLiteral */ else {
    return name.text;
  }
}

export function getParameterElement(element: ArrayBindingElement): string {
  const spread = 'dotDotDotToken' in element && element.dotDotDotToken ? '...' : '';
  const name = isBindingElement(element) ? getParameterName(element.name) : getParameterName(element);
  return `${spread}${name}`;
}

export function getParameterName(name: BindingName | OmittedExpression): string {
  if (isIdentifier(name)) {
    return name.text;
  } else if (isObjectBindingPattern(name)) {
    const content = name.elements.map(getParameterElement).join(', ');
    return `{ ${content} }`;
  } else if (isArrayBindingPattern(name)) {
    const content = name.elements.map(getParameterElement).join(', ');
    return `[${content}]`;
  } /* is OmittedExpression */ else {
    return '';
  }
}

function makeModule(fileName: string, root: string) {
  const relFile = relative(root, fileName);
  const file = !relFile.startsWith('.') ? `./${relFile}` : relFile;
  return stripFileExtension(file);
}

function stripFileExtension(fileName: string) {
  return fileName.replace(/(\.d)?\.[cm]?[jt]sx?$/i, '');
}

function stripIndex(moduleName: string) {
  return moduleName.endsWith('/index') ? moduleName.substring(0, moduleName.length - '/index'.length) : moduleName;
}

export function getModuleName(fileName: string | undefined, root: string) {
  if (fileName) {
    if (fileName.indexOf(typesRoot) !== -1) {
      const start = fileName.lastIndexOf(typesRoot) + typesRoot.length;
      const [pkg, ...rest] = fileName.substring(start).split('/');
      const packageName = pkg && pkg.indexOf('__') !== -1 ? `@${pkg.replace('__', '/')}` : pkg;
      const subpath = rest.join('/');
      const suffix = subpath ? stripFileExtension(subpath) : '';
      return stripIndex(suffix ? `${packageName}/${suffix}` : packageName);
    } else if (fileName.indexOf(modulesRoot) !== -1) {
      const start = fileName.lastIndexOf(modulesRoot) + modulesRoot.length;
      const parts = fileName.substring(start).split('/');
      const [head, next, ...rest] = parts;
      const scoped = head.indexOf('@') === 0;
      const packageName = scoped ? `${head}/${next}` : head;
      const subparts = scoped ? rest : [next, ...rest].filter(Boolean);
      const subpath = subparts.join('/');
      const suffix = subpath ? stripFileExtension(subpath) : '';
      return stripIndex(suffix ? `${packageName}/${suffix}` : packageName);
    } else {
      return makeModule(fileName, root);
    }
  }

  return undefined;
}

export function getLibName(fileName: string | undefined, root: string) {
  const moduleName = getModuleName(fileName, root);

  if (moduleName) {
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      return moduleName;
    }

    if (moduleName[0] === '@') {
      return moduleName.split('/').slice(0, 2).join('/');
    }

    return moduleName.split('/').shift();
  }

  return undefined;
}

export interface LibSpecifier {
  packageName: string;
  moduleName: string;
}

export function getKeyName(info: IndexInfo) {
  return (<Identifier>info?.declaration?.parameters?.[0].name)?.text ?? 'index';
}

export function getGlobalName(symbol: Symbol): string {
  const { parent, name } = symbol;

  if (parent && parent.name !== globalIndicator) {
    return `${getGlobalName(parent)}.${name}`;
  }

  return name;
}
