import {
  TypeRefs,
  TypeModel,
  TypeModelObject,
  TypeModelProp,
  TypeModelFunction,
  TypeModelIndex,
  TypeModelFunctionParameter,
  WithTypeArgs,
  TypeModelIndexedAccess,
  TypeModelTypeParameter,
  TypeModelAlias,
  WithTypeComments
} from "./types";

function stringifyComment(type: WithTypeComments) {
  if (type.comment) {
    const lines = type.comment
      .split("\n")
      .map(line => ` * ${line}\n`)
      .join("");
    return `/**\n${lines} */\n`;
  }

  return "";
}

function stringifyProp(type: TypeModelProp) {
  const target = type.valueType;
  const comment = stringifyComment(type);
  const isOpt = type.optional ? "?" : "";
  const name = JSON.stringify(type.name);

  if (
    target.kind === "object" &&
    target.calls.length === 1 &&
    target.indices.length === 0 &&
    target.props.length === 0
  ) {
    return `${comment}${name}${isOpt}${stringifySignatures(target.calls[0])}`;
  } else {
    return `${comment}${name}${isOpt}: ${stringifyNode(type.valueType)}`;
  }
}

function stringifyParameter(param: TypeModelFunctionParameter) {
  return `${param.param}: ${stringifyNode(param.type)}`;
}

function stringifySignatures(type: TypeModelFunction) {
  if (!type.value) {
    const parameters = type.parameters.map(stringifyParameter).join(", ");
    const ta = stringifyTypeArgs(type);
    const rt = stringifyNode(type.returnType);
    return `${ta}(${parameters}): ${rt}`;
  }

  return type.value;
}

function stringifyIndex(type: TypeModelIndex) {
  const index = `${type.keyName}: ${stringifyNode(type.keyType)}`;
  return `[${index}]: ${stringifyNode(type.valueType)}`;
}

function stringifyIndexedAccess(type: TypeModelIndexedAccess) {
  const front = stringifyNode(type.index);
  const back = stringifyNode(type.object);
  return `${back}[${front}]`;
}

function stringifyInterface(type: TypeModelObject) {
  const lines: Array<string> = [
    ...type.props.map(p => stringifyProp(p)),
    ...type.calls.map(c => stringifySignatures(c)),
    ...type.indices.map(i => stringifyIndex(i))
  ];

  const content = lines
    .map(line => `${line};`)
    .join("\n")
    .split("\n")
    .map(line => `  ${line}`)
    .join("\n");

  return `{
${content}
}`;
}

function stringifyTypeArgs(type: WithTypeArgs) {
  if (type.types?.length > 0) {
    const args = type.types.map(stringifyNode).join(", ");
    return `<${args}>`;
  }

  return "";
}

function stringifyTypeParameter(type: TypeModelTypeParameter) {
  const name = type.typeName;
  const constraint = stringifyNode(type.constraint);
  return constraint ? `${name} extends ${constraint}` : name;
}

function stringifyNode(type: TypeModel) {
  switch (type?.kind) {
    case "object":
      return stringifyInterface(type);
    case "ref":
      return `${type.refName}${stringifyTypeArgs(type)}`;
    case "typeParameter":
      return stringifyTypeParameter(type);
    case "union":
      return type.types.map(stringifyNode).join(" | ");
    case "intersection":
      return type.types.map(stringifyNode).join(" & ");
    case "any":
    case "null":
    case "void":
    case "undefined":
    case "boolean":
    case "unknown":
    case "bigint":
    case "number":
    case "never":
    case "string":
      return type.kind;
    case "esSymbol":
      return "symbol";
    case "unidentified":
      return "any";
    case "stringLiteral":
    case "booleanLiteral":
    case "numberLiteral":
      return JSON.stringify(type.value);
    case "indexedAccess":
      return stringifyIndexedAccess(type);
  }

  return "";
}

function stringifyTopNode(name: string, type: TypeModel) {
  switch (type?.kind) {
    case "object":
      return `${stringifyComment(
        type
      )}export interface ${name}${stringifyTypeArgs(type)} ${stringifyInterface(
        type
      )}`;
    case "alias":
      return `${stringifyComment(type)}export type ${name}${stringifyTypeArgs(
        type
      )} = ${stringifyNode(type.child)};`;
  }

  return "";
}

export function stringify(refs: TypeRefs) {
  return Object.keys(refs)
    .map(r => stringifyTopNode(r, refs[r]))
    .join("\n\n");
}
