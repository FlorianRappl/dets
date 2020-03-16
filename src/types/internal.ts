import * as ts from 'typescript';

/**
 * Expose the internal TypeScript APIs that are used by TypeDoc
 */
declare module 'typescript' {
  interface Symbol {
    id?: number;
    parent?: ts.Symbol;
    target?: any;
    declaredType?: ts.Type;
  }

  interface Type {
    id?: number;
    typeName?: ts.Identifier;
    kind?: ts.SyntaxKind;
    intrinsicName?: string;
    parent?: ts.Type;
    typeParameters?: Array<ts.TypeParameter>;
    typeParameter?: ts.TypeParameter;
  }

  interface Node {
    symbol?: ts.Symbol;
    aliasSymbol?: ts.Symbol;
    localSymbol?: ts.Symbol;
  }

  interface Declaration {
    questionToken?: ts.Token<ts.SyntaxKind.QuestionToken>;
    dotDotDotToken?: ts.Token<ts.SyntaxKind.DotDotDotToken>;
    default?: ts.Node;
    type?: ts.Node;
  }

  interface Expression {
    text?: string;
  }

  interface SourceFile {
    resolvedModules: ts.Map<ts.ResolvedModule>;
  }
}
