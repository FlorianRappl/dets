import * as ts from 'typescript';
import { shouldInclude } from '../helpers';
import { DeclVisitorContext } from '../types';

export function includeTypings(context: DeclVisitorContext, node: ts.Node) {
  if (shouldInclude(node)) {
    context.exports.push(node);
  } else {
    context.log.verbose(`Skipping typings from node: ${node}`);
  }
}
