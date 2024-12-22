import * as ts from 'typescript';
import { isBaseLib, isGlobal, getLibRefName, getModule, getLibName } from '../helpers';
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

export function isImportedFile(node: ts.Node, root: string, imports: ImportRefs) {
  const fn = node.getSourceFile()?.fileName;

  if (fn) {
    const libName = getLibName(fn, root);
    return Object.keys(imports).some((name) => name === libName);
  }

  return false;
}

export function getPackage(node: ts.Node, symbol: ts.Symbol, root: string, imports: ImportRefs) {
  const fn = node.getSourceFile()?.fileName;
  const base = isBaseLib(fn) || false;
  const global = isGlobal(symbol);

  if (!base) {
    const libName = getLibName(fn, root);
    const [lib] = Object.keys(imports).filter((name) => {
      if (global) {
        return name === libName;
      }

      const exports = Object.values(imports[name]);

      if (exports.includes(node)) {
        return true;
      } else if (symbol?.parent?.flags === ts.SymbolFlags.NamespaceModule) {
        const parentNode = symbol.parent?.declarations[0];
        return exports.includes(parentNode);
      }

      return false;
    });
    const symbolName = getSymbolName(imports[lib], node);

    return {
      external: !!lib,
      moduleName: (lib && getModule(node)) || lib,
      symbolName,
      global,
      base,
      lib,
      fn,
    };
  }

  return {
    external: true,
    moduleName: undefined,
    symbolName: undefined,
    global,
    base,
    lib: undefined,
    fn,
  };
}
