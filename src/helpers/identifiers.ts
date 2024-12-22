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
import { relative, extname } from 'path';
import { typesRoot, modulesRoot, anonymousIndicator, globalIndicator } from './constants';

export function isAnonymous(name: string) {
  return name === anonymousIndicator;
}

export function getLibRefName(libName: string) {
  if (libName[0] === '@') {
    libName = libName.substring(1);
  }

  const parts = libName.split(/[\/\-\.]/g);
  return parts.map(p => p[0].toUpperCase() + p.substring(1)).join('');
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

export function getExportName(name: Identifier | StringLiteral | NumericLiteral): string {
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
  const ext = extname(fileName);
  const file = !relFile.startsWith('.') ? `./${relFile}` : relFile;
  return file.substring(0, file.length - ext.length);
}

export function getLibName(fileName: string, root: string) {
  if (fileName) {
    if (fileName.indexOf(typesRoot) !== -1) {
      const start = fileName.lastIndexOf(typesRoot) + typesRoot.length;
      const name = fileName
        .substring(start)
        .split('/')
        .shift();

      if (name.indexOf('__') !== -1) {
        const [scope, lib] = name.split('__');
        return `@${scope}/${lib}`;
      }

      return name;
    } else if (fileName.indexOf(modulesRoot) !== -1) {
      const start = fileName.lastIndexOf(modulesRoot) + modulesRoot.length;
      const [scope, lib] = fileName.substring(start).split('/');

      if (scope.indexOf('@') === 0) {
        return `${scope}/${lib}`;
      }

      return scope;
    } else {
      return makeModule(fileName, root);
    }
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

export function getGlobalName(symbol: Symbol) {
  const { parent, name } = symbol;

  if (parent.name !== globalIndicator) {
    return `${getGlobalName(parent)}.${name}`;
  }

  return name;
}
