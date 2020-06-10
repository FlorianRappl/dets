import * as ts from 'typescript';
import { getDeclarationFromNode, getParameterName } from '../helpers';
import { DeclVisitorContext } from '../types';

export function includeExports(context: DeclVisitorContext, key: string, symbol: ts.Symbol) {
  const defs = {};

  if (symbol) {
    context.checker.getExportsOfModule(symbol).forEach(exp => {
      const decl = exp.valueDeclaration || exp.declarations?.[0];

      if (!decl) {
        // skip - not really defined
      } else if (ts.isExportSpecifier(decl)) {
        defs[decl.name.text] = getDeclarationFromNode(context.checker, decl);
      } else if (ts.isExportAssignment(decl)) {
        defs['default'] = getDeclarationFromNode(context.checker, decl);
      } else if (ts.isVariableDeclaration(decl)) {
        defs[getParameterName(decl.name)] = decl;
      } else if (
        ts.isFunctionDeclaration(decl) ||
        ts.isInterfaceDeclaration(decl) ||
        ts.isClassDeclaration(decl) ||
        ts.isTypeAliasDeclaration(decl) ||
        ts.isEnumDeclaration(decl)
      ) {
        defs[decl.name.text] = decl;
      } else if (ts.isMethodDeclaration(decl) || ts.isPropertyDeclaration(decl) || ts.isModuleDeclaration(decl)) {
        // skip - mostly from ambient modules
      } else if (ts.isImportEqualsDeclaration(decl)) {
        //skip - automatically "introduced"
      } else {
        context.warn(`Skipping import of unknown node (kind: ${decl.kind}).`);
      }
    });
  }

  context.availableImports[key] = defs;
}
