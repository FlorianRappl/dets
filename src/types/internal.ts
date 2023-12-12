import * as ts from 'typescript';

export interface ResolvedModuleArg {
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

export type ResolvedModuleCallback = (value: ResolvedModuleArg, key: string) => void;

export interface ValueTextRange extends ts.TextRange {
  value: string;
}

export interface PragmaInfo {
  arguments: {
    path: ValueTextRange;
  };
  range: ts.CommentRange;
}

/**
 * Expose the internal TypeScript APIs that are used bwy TypeDoc
 */
declare module 'typescript' {
  interface Symbol {
    parent?: ts.Symbol;
  }

  interface Node {
    symbol?: ts.Symbol;
    aliasSymbol?: ts.Symbol;
  }

  interface Program {
    forEachResolvedModule?(cb: ResolvedModuleCallback, file: SourceFile): void;
  }

  interface SourceFile {
    // For ts pre-5.3
    resolvedModules?: Map<string, ResolvedModuleArg>;
    pragmas?: Map<string, PragmaInfo | Array<PragmaInfo>>;
  }
}
