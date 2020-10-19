import {
  Node,
  Symbol,
  SyntaxKind,
  SymbolFlags,
  Declaration,
  ModifierFlags,
  getCombinedModifierFlags,
  isIdentifier,
  ExportAssignment,
  isExportAssignment,
  isTypeOperatorNode,
  TypeOperatorNode,
  isTypeReferenceNode,
  TypeReferenceNode,
  isInferTypeNode,
  InferTypeNode,
  isUnionTypeNode,
  UnionTypeNode,
  TypeChecker,
  isImportSpecifier,
  isModuleDeclaration,
  isSourceFile,
  isStringLiteral,
  isMethodDeclaration,
  isMethodSignature,
  isExportDeclaration,
  JSDocTagInfo,
  SymbolDisplayPart,
} from 'typescript';

export function getModule(node: Node): string {
  while (node) {
    // only string literal declared top-level modules are external modules
    if (isModuleDeclaration(node) && isSourceFile(node.parent) && isStringLiteral(node.name)) {
      return node.name.text;
    }

    node = node.parent;
  }

  return undefined;
}

export function getJsDocs(checker: TypeChecker, node: Node) {
  if (isMethodDeclaration(node) || isMethodSignature(node)) {
    const sign = checker.getSignatureFromDeclaration(node);

    if (sign) {
      return {
        comment: sign.getDocumentationComment(checker),
        tags: sign.getJsDocTags(),
      };
    }
  }

  return {
    comment: node.symbol?.getDocumentationComment(checker),
    tags: node.symbol?.getJsDocTags(),
  };
}

const newLineTags = ['example'];
const removedTags = ['removeprop', 'removeclause'];

export function stringifyJsDocs(doc: { comment?: Array<SymbolDisplayPart>; tags?: Array<JSDocTagInfo> }): string {
  const tags = (doc.tags || [])
    .filter((m) => !removedTags.includes(m.name))
    .map((m) => `@${m.name}${newLineTags.includes(m.name) ? '\n' : m.text ? ' ' : ''}${m.text ? m.text : ''}`);

  const result: Array<string> = doc.comment ? doc.comment.map((m) => m.text) : [];

  if (tags) {
    result.push(...tags);
  }

  return result.join('\n');
}

export function getCommentOrDrop(checker: TypeChecker, node: Node, canDrop = false) {
  const doc = getJsDocs(checker, node);

  if (canDrop && doc.tags?.some((m) => m.name === 'ignore')) {
    return true;
  }

  return stringifyJsDocs(doc);
}

export function getComment(checker: TypeChecker, node: Node) {
  const doc = getJsDocs(checker, node);
  return stringifyJsDocs(doc);
}

export function getDeclarationFromSymbol(checker: TypeChecker, symbol: Symbol): Declaration {
  if (!symbol) {
    return undefined;
  } else if (symbol.flags === SymbolFlags.Alias) {
    const aliasSymbol = checker.getAliasedSymbol(symbol);
    return getDeclarationFromSymbol(checker, aliasSymbol);
  } else {
    const decl = symbol.valueDeclaration || symbol.declarations?.[0];

    if (decl && isImportSpecifier(decl)) {
      return getDeclarationFromNode(checker, decl.name);
    }

    return decl;
  }
}

export function getDeclarationFromNode(checker: TypeChecker, node: Node): Declaration {
  const symbol = getSymbol(checker, node);
  return getDeclarationFromSymbol(checker, symbol);
}

export function getSymbol(checker: TypeChecker, node: Node): Symbol {
  const symbol = node.aliasSymbol ?? node.symbol;

  if (symbol) {
    return symbol;
  } else if (isTypeReferenceNode(node)) {
    const ref = node.typeName;
    return ref.aliasSymbol ?? ref.symbol ?? checker.getSymbolAtLocation(ref);
  } else {
    return checker.getSymbolAtLocation(node);
  }
}

export function isDefaultExport(node: Node): node is ExportAssignment {
  return node.symbol?.name === 'default';
}

export function shouldInclude(node: Node) {
  return isModuleDeclaration(node) || isExportDeclaration(node) || isNodeExported(node);
}

export function isNodeExported(node: Node, alsoTopLevel = false): boolean {
  return (
    isExportAssignment(node) ||
    (getCombinedModifierFlags(node as Declaration) & ModifierFlags.Export) !== 0 ||
    (alsoTopLevel && !!node.parent && node.parent.kind === SyntaxKind.SourceFile)
  );
}

export function isKeyOfType(type: Node): type is TypeOperatorNode {
  return type && isTypeOperatorNode(type) && type.operator === SyntaxKind.KeyOfKeyword;
}

export function isUnionType(type: Node): type is UnionTypeNode {
  return type && isUnionTypeNode(type);
}

export function isIdentifierType(type: Node): type is TypeReferenceNode {
  return type && isTypeReferenceNode(type) && isIdentifier(type.typeName);
}

export function isInferType(type: Node): type is InferTypeNode {
  return type && isInferTypeNode(type);
}

export function isPrivate(type: Node) {
  return type.kind === SyntaxKind.PrivateKeyword;
}

export function isStatic(type: Node) {
  return type.kind === SyntaxKind.StaticKeyword;
}

export function isProtected(type: Node) {
  return type.kind === SyntaxKind.ProtectedKeyword;
}

export function isReadonly(type: Node) {
  return type.kind === SyntaxKind.ReadonlyKeyword;
}
