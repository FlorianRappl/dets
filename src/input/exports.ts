import * as ts from 'typescript';
import { DeclVisitorContext } from '../types';

export function includeExports(context: DeclVisitorContext, key: string, symbol: ts.Symbol) {
  const exports = context.checker.getExportsOfModule(symbol);
  context.availableImports[key] = exports
    .map(exp => exp.valueDeclaration || exp.declarations?.[0])
    .filter(m => m !== undefined);
}
