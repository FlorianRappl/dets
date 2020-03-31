import * as ts from 'typescript';
import { getDeclarationFromNode } from '../helpers';
import { DeclVisitorContext } from '../types';

export function includeExports(context: DeclVisitorContext, key: string, symbol: ts.Symbol) {
  const exports = context.checker.getExportsOfModule(symbol);
  context.availableImports[key] = exports
    .map(exp => {
      const decl = exp.valueDeclaration || exp.declarations?.[0];

      if (decl?.kind === ts.SyntaxKind.ExportSpecifier) {
        return getDeclarationFromNode(context.checker, decl);
      }

      return decl;
    })
    .filter(m => m !== undefined);
}
