import {
  Node,
  isTypeAliasDeclaration,
  isVariableDeclaration,
  isVariableStatement,
  isFunctionDeclaration,
  TypeFlags,
} from 'typescript';
import {
  includeExportedTypeAlias,
  includeDefaultExport,
  includeExportedVariable,
  includeExportedFunction,
  includeExportedType,
} from './visit';
import { isDefaultExport } from '../helpers';
import { DeclVisitorContext } from '../types';

export function includeNode(context: DeclVisitorContext, node: Node) {
  if (node) {
    if (isTypeAliasDeclaration(node)) {
      includeExportedTypeAlias(context, node);
    } else if (isDefaultExport(node)) {
      includeDefaultExport(context, node);
    } else {
      const type = context.checker.getTypeAtLocation(node);

      if (isVariableDeclaration(node)) {
        includeExportedVariable(context, node);
      } else if (isVariableStatement(node)) {
        node.declarationList.declarations.forEach(decl => {
          includeExportedVariable(context, decl);
        });
      } else if (isFunctionDeclaration(node)) {
        includeExportedFunction(context, node);
      } else if (type.flags !== TypeFlags.Any) {
        includeExportedType(context, type);
      } else {
        context.warn(`Could not resolve type at position ${node.pos} of "${node.getSourceFile()?.fileName}".`);
      }
    }
  }
}
