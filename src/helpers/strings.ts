// note that a valid identifier is more complicated than this,
// but let's keep it simple, which should be sufficient for most cases
const checkIdentifier = /^[a-zA-Z\_\$][a-zA-Z0-9\_\$]*$/;

export function makeIdentifier(identifier: string) {
  return checkIdentifier.test(identifier) ? identifier : JSON.stringify(identifier);
}

export function formatContent(content: string) {
  return content
    .split('\n')
    .map(line => (line ? `  ${line}\n` : '\n'))
    .join('');
}

export function toContent(lines: Array<string>, terminator: string) {
  const content = lines.map(line => `${line}${terminator}`).join('\n');
  return formatContent(content);
}

export function toBlock(lines: Array<string>, terminator: string) {
  if (lines.length > 0) {
    return `{\n${toContent(lines, terminator)}}`;
  }

  return '{}';
}
