import { Node, isInterfaceDeclaration } from 'typescript';
import { DeclVisitorContext } from '../types';

export function includeApi(context: DeclVisitorContext, node: Node, interfaceName: string) {
  if (isInterfaceDeclaration(node) && node.name.text === interfaceName) {
    context.exports.push(node);
  }
}
