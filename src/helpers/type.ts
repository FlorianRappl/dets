import {
  Type,
  TypeFlags,
  ConditionalType,
  SubstitutionType,
  BigIntLiteralType,
  ObjectType,
  IndexedAccessType,
  ObjectFlags,
  TypeReference,
} from 'typescript';

export function isConditionalType(type: Type): type is ConditionalType {
  return (type.flags & TypeFlags.Conditional) !== 0;
}

export function isSubstitutionType(type: Type): type is SubstitutionType {
  return (type.flags & TypeFlags.Substitution) !== 0;
}

export function isBigIntLiteral(type: Type): type is BigIntLiteralType {
  return !!(type.flags & TypeFlags.BigIntLiteral);
}

export function isObjectType(type: Type): type is ObjectType {
  return !!(type.flags & TypeFlags.Object);
}

export function isAnonymousObject(type: Type) {
  return isObjectType(type) && !!(type.objectFlags & ObjectFlags.Anonymous);
}

export function isReferenceType(type: Type): type is TypeReference {
  return isObjectType(type) && !!(type.objectFlags & ObjectFlags.Reference);
}

export function isTupleType(type: Type): type is TypeReference {
  return (
    isObjectType(type) &&
    isReferenceType(type) &&
    type.target.objectFlags & ObjectFlags.Tuple &&
    !!type.typeArguments &&
    type.typeArguments.length > 0
  );
}

export function isTypeParameter(type: Type) {
  return !!(type.flags & TypeFlags.TypeParameter);
}

export function isIndexType(type: Type): type is IndexedAccessType {
  return !!(type.flags & TypeFlags.IndexedAccess);
}
