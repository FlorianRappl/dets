import * as ts from 'typescript';
import { getLibRefName, getPropName, isBaseLib, getModule, getLibName } from '../helpers';
import { DeclVisitorContext, TypeModelRef, TypeModelDefault, TypeModel } from '../types';

export function createBinding(context: DeclVisitorContext, lib: string, name: string) {
  // if we did not use the given lib yet, add it to the used libs
  if (!context.usedImports.includes(lib)) {
    context.usedImports.push(lib);
  }

  return `${getLibRefName(lib)}.${name}`;
}

export function isIncluded(props: Array<ts.TypeElement>, newProp: ts.TypeElement): boolean {
  const name = getPropName(newProp.name);

  for (const oldProp of props) {
    if (oldProp.kind === newProp.kind && getPropName(oldProp.name) === name) {
      if (!ts.isMethodSignature(newProp)) {
        return true;
      }
    }
  }

  return false;
}

export function getDefault(value: TypeModelRef): TypeModelDefault {
  return {
    kind: 'default',
    name: 'default',
    value,
  };
}

export function getRef(refName: string, types: Array<TypeModel> = []): TypeModelRef {
  return {
    kind: 'ref',
    refName,
    types,
  };
}

export function getPackage(node: ts.Node, global: boolean, imports: Record<string, Array<ts.Node>>) {
  const fn = node.getSourceFile()?.fileName;
  const base = isBaseLib(fn) || false;

  if (!base) {
    const libName = getLibName(fn);
    const [lib] = Object.keys(imports).filter(name => {
      if (global) {
        return name === libName;
      } else {
        return imports[name].includes(node);
      }
    });

    return {
      external: !!lib,
      moduleName: (lib && getModule(node)) || lib,
      base,
      lib,
      fn,
    };
  }

  return {
    external: true,
    moduleName: undefined,
    base,
    lib: undefined,
    fn,
  };
}
