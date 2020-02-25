import { Node, isInterfaceDeclaration } from 'typescript';
import { includeNode } from './node';
import { DeclVisitorContext } from '../types';

export function includeApi(context: DeclVisitorContext, node: Node, interfaceName: string) {
  if (isInterfaceDeclaration(node) && node.name.text === interfaceName) {
    includeNode(context, node);
  }
}
