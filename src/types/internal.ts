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
    resolvedModules: Map<
      string,
      {
        // For ts 4.x
        resolvedFileName?: string;
        // For ts 5.x
        resolvedModule: {
          resolvedFileName: string | undefined;
          originalPath: string | undefined;
          extension: string;
          isExternalLibraryImport: boolean;
          packageId: string | undefined;
          resolvedUsingTsExtension: boolean;
        };
        failedLookupLocations: string | undefined;
        affectingLocations: string | undefined;
        resolutionDiagnostics: string | undefined;
        node10Result: string | undefined;
      }
    >;
  }
}
