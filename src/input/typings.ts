import { Node, isModuleDeclaration, isExportDeclaration, forEachChild } from 'typescript';
import { includeNode } from './node';
import { swapName } from './utils';
import { isNodeExported } from '../helpers';
import { DeclVisitorContext } from '../types';

export function includeTypings(context: DeclVisitorContext, node: Node) {
  if (isModuleDeclaration(node)) {
    const moduleName = node.name.text;
    const existing = context.modules[moduleName];
    const before = context.refs;
    context.modules[moduleName] = context.refs = existing || {};
    node.body.forEachChild(subNode => {
      if (isNodeExported(subNode)) {
        includeNode(context, subNode);
      }
    });
    context.refs = before;
  } else if (isNodeExported(node)) {
    includeNode(context, node);
  } else if (isExportDeclaration(node)) {
    const moduleName = node.moduleSpecifier?.text;
    const elements = node.exportClause?.elements;

    if (elements) {
      // selected exports here
      elements.forEach(el => {
        if (el.symbol) {
          const original = context.checker.getAliasedSymbol(el.symbol);

          if (original) {
            includeNode(context, original.declarations?.[0]);
            swapName(context, el.symbol.name, original.name);
          } else if (el.propertyName) {
            // renamed selected export
            const symbol = context.checker.getExportSpecifierLocalTargetSymbol(el);

            if (symbol) {
              const newName = el.symbol.name;
              const oldName = el.propertyName.text;
              const decl = symbol?.declarations?.[0];
              includeNode(context, decl);
              swapName(context, newName, oldName);
            }
          }
        }
      });
    } else if (moduleName) {
      // * exports from a module
      const fileName = node.getSourceFile().resolvedModules?.get(moduleName)?.resolvedFileName;

      if (fileName) {
        const newFile = context.program.getSourceFile(fileName);
        forEachChild(newFile, node => includeTypings(context, node));
      }
    }
  }
}
