import { makeIdentifier, toBlock } from '../helpers';
import {
  TypeModel,
  TypeModelObject,
  TypeModelProp,
  TypeModelFunction,
  TypeModelIndex,
  TypeModelFunctionParameter,
  WithTypeArgs,
  TypeModelIndexedAccess,
  TypeModelTypeParameter,
  WithTypeComments,
  TypeModelConditional,
  TypeModelMapped,
  TypeModelClass,
  WithTypeExtends,
  TypeModelConstructor,
} from '../types';

export function stringifyComment(type: WithTypeComments) {
  if (type.comment) {
    const lines = type.comment
      .split('\n')
      .map(line => ` * ${line}\n`)
      .join('');
    return `/**\n${lines} */\n`;
  }

  return '';
}

export function stringifyProp(type: TypeModelProp) {
  const target = type.valueType;
  const comment = stringifyComment(type);
  const isOpt = type.optional ? '?' : '';
  const name = makeIdentifier(type.name);

  if (
    target.kind === 'object' &&
    target.calls.length === 1 &&
    target.indices.length === 0 &&
    target.props.length === 0
  ) {
    return `${comment}${name}${isOpt}${stringifySignature(target.calls[0])}`;
  } else {
    return `${comment}${name}${isOpt}: ${stringifyNode(type.valueType)}`;
  }
}

export function stringifyParameter(param: TypeModelFunctionParameter) {
  const isOpt = param.optional ? '?' : '';
  const spread = param.spread ? '...' : '';
  return `${spread}${param.param}${isOpt}: ${stringifyNode(param.value)}`;
}

export function stringifyParameters(params: Array<TypeModelFunctionParameter>) {
  return params.map(stringifyParameter).join(', ');
}

export function stringifySignature(type: TypeModelFunction) {
  const parameters = stringifyParameters(type.parameters);
  const ta = stringifyTypeArgs(type);
  const rt = stringifyNode(type.returnType);
  return `${ta}(${parameters}): ${rt}`;
}

export function stringifyIndex(type: TypeModelIndex) {
  const isOpt = type.optional ? '?' : '';
  const index = `${type.keyName}: ${stringifyNode(type.keyType)}`;
  return `[${index}]${isOpt}: ${stringifyNode(type.valueType)}`;
}

export function stringifyMapped(type: TypeModelMapped) {
  const isOpt = type.optional ? '?' : '';
  const index = `${type.name} in ${stringifyNode(type.constraint)}`;
  return `[${index}]${isOpt}: ${stringifyNode(type.value)}`;
}

export function stringifyIndexedAccess(type: TypeModelIndexedAccess) {
  const front = stringifyNode(type.index);
  const back = stringifyNode(type.object);
  return `${back}[${front}]`;
}

export function stringifyInterface(type: TypeModelObject) {
  const lines: Array<string> = [
    ...type.props.map(p => stringifyProp(p)),
    ...type.calls.map(c => stringifySignature(c)),
    ...type.indices.map(i => stringifyIndex(i)),
  ];

  if (type.mapped) {
    lines.push(stringifyMapped(type.mapped));
  }

  return toBlock(lines, ';');
}

export function stringifyConstructor(type: TypeModelConstructor) {
  const parameters = stringifyParameters(type.parameters);
  return `constructor(${parameters})`;
}

export function stringifyClass(type: TypeModelClass) {
  const lines: Array<string> = [
    ...type.ctors.map(c => stringifyConstructor(c)),
    ...type.props.map(p => stringifyProp(p)),
    ...type.calls.map(c => stringifySignature(c)),
    ...type.indices.map(i => stringifyIndex(i)),
  ];

  return toBlock(lines, ';');
}

export function stringifyEnum(values: Array<TypeModel>) {
  const lines: Array<string> = values.map(p => stringifyNode(p));
  return toBlock(lines, ',');
}

export function stringifyExtends(type: WithTypeExtends) {
  return type.extends.length > 0 ? ` extends ${type.extends.map(stringifyNode).join(', ')}` : '';
}

export function stringifyTypeArgs(type: WithTypeArgs) {
  if (type.types?.length > 0) {
    const args = type.types.map(stringifyNode).join(', ');
    return `<${args}>`;
  }

  return '';
}

export function stringifyTypeParameter(type: TypeModelTypeParameter) {
  const name = stringifyNode(type.parameter);
  const constraint = stringifyNode(type.constraint);
  const defaults = stringifyNode(type.default);
  const constraintClause = constraint ? ` extends ${constraint}` : '';
  const defaultsClause = defaults ? ` = ${defaults}` : '';
  return `${name}${constraintClause}${defaultsClause}`;
}

export function stringifyTernary(type: TypeModelConditional) {
  const cond = stringifyNode(type.condition);
  const primary = stringifyNode(type.primary);
  const alt = stringifyNode(type.alternate);
  return `${cond} ? ${primary} : ${alt}`;
}

export function stringifyNode(type: TypeModel) {
  switch (type?.kind) {
    case 'object':
      return stringifyInterface(type);
    case 'ref':
      return `${type.refName}${stringifyTypeArgs(type)}`;
    case 'typeParameter':
      return stringifyTypeParameter(type);
    case 'union':
      return type.types.map(stringifyNode).join(' | ');
    case 'intersection':
      return type.types.map(stringifyNode).join(' & ');
    case 'member':
      return `${stringifyComment(type)}${type.name} = ${stringifyNode(type.value)}`;
    case 'conditional':
      return stringifyTernary(type);
    case 'keyof':
      return `keyof ${stringifyNode(type.value)}`;
    case 'infer':
      return `infer ${stringifyNode(type.parameter)}`;
    case 'any':
    case 'null':
    case 'void':
    case 'undefined':
    case 'boolean':
    case 'unknown':
    case 'bigint':
    case 'number':
    case 'never':
    case 'string':
      return type.kind;
    case 'nonPrimitive':
      return type.name || 'object';
    case 'esSymbol':
      return 'symbol';
    case 'unidentified':
      return 'any';
    case 'stringLiteral':
    case 'booleanLiteral':
    case 'numberLiteral':
      return JSON.stringify(type.value);
    case 'indexedAccess':
      return stringifyIndexedAccess(type);
    case 'mapped':
      return stringifyMapped(type);
    case 'substitution':
      return stringifyNode(type.variable);
  }

  return '';
}
