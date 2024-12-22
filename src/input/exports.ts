import * as ts from 'typescript';
import { getDeclarationFromNode, getParameterName, isDefaultExport } from '../helpers';
import { DeclVisitorContext } from '../types';

export function includeExports(context: DeclVisitorContext, key: string, symbol: ts.Symbol) {
  const defs = {};

  if (symbol) {
    context.checker.getExportsOfModule(symbol).forEach((exp) => {
      const decl = exp.valueDeclaration || exp.declarations?.[0];

      if (!decl) {
        // skip - not really defined
      } else if (ts.isExportSpecifier(decl)) {
        const name = decl.name?.text;

        if (name) {
          defs[name] = getDeclarationFromNode(context.checker, decl);
        }
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
        const name = isDefaultExport(decl) ? 'default' : decl.name?.text;

        if (name) {
          defs[name] = decl;
        }
      } else if (ts.isMethodDeclaration(decl) || ts.isPropertyDeclaration(decl)) {
        // skip - mostly from ambient modules
      } else if (ts.isModuleDeclaration(decl)) {
        defs[decl.name.text] = decl;
      } else if (ts.isImportEqualsDeclaration(decl)) {
        //skip - automatically "introduced"
      } else if (ts.isNamespaceExport(decl)) {
        defs[decl.name.text] = decl;
      } else {
        context.log.warn(`Skipping import of unknown node (kind: ${decl.kind}).`);
      }
    });
  }

  context.availableImports[key] = defs;
}
