import * as ts from 'typescript';

/**
 * Expose the internal TypeScript APIs that are used by TypeDoc
 */
declare module 'typescript' {
  interface Symbol {
    parent?: ts.Symbol;
  }

  interface Node {
    symbol?: ts.Symbol;
    aliasSymbol?: ts.Symbol;
  }

  interface SourceFile {
    resolvedModules: ts.Map<ts.ResolvedModuleFull>;
  }
}
