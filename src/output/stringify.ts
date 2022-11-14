import { makeIdentifier, toBlock } from '../helpers';
import {
  TypeModel,
  TypeModelInterface,
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
  WithTypeImplements,
  TypeModelConstructor,
  TypeModelNew,
  TypeMemberModel,
  TypeModelSetAccessor,
  TypeModelGetAccessor,
  TypeModelPredicate,
  TypeModelPrefixReadonly,
} from '../types';

export function stringifyComment(type: WithTypeComments) {
  if (type.comment) {
    const lines = type.comment
      .split('\n')
      .map((line) => ` * ${line}\n`)
      .join('');
    return `/**\n${lines} */\n`;
  }

  return '';
}

export function stringifyProp(type: TypeModelProp) {
  const target = type.valueType;
  const comment = stringifyComment(type);
  const isOpt = type.optional ? '?' : '';
  const modifier = type.modifiers ? `${type.modifiers} ` : '';
  const name = makeIdentifier(type.name);

  if (typeof target === 'undefined') {
    return `${comment}${modifier}${name}${isOpt}: any`;
  } else if (target.kind === 'function') {
    return `${comment}${modifier}${name}${isOpt}${stringifySignature(target, StringifyMode.property)}`;
  } else {
    return `${comment}${modifier}${name}${isOpt}: ${stringifyNode(target)}`;
  }
}

export function stringifyParameter(param: TypeModelFunctionParameter) {
  const isOpt = param.optional ? '?' : '';
  const spread = param.spread ? '...' : '';
  const modifiers = param.modifiers ? `${param.modifiers} ` : '';
  return `${modifiers}${spread}${param.param}${isOpt}: ${stringifyNode(param.value)}`;
}

export function stringifyParameters(params: Array<TypeModelFunctionParameter>) {
  return params.map(stringifyParameter).join(', ');
}

export function stringifySignature(type: TypeModelFunction | TypeModelNew, mode: StringifyMode) {
  const ctor = type.kind === 'new' ? 'new ' : '';
  const prop = (mode & StringifyMode.property) !== 0;
  const paren = (mode & StringifyMode.parenthesis) !== 0;
  const comment = stringifyComment(type);
  const parameters = stringifyParameters(type.parameters);
  const ta = stringifyTypeArgs(type);
  const rt = stringifyNode(type.returnType);
  const del = prop ? ': ' : ' => ';
  const result = `${ctor}${ta}(${parameters})${del}${rt}`;
  const fn = paren ? `(${result})` : result;
  return `${comment}${fn}`;
}

export function stringifyConstructor(type: TypeModelConstructor) {
  const parameters = stringifyParameters(type.parameters);
  return `constructor(${parameters})`;
}

export function stringifyIndex(type: TypeModelIndex) {
  const isOpt = type.optional ? '?' : '';
  const index = stringifyParameters(type.parameters);
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

export function stringifyInterface(type: TypeModelInterface) {
  const lines = type.props.map((p) => stringifyNode(p, StringifyMode.property));

  if (type.mapped) {
    lines.push(stringifyMapped(type.mapped));
  }

  return toBlock(lines, ';');
}

export function stringifyClass(type: TypeModelClass) {
  const lines = type.props.map((p) => stringifyNode(p));
  return toBlock(lines, ';');
}

export function stringifyEnum(values: Array<TypeModel>) {
  const lines: Array<string> = values.map((p) => stringifyNode(p));
  return toBlock(lines, ',');
}

export function stringifyExtends(type: WithTypeExtends) {
  const { extends: es } = type;
  return es.length ? ` extends ${es.map((t) => stringifyNode(t)).join(', ')}` : '';
}

export function stringifyImplements(type: WithTypeImplements) {
  const { implements: is } = type;
  return is.length ? ` implements ${is.map((t) => stringifyNode(t)).join(', ')}` : '';
}

export function stringifyTypes(types: Array<TypeModel>) {
  return types.map((t) => stringifyNode(t)).join(', ');
}

export function stringifyTypeArgs(type: WithTypeArgs) {
  if (type.types?.length > 0) {
    return `<${stringifyTypes(type.types)}>`;
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

export function stringifyTernary(condition: TypeModelConditional) {
  const t = stringifyNode(condition.check);
  const e = stringifyNode(condition.extends);
  const p = stringifyNode(condition.primary);
  const a = stringifyNode(condition.alternate);
  return `${t} extends ${e} ? ${p} : ${a}`;
}

export function stringifyMember(member: TypeMemberModel) {
  const name = `${stringifyComment(member)}${member.name}`;

  if (member.value) {
    return `${name} = ${stringifyNode(member.value)}`;
  }

  return name;
}

export function stringifySetAccessor(accessor: TypeModelSetAccessor) {
  const comment = stringifyComment(accessor);
  const modifier = accessor.modifiers ? `${accessor.modifiers} ` : '';
  const args = stringifyParameters(accessor.parameters);
  return `${comment}${modifier}set ${accessor.name}(${args})`;
}

export function stringifyGetAccessor(accessor: TypeModelGetAccessor) {
  const comment = stringifyComment(accessor);
  const modifier = accessor.modifiers ? `${accessor.modifiers} ` : '';
  const result = stringifyNode(accessor.type);
  return `${comment}${modifier}get ${accessor.name}(): ${result}`;
}

export function stringifyPredicate(predicate: TypeModelPredicate) {
  const type = stringifyNode(predicate.value);
  return `${predicate.name} is ${type}`;
}

export function stringifyReadonly(type: TypeModelPrefixReadonly) {
  const value = type.value;

  if (value.kind === 'ref' && value.refName === 'Array' && value.types.length === 1) {
    const [arg] = value.types;
    return `readonly ${stringifyNode(arg)}[]`;
  }

  return `readonly ${stringifyNode(value)}`;
}

export const enum StringifyMode {
  default = 0,
  property = 1,
  parenthesis = 2,
}

export function stringifyNode(type: TypeModel, mode = StringifyMode.default) {
  switch (type?.kind) {
    case 'interface':
      return stringifyInterface(type);
    case 'prop':
      return stringifyProp(type);
    case 'ref':
      return `${type.refName}${stringifyTypeArgs(type)}`;
    case 'typeParameter':
      return stringifyTypeParameter(type);
    case 'union':
      return type.types.map((u) => stringifyNode(u, StringifyMode.parenthesis)).join(' | ');
    case 'intersection':
      return type.types.map((u) => stringifyNode(u)).join(' & ');
    case 'member':
      return stringifyMember(type);
    case 'conditional':
      return stringifyTernary(type);
    case 'readonly':
      return stringifyReadonly(type);
    case 'unique':
      return `unique ${stringifyNode(type.value)}`;
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
    case 'literal':
      return `${type.value}`;
    case 'indexedAccess':
      return stringifyIndexedAccess(type);
    case 'index':
      return stringifyIndex(type);
    case 'class':
      return `class ${stringifyClass(type)}`;
    case 'constructor':
      return stringifyConstructor(type);
    case 'mapped':
      return stringifyMapped(type);
    case 'substitution':
      return stringifyNode(type.variable);
    case 'rest':
      return `...${stringifyNode(type.value)}`;
    case 'new':
    case 'function':
      return stringifySignature(type, mode);
    case 'tuple':
      return `[${stringifyTypes(type.types)}]`;
    case 'set':
      return stringifySetAccessor(type);
    case 'get':
      return stringifyGetAccessor(type);
    case 'predicate':
      return stringifyPredicate(type);
    case 'template':
      return `\`${type.parts.map((p) => (typeof p === 'string' ? p : `\${${stringifyNode(p)}}`)).join('')}\``;
    case 'parenthesis':
      return `(${stringifyNode(type.value)})`;
  }

  return '';
}
