import * as ts from 'typescript';
import { getPropName, getDeclarationFromNode } from '../helpers';
import { DeclVisitorContext } from '../types';

export function includeClauses(
  context: DeclVisitorContext,
  clauses: Array<ts.HeritageClause>,
  newClause: ts.HeritageClause,
  tags: Array<ts.JSDocTagInfo> = [],
) {
  const types: Array<ts.ExpressionWithTypeArguments> = [];

  for (const clause of newClause.types) {
    const decl = getDeclarationFromNode(context.checker, clause.expression);
    const name = decl?.symbol?.name;

    // check if we should remove the clause
    if (decl && !tags.some((m) => m.name === 'dets_removeclause' && m.text === name)) {
      types.push(clause);
    }
  }

  clauses.push({
    ...newClause,
    types: ts.createNodeArray(types),
  });
}

export function includeProp(props: Array<ts.TypeElement>, newProp: ts.TypeElement, tags: Array<ts.JSDocTagInfo> = []) {
  const name = getPropName(newProp.name);

  // check if we should remove the prop
  if (tags.some((m) => m.name === 'dets_removeprop' && m.text === name)) {
    return;
  }

  for (const oldProp of props) {
    if (oldProp.kind === newProp.kind && getPropName(oldProp.name) === name) {
      if (!ts.isMethodSignature(newProp)) {
        return;
      }
    }
  }

  props.push(newProp);
}
