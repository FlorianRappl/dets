import {
  Identifier,
  IndexInfo,
  Symbol,
  PropertyName,
  isIdentifier,
  isStringLiteral,
  isNumericLiteral,
  EntityName,
  ThisTypeNode,
  BindingName,
  isObjectBindingPattern,
  isArrayBindingPattern,
  OmittedExpression,
  isBindingElement,
  ArrayBindingElement,
  ModuleName,
} from 'typescript';
import { typesRoot, modulesRoot, anonymousIndicator, globalIndicator } from './constants';

export function isAnonymous(name: string) {
  return name === anonymousIndicator;
}

export function getLibRefName(libName: string) {
  if (libName[0] === '@') {
    libName = libName.substr(1);
  }

  const parts = libName.split(/[\/\-]/g);
  return parts.map(p => p[0].toUpperCase() + p.substr(1)).join('');
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

export function getPropName(name: PropertyName): string {
  if (!name) {
    return undefined;
  } else if (isIdentifier(name)) {
    return name.text;
  } else if (isStringLiteral(name)) {
    return name.text;
  } else if (isNumericLiteral(name)) {
    return name.text;
  } /* isComputedPropertyName(name) */ else {
    return name.getText();
  }
}

export function getParameterElement(element: ArrayBindingElement): string {
  return isBindingElement(element) ? getParameterName(element.name) : getParameterName(element);
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

export interface LibSpecifier {
  packageName: string;
  moduleName: string;
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
