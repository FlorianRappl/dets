import { Node, TypeChecker, isMethodDeclaration, isMethodSignature, JSDocTagInfo, SymbolDisplayPart, isCallSignatureDeclaration } from 'typescript';

function isUnique<T>(value: T, index: number, self: Array<T>) {
  return self.indexOf(value) === index;
}

export function getAllJsDocs(checker: TypeChecker, decls: Array<Node>) {
  const allDocs = decls.map((decl) => getJsDocs(checker, decl));
  return {
    comment: allDocs
      .map((m) => m.comment)
      .reduce((p, c) => [...p, ...c], [])
      .filter(isUnique),
    tags: allDocs
      .map((m) => m.tags)
      .reduce((p, c) => [...p, ...c], [])
      .filter(isUnique),
  };
}

export function getJsDocs(checker: TypeChecker, node: Node) {
  if (isMethodDeclaration(node) || isMethodSignature(node) || isCallSignatureDeclaration(node)) {
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
const removedTags = ['dets_removeprop', 'dets_removeclause', 'dets_preserve', 'dets_ignore'];

function stringifyJsDocTagText(txt: string | Array<{ text: string; kind: string }>) {
  if (typeof txt === 'string') {
    // quick fix for URLs (e.g., in React documentation), just remove first space
    if (txt.startsWith('http ://') || txt.startsWith('https ://')) {
      return txt.replace(' ', '');
    }

    return txt;
  } else if (Array.isArray(txt)) {
    return txt.map((s) => s.text).join('');
  }

  return '';
}

export function stringifyJsDocs(doc: { comment?: Array<SymbolDisplayPart>; tags?: Array<JSDocTagInfo> }): string {
  const tags = (doc.tags || [])
    .filter((m) => !removedTags.includes(m.name))
    .map((m) => `@${m.name}${newLineTags.includes(m.name) ? '\n' : m.text ? ' ' : ''}${stringifyJsDocTagText(m.text)}`);

  const result: Array<string> = doc.comment ? doc.comment.map((m) => m.text) : [];

  if (tags) {
    result.push(...tags);
  }

  return result.join('\n');
}

function shouldDrop(canDrop: boolean, tags?: Array<JSDocTagInfo>) {
  let found = false;

  if (tags) {
    for (const tag of tags) {
      switch (tag.name) {
        case 'ignore':
          found = canDrop;
          break;
        case 'dets_ignore':
          return true;
        case 'dets_preserve':
          return false;
      }
    }
  }

  return found;
}

export function getCommentOrDrop(checker: TypeChecker, node: Node, canDrop = false): string | undefined {
  const doc = getJsDocs(checker, node);

  if (shouldDrop(canDrop, doc.tags)) {
    return undefined;
  }

  return stringifyJsDocs(doc);
}

export function getComment(checker: TypeChecker, node: Node) {
  const doc = getJsDocs(checker, node);
  return stringifyJsDocs(doc);
}
