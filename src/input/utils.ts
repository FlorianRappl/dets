import * as ts from 'typescript';
import { getLibRefName, isBaseLib, getModule, getLibName } from '../helpers';
import {
  DeclVisitorContext,
  TypeModelRef,
  TypeModelDefault,
  TypeModel,
  ImportRefs,
  ImportDefs,
  TypeModelClass,
} from '../types';

export function createBinding(context: DeclVisitorContext, lib: string, name: string) {
  // if we did not use the given lib yet, add it to the used libs
  if (!context.usedImports.includes(lib)) {
    context.usedImports.push(lib);
  }

  return `${getLibRefName(lib)}.${name}`;
}

export function getDefault(value: TypeModelRef | TypeModelClass): TypeModelDefault {
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

function getSymbolName(imports: ImportDefs, node: ts.Node): string {
  if (imports) {
    for (const name of Object.keys(imports)) {
      if (imports[name] === node) {
        return name;
      }
    }
  }

  return undefined;
}

export function getPackage(node: ts.Node, global: boolean, imports: ImportRefs) {
  const fn = node.getSourceFile()?.fileName;
  const base = isBaseLib(fn) || false;

  if (!base) {
    const libName = getLibName(fn);
    const [lib] = Object.keys(imports).filter((name) => {
      if (global) {
        return name === libName;
      } else {
        return Object.values(imports[name]).includes(node);
      }
    });
    const symbolName = getSymbolName(imports[lib], node);

    return {
      external: !!lib,
      moduleName: (lib && getModule(node)) || lib,
      symbolName,
      base,
      lib,
      fn,
    };
  }

  return {
    external: true,
    moduleName: undefined,
    symbolName: undefined,
    base,
    lib: undefined,
    fn,
  };
}
