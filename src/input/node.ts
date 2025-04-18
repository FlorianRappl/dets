import * as ts from 'typescript';
import { createBinding, getPackage, getDefault, getRef, isImportedFile } from './utils';
import { includeClauses, includeProp } from './includes';
import {
  isDefaultExport,
  getModifiers,
  fullyQualifiedName,
  getParameterName,
  getDeclarationFromNode,
  getTypeRefName,
  getPredicateName,
  getComment,
  getSymbol,
  getSymbolName,
  getExportName,
  shouldInclude,
  isNodeExported,
  getDeclarationFromSymbol,
  getCommentOrDrop,
  stringifyJsDocs,
  getAllJsDocs,
} from '../helpers';
import {
  DeclVisitorContext,
  TypeModel,
  TypeModelFunctionParameter,
  TypeModelProp,
  TypeModelUnion,
  TypeModelConstructor,
  TypeModelAlias,
  TypeModelClass,
  TypeModelInterface,
  TypeModelVariable,
  TypeModelIndex,
  TypeModelIndexedAccess,
  TypeModelPrefix,
  TypeModelConditional,
  TypeModelTypeParameter,
  TypeModelFunction,
  TypeModelNew,
  TypeModelPredicate,
  TypeModelRef,
  TypeModelInfer,
  TypeModelIntersection,
  TypeModelTuple,
  TypeModelEnumLiteral,
  TypeMemberModel,
  TypeModelGetAccessor,
  TypeModelSetAccessor,
  TypeModelExport,
  TypeRefs,
} from '../types';

type NamesMap = Map<ts.Node, string>;

export class DeclVisitor {
  private readonly queue: Array<ts.Node> = [];
  private readonly modules: Array<ts.ModuleDeclaration> = [];
  private readonly processed: Array<ts.Node> = [];
  private names: NamesMap;
  private refs: TypeRefs;

  constructor(private context: DeclVisitorContext) {
    const [defaultModule] = Object.keys(context.modules ?? {});
    this.refs = context.modules[defaultModule] ?? [];
    this.names = context.moduleNames[defaultModule] ?? new Map();

    for (const node of context.exports) {
      this.enqueue(node);
    }
  }

  private logVerbose(message: string) {
    this.context.log.verbose(message);
  }

  private logWarn(message: string) {
    this.context.log.warn(message);
  }

  private printWarning(type: string, node: ts.Node) {
    this.logWarn(
      `Could not resolve ${type} at position ${node.pos} of "${node.getSourceFile()?.fileName}". Kind: ${node.kind}.`,
    );
  }

  private swapName(oldName: string, newName: string) {
    const refs = this.refs;
    const last = refs.pop();

    if (!last) {
      // empty on purpose
    } else if (last.kind === 'default') {
      if (last.value.kind === 'ref') {
        const name = last.value.refName;

        for (let i = refs.length; i--; ) {
          const ref = refs[i];

          if (ref.name === name) {
            refs.splice(i, 1, {
              ...ref,
              name: newName,
            });
            break;
          }
        }
      }
    } else if ('name' in last && last.name === oldName) {
      refs.push({
        ...last,
        name: newName,
      });
    } else {
      refs.push(last);
    }
  }

  private findName(node: ts.Node): string {
    return this.names.get(node);
  }

  private createName(name: string): string {
    const altStart = `${name}___`;
    const available = new Set<string>();

    for (const m of this.names.values()) {
      if (m === name || m.startsWith(altStart)) {
        available.add(m);
      }
    }

    const count = available.size;

    if (count) {
      return `${altStart}${count}`;
    }

    return name;
  }

  private getName(node: ts.Node, suggested: string): string {
    const existing = this.findName(node);

    if (!existing) {
      this.logVerbose(`Missing "name". Retrieving with suggestion "${suggested}".`);
      const name = this.createName(suggested);
      const decls = node.symbol?.declarations ?? [node];
      decls.forEach((decl) => this.names.set(decl, name));
      return name;
    }

    return existing;
  }

  private normalizeName(node: ts.Node) {
    const c = this.context;
    const symbol = node.symbol ?? node.aliasSymbol ?? c.checker.getSymbolAtLocation(node);
    const { moduleName, lib, symbolName, global } = getPackage(node, symbol, c.root, c.availableImports);

    if (!lib) {
      const name = global ? fullyQualifiedName(symbol, '_') : getSymbolName(symbol);
      return this.getName(node, name);
    } else if (global) {
      return fullyQualifiedName(symbol, '.');
    } else {
      return createBinding(c, moduleName, symbolName ?? getSymbolName(symbol));
    }
  }

  private convertToTypeNodeFromType(type: ts.Type) {
    const c = this.context.checker;
    return c.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.NoTruncation);
  }

  private convertToTypeNodeFromNode(node: ts.Node) {
    const type = this.context.checker.getTypeAtLocation(node);
    return this.convertToTypeNodeFromType(type);
  }

  private valueFromLiteral(node: ts.LiteralTypeNode): any {
    switch (node.literal.kind) {
      case ts.SyntaxKind.StringLiteral:
        return JSON.stringify(node.literal.text);
      case ts.SyntaxKind.TrueKeyword:
        return 'true';
      case ts.SyntaxKind.FalseKeyword:
        return 'false';
      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.BigIntLiteral:
        return node.literal.text;
      case ts.SyntaxKind.NullKeyword:
        return 'null';
      default:
        this.logVerbose(`No match for literal node kind "${node.literal.kind}". Trying to get from type node...`);
        const type = this.context.checker.getTypeFromTypeNode(node) as any;
        return type?.intrinsicName ?? type?.value;
    }
  }

  private getInferredType(node: ts.Node): TypeModel {
    const typeNode = this.convertToTypeNodeFromNode(node);
    return this.getTypeNode(typeNode);
  }

  private getUnion(node: ts.UnionTypeNode): TypeModelUnion {
    return {
      kind: 'union',
      types: node.types.map((m) => this.getNode(m)),
    };
  }

  private getLiteral(node: ts.LiteralTypeNode): TypeModel {
    return {
      kind: 'literal',
      value: this.valueFromLiteral(node),
    };
  }

  private getNode(node: ts.Node): TypeModel {
    if (ts.isTypeNode(node)) {
      return this.getTypeNode(node);
    } else if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isClassDeclaration(node)
    ) {
      this.enqueue(node);
      return getRef(this.normalizeName(node), this.getTypeParameters(node.typeParameters));
    } else if (isDefaultExport(node) || ts.isVariableDeclaration(node) || ts.isVariableStatement(node)) {
      this.enqueue(node);
      return getRef(this.normalizeName(node));
    } else if (ts.isPropertyAssignment(node)) {
      return {
        kind: 'prop',
        modifiers: getModifiers(node.symbol),
        name: node.symbol.name,
        //@ts-ignore
        optional: node.questionToken !== undefined,
        valueType: this.getExpression(node.initializer),
      };
    }

    this.logVerbose(`Node is presumably a reference. Found kind "${node.kind}".`);
    return getRef(node.symbol.name);
  }

  private getPropDeclaration(node: ts.PropertyDeclaration): TypeModel {
    const type = node.type ?? this.convertToTypeNodeFromNode(node);
    return this.getTypeNode(type);
  }

  private getPropValue(node: ts.Node): TypeModel {
    if (ts.isPropertySignature(node)) {
      return this.getTypeNode(node.type);
    } else if (ts.isMethodSignature(node)) {
      return this.getMethodSignature(node);
    } else if (ts.isPropertyDeclaration(node)) {
      return this.getPropDeclaration(node);
    } else if (ts.isMethodDeclaration(node)) {
      return this.getMethodSignature(node);
    }

    this.printWarning('property', node);
  }

  private getNormalProp(node: ts.TypeElement): TypeModelProp {
    const { checker, flags } = this.context;
    const canDrop = !flags.noIgnore;
    const comment = getCommentOrDrop(checker, (node as any).emitNode?.commentRange ?? node, canDrop);

    if (typeof comment === 'string') {
      return {
        kind: 'prop',
        name: this.getPropName(node.name),
        modifiers: getModifiers(node.symbol),
        optional: node.questionToken !== undefined,
        comment,
        valueType: this.getPropValue(node),
      };
    }

    this.logVerbose(`The prop "${this.getPropName(node.name)}" was skipped due to @ignore.`);
    return undefined;
  }

  private getIndexProp(node: ts.IndexSignatureDeclaration): TypeModelIndex {
    return {
      kind: 'index',
      parameters: this.getFunctionParameters(node.parameters),
      optional: node.questionToken !== undefined,
      valueType: this.getTypeNode(node.type),
    };
  }

  private getConstructor(node: ts.ConstructorDeclaration): TypeModelConstructor {
    return {
      kind: 'constructor',
      parameters: this.getFunctionParameters(node.parameters),
      modifiers: getModifiers(node.symbol),
      comment: getComment(this.context.checker, node),
    };
  }

  private getClassMember(node: ts.ClassElement): TypeModelProp {
    const { checker, flags } = this.context;
    const canDrop = !flags.noIgnore;
    const comment = getCommentOrDrop(checker, node, canDrop);

    if (node.name) {
      if (typeof comment === 'string') {
        return {
          kind: 'prop',
          name: node.name.getText(),
          modifiers: getModifiers(node.symbol),
          optional: false,
          comment,
          valueType: this.getPropValue(node),
        };
      }

      this.logVerbose(`The member "${node.name.getText()}" was skipped due to @ignore.`);
    }

    return undefined;
  }

  private getProps(nodes: ReadonlyArray<ts.TypeElement>): Array<TypeModel> {
    const props: Array<TypeModel> = [];

    nodes?.forEach((node) => {
      if (ts.isIndexSignatureDeclaration(node)) {
        props.push(this.getIndexProp(node));
      } else if (ts.isCallSignatureDeclaration(node)) {
        props.push(this.getMethodSignature(node));
      } else if (ts.isConstructSignatureDeclaration(node)) {
        props.push(this.getConstructorCall(node));
      } else if (ts.isGetAccessor(node)) {
        const prop = this.getGetAccessor(node);
        prop && props.push(prop);
      } else if (ts.isSetAccessor(node)) {
        const prop = this.getSetAccessor(node);
        prop && props.push(prop);
      } else if (ts.isPropertySignature(node)) {
        const prop = this.getNormalProp(node);
        prop && props.push(prop);
      } else {
        this.logVerbose(`Getting props - assuming node of kind "${node?.kind}" is a normal prop.`);
        const prop = this.getNormalProp(node);
        prop && props.push(prop);
      }
    });

    return props;
  }

  private getClassMembers(nodes: ReadonlyArray<ts.ClassElement>): Array<TypeModel> {
    const members: Array<TypeModel> = [];

    nodes?.forEach((node) => {
      if (ts.isConstructorDeclaration(node)) {
        members.push(this.getConstructor(node));
      } else if (ts.isCallSignatureDeclaration(node)) {
        members.push(this.getMethodSignature(node));
      } else if (ts.isConstructSignatureDeclaration(node)) {
        members.push(this.getConstructorCall(node));
      } else if (ts.isGetAccessor(node)) {
        const member = this.getGetAccessor(node);
        member && members.push(member);
      } else if (ts.isSetAccessor(node)) {
        const member = this.getSetAccessor(node);
        member && members.push(member);
      } else if (ts.isIndexSignatureDeclaration(node)) {
        members.push(this.getIndexProp(node));
      } else {
        this.logVerbose(`Getting class members - assuming node of kind "${node?.kind}" is a class member.`);
        const member = this.getClassMember(node);
        member && members.push(member);
      }
    });

    return members;
  }

  private getEnumMember(node: ts.EnumMember): TypeMemberModel {
    const value = node.initializer;

    return {
      kind: 'member',
      name: this.getPropName(node.name),
      value: value && this.getExpression(value),
      comment: getComment(this.context.checker, node),
    };
  }

  private getEnumMembers(nodes: ReadonlyArray<ts.EnumMember>): Array<TypeMemberModel> {
    return nodes?.map((node) => this.getEnumMember(node)) ?? [];
  }

  private getReturnType(node: ts.SignatureDeclaration): TypeModel {
    const checker = this.context.checker;
    const type =
      node.type ??
      this.convertToTypeNodeFromType(checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node)));
    return this.getTypeNode(type);
  }

  private getFunctionDeclaration(node: ts.FunctionDeclaration): TypeModelFunction {
    const name = this.getName(node, node.name.text);

    return {
      ...this.getMethodSignature(node),
      name,
    };
  }

  private getMethodSignature(node: ts.SignatureDeclaration): TypeModelFunction {
    return {
      kind: 'function',
      name: undefined,
      parameters: this.getFunctionParameters(node.parameters),
      returnType: this.getReturnType(node),
      types: this.getTypeParameters(node.typeParameters),
      comment: getComment(this.context.checker, node),
    };
  }

  private getConstructorCall(node: ts.SignatureDeclarationBase): TypeModelNew {
    return {
      kind: 'new',
      parameters: this.getFunctionParameters(node.parameters),
      returnType: this.getTypeNode(node.type),
      types: this.getTypeParameters(node.typeParameters),
      comment: getComment(this.context.checker, node),
    };
  }

  private getTypeParameter(node: ts.TypeParameterDeclaration): TypeModelTypeParameter {
    return {
      kind: 'typeParameter',
      parameter: getRef(node.name.text),
      constraint: node.constraint && this.getTypeNode(node.constraint),
      default: node.default && this.getTypeNode(node.default),
    };
  }

  private getTypeParameters(nodes: ReadonlyArray<ts.TypeParameterDeclaration>): Array<TypeModel> {
    return nodes?.map((node) => this.getTypeParameter(node)) ?? [];
  }

  private getTypeArguments(nodes: ReadonlyArray<ts.TypeNode>): Array<TypeModel> {
    return nodes?.map((node) => this.getTypeNode(node)) ?? [];
  }

  private getFunctionParameterValue(node: ts.ParameterDeclaration): TypeModel {
    if (node.type) {
      return this.getTypeNode(node.type);
    }

    const typeNode = this.convertToTypeNodeFromNode(node);

    if (typeNode) {
      return this.getTypeNode(typeNode);
    } else if (node.initializer) {
      return this.getExpression(node.initializer);
    } else {
      this.logVerbose(
        `Found unidentified node of kind "${node.kind}" in function parameter value. Falling back to "any".`,
      );
      return {
        kind: 'any',
      };
    }
  }

  private getFunctionParameter(node: ts.ParameterDeclaration): TypeModelFunctionParameter {
    return {
      kind: 'parameter',
      param: getParameterName(node.name),
      spread: node.dotDotDotToken !== undefined,
      optional: node.questionToken !== undefined || node.initializer !== undefined,
      modifiers: getModifiers(node.symbol),
      value: this.getFunctionParameterValue(node),
    };
  }

  private getFunctionParameters(nodes: ReadonlyArray<ts.ParameterDeclaration>): Array<TypeModelFunctionParameter> {
    return nodes?.map((node) => this.getFunctionParameter(node)) ?? [];
  }

  private getIndexAccess(node: ts.IndexedAccessTypeNode): TypeModelIndexedAccess {
    return {
      kind: 'indexedAccess',
      index: this.getTypeNode(node.indexType),
      object: this.getTypeNode(node.objectType),
    };
  }

  private getTypeOperator(node: ts.TypeOperatorNode): TypeModelPrefix {
    switch (node.operator) {
      case ts.SyntaxKind.KeyOfKeyword:
        return {
          kind: 'keyof',
          value: this.getTypeNode(node.type),
        };
      case ts.SyntaxKind.UniqueKeyword:
        return {
          kind: 'unique',
          value: this.getTypeNode(node.type),
        };
      case ts.SyntaxKind.ReadonlyKeyword:
        return {
          kind: 'readonly',
          value: this.getTypeNode(node.type),
        };
      default:
        this.logWarn(`Found unknown type operator node of kind "${node.kind}".`);
    }
  }

  private getMappedType(node: ts.MappedTypeNode): TypeModelInterface {
    const p = node.typeParameter;
    return {
      kind: 'interface',
      name: undefined,
      extends: [],
      props: [],
      types: [],
      comment: getComment(this.context.checker, node),
      mapped: {
        kind: 'mapped',
        constraint: this.getTypeNode(p.constraint),
        name: p.name.text,
        optional: node.questionToken !== undefined,
        value: this.getTypeNode(node.type),
      },
    };
  }

  private getConditionalType(node: ts.ConditionalTypeNode): TypeModelConditional {
    return {
      kind: 'conditional',
      alternate: this.getTypeNode(node.falseType),
      check: this.getTypeNode(node.checkType),
      extends: this.getTypeNode(node.extendsType),
      primary: this.getTypeNode(node.trueType),
    };
  }

  private getPredicate(node: ts.TypePredicateNode): TypeModelPredicate {
    return {
      kind: 'predicate',
      name: getPredicateName(node.parameterName),
      value: this.getTypeNode(node.type),
    };
  }

  private getSetAccessor(node: ts.SetAccessorDeclaration): TypeModelSetAccessor {
    const { checker, flags } = this.context;
    const canDrop = !flags.noIgnore;
    const comment = getCommentOrDrop(checker, node, canDrop);

    if (typeof comment === 'string') {
      return {
        kind: 'set',
        name: this.getPropName(node.name),
        parameters: this.getFunctionParameters(node.parameters),
        comment,
        modifiers: getModifiers(node.symbol),
      };
    }

    this.logVerbose(`The setter "${this.getPropName(node.name)}" was skipped due to @ignore.`);
    return undefined;
  }

  private getGetAccessor(node: ts.GetAccessorDeclaration): TypeModelGetAccessor {
    const { checker, flags } = this.context;
    const canDrop = !flags.noIgnore;
    const comment = getCommentOrDrop(checker, node, canDrop);

    if (typeof comment === 'string') {
      return {
        kind: 'get',
        name: this.getPropName(node.name),
        type: this.getReturnType(node),
        comment,
        modifiers: getModifiers(node.symbol),
      };
    }

    this.logVerbose(`The getter "${this.getPropName(node.name)}" was skipped due to @ignore.`);
    return undefined;
  }

  private getTypeReference(node: ts.TypeReferenceNode): TypeModelRef {
    const c = this.context.checker;
    const decl = getDeclarationFromNode(c, node);

    if (decl && !ts.isTypeParameterDeclaration(decl)) {
      this.enqueue(decl);
      return getRef(this.normalizeName(decl), this.getTypeArguments(node.typeArguments));
    }

    return getRef(getTypeRefName(node.typeName), this.getTypeArguments(node.typeArguments));
  }

  private getTypeLiteral(node: ts.TypeLiteralNode): TypeModelInterface {
    return {
      kind: 'interface',
      name: undefined,
      comment: getComment(this.context.checker, node),
      extends: [],
      props: this.getProps(node.members),
      types: [],
    };
  }

  private getExpressionWithTypeArguments(node: ts.ExpressionWithTypeArguments): TypeModelRef {
    const decl = getDeclarationFromNode(this.context.checker, node.expression);

    if (decl) {
      this.enqueue(decl);
      return getRef(this.normalizeName(decl), this.getTypeArguments(node.typeArguments));
    }

    return {
      kind: 'ref',
      refName: 'any',
      types: [],
    };
  }

  private getArray(node: ts.ArrayTypeNode): TypeModelRef {
    return getRef('Array', [this.getTypeNode(node.elementType)]);
  }

  private getInfer(node: ts.InferTypeNode): TypeModelInfer {
    return {
      kind: 'infer',
      parameter: this.getTypeParameter(node.typeParameter),
    };
  }

  private getIntersection(node: ts.IntersectionTypeNode): TypeModelIntersection {
    return {
      kind: 'intersection',
      types: node.types.map((n) => this.getTypeNode(n)),
    };
  }

  private getTuple(node: ts.TupleTypeNode): TypeModelTuple {
    return {
      kind: 'tuple',
      types: (node['elementTypes'] ?? node.elements).map((n) => this.getTypeNode(n)),
    };
  }

  private getParenthesis(node: ts.ParenthesizedTypeNode): TypeModel {
    return {
      kind: 'parenthesis',
      value: this.getTypeNode(node.type),
    };
  }

  private getTypeQueryNode(node: ts.TypeQueryNode): TypeModel {
    const symbol = this.context.checker.getSymbolAtLocation(node.exprName);

    if (symbol !== undefined) {
      const exports = this.context.checker.getExportsOfModule(node.getSourceFile().symbol);

      if (!exports.find((m) => m.name === symbol.name)) {
        const type = this.context.checker.getTypeOfSymbolAtLocation(symbol, node);
        const typeNode = this.convertToTypeNodeFromType(type);

        if (typeNode && ts.isImportTypeNode(typeNode)) {
          const props = type
            .getProperties()
            .map((prop) => ({
              name: prop.name,
              decl: prop.valueDeclaration,
            }))
            .map((m) => ({
              name: m.name,
              type: m.decl && this.context.checker.getTypeOfSymbolAtLocation(m.decl.symbol, m.decl),
            }))
            .map((m) => ({
              name: m.name,
              node: m.type && this.convertToTypeNodeFromType(m.type),
            }))
            .map(
              (m): TypeModel => ({
                name: m.name,
                modifiers: '',
                optional: false,
                kind: 'prop',
                valueType: this.getTypeNode(m.node),
              }),
            );
          return {
            kind: 'interface',
            props,
            types: [],
            extends: [],
            name: '',
          };
        }

        return this.getTypeNode(typeNode);
      }
    }

    const decl = getDeclarationFromNode(this.context.checker, node.exprName);
    this.enqueue(decl);
    return getRef(`typeof ${getTypeRefName(node.exprName)}`);
  }

  private getTypeRestNode(node: ts.RestTypeNode): TypeModel {
    return {
      kind: 'rest',
      value: this.getTypeNode(node.type),
    };
  }

  private getNamedTuple(node: ts.NamedTupleMember): TypeModel {
    const model: TypeModel = {
      kind: 'tuple-prop',
      name: this.getPropName(node.name),
      valueType: this.getTypeNode(node.type),
      optional: node.questionToken !== undefined,
    };

    if (node.dotDotDotToken) {
      return {
        kind: 'rest',
        value: model,
      };
    }

    return model;
  }

  private getTemplateLiteralNode(node: ts.TemplateLiteralTypeNode): TypeModel {
    const parts: Array<string | TypeModel> = [node.head.text];

    for (const span of node.templateSpans) {
      parts.push(this.getTypeNode(span.type));
      parts.push(span.literal.text);
    }

    return {
      kind: 'template',
      parts,
    };
  }

  private getConstantNode(node: ts.TypeNode): TypeModel {
    switch (node.kind) {
      case ts.SyntaxKind.AnyKeyword:
        return {
          kind: 'any',
        };
      case ts.SyntaxKind.UnknownKeyword:
        return {
          kind: 'unknown',
        };
      case ts.SyntaxKind.NumberKeyword:
        return {
          kind: 'number',
        };
      case ts.SyntaxKind.BigIntKeyword:
        return {
          kind: 'bigint',
        };
      case ts.SyntaxKind.ObjectKeyword:
        return {
          kind: 'nonPrimitive',
        };
      case ts.SyntaxKind.BooleanKeyword:
        return {
          kind: 'boolean',
        };
      case ts.SyntaxKind.StringKeyword:
        return {
          kind: 'string',
        };
      case ts.SyntaxKind.SymbolKeyword:
        return {
          kind: 'esSymbol',
        };
      case ts.SyntaxKind.VoidKeyword:
        return {
          kind: 'void',
        };
      case ts.SyntaxKind.UndefinedKeyword:
        return {
          kind: 'undefined',
        };
      case ts.SyntaxKind.NullKeyword:
        return {
          kind: 'null',
        };
      case ts.SyntaxKind.NeverKeyword:
        return {
          kind: 'never',
        };
      case ts.SyntaxKind.ThisKeyword:
      case ts.SyntaxKind.ThisType:
        return getRef('this');
      case ts.SyntaxKind.ImportType:
        return this.resolveImport(node);
    }

    this.printWarning('type node', node);
  }

  private resolveImport(node: ts.TypeNode): TypeModel {
    if (!ts.isImportTypeNode(node)) {
      return {
        kind: 'any',
      };
    } else if ('type' in node.parent) {
      const type = this.convertToTypeNodeFromNode(node.parent);
      return this.getTypeNode(type);
    } else if (node.qualifier) {
      const decl = getDeclarationFromNode(this.context.checker, node.qualifier);
      const type = this.convertToTypeNodeFromNode(decl);
      return this.getTypeNode(type);
    } else {
      return {
        kind: 'import',
        value: this.getTypeNode(node.argument),
      };
    }
  }

  private getTypeNode(node: ts.TypeNode): TypeModel {
    if (!node) {
      return {
        kind: 'any',
      };
    } else if (ts.isUnionTypeNode(node)) {
      return this.getUnion(node);
    } else if (ts.isLiteralTypeNode(node)) {
      return this.getLiteral(node);
    } else if (ts.isExpressionWithTypeArguments(node)) {
      return this.getExpressionWithTypeArguments(node);
    } else if (ts.isTypeLiteralNode(node)) {
      return this.getTypeLiteral(node);
    } else if (ts.isArrayTypeNode(node)) {
      return this.getArray(node);
    } else if (ts.isTypeReferenceNode(node)) {
      return this.getTypeReference(node);
    } else if (ts.isIndexedAccessTypeNode(node)) {
      return this.getIndexAccess(node);
    } else if (ts.isTypeOperatorNode(node)) {
      return this.getTypeOperator(node);
    } else if (ts.isMappedTypeNode(node)) {
      return this.getMappedType(node);
    } else if ('isConditionalTypeNode' in ts && ts.isConditionalTypeNode(node)) {
      return this.getConditionalType(node);
    } else if (ts.isFunctionTypeNode(node)) {
      return this.getMethodSignature(node);
    } else if ('isInferTypeNode' in ts && ts.isInferTypeNode(node)) {
      return this.getInfer(node);
    } else if (ts.isIntersectionTypeNode(node)) {
      return this.getIntersection(node);
    } else if (ts.isParenthesizedTypeNode(node)) {
      return this.getParenthesis(node);
    } else if (ts.isConstructorTypeNode(node)) {
      return this.getConstructorCall(node);
    } else if ('isTypePredicateNode' in ts && ts.isTypePredicateNode(node)) {
      return this.getPredicate(node);
    } else if ('isTupleTypeNode' in ts && ts.isTupleTypeNode(node)) {
      return this.getTuple(node);
    } else if ('isTypeQueryNode' in ts && ts.isTypeQueryNode(node)) {
      return this.getTypeQueryNode(node);
    } else if ('isRestTypeNode' in ts && ts.isRestTypeNode(node)) {
      return this.getTypeRestNode(node);
    } else if ('isTemplateLiteralTypeNode' in ts && ts.isTemplateLiteralTypeNode(node)) {
      return this.getTemplateLiteralNode(node);
    } else if (ts.isNamedTupleMember(node)) {
      return this.getNamedTuple(node);
    } else {
      return this.getConstantNode(node);
    }
  }

  private getExtends(nodes: ReadonlyArray<ts.HeritageClause>): Array<TypeModel> {
    const clauses: Array<ts.ExpressionWithTypeArguments> = [];

    nodes?.forEach((node) => {
      if (node.token === ts.SyntaxKind.ExtendsKeyword) {
        clauses.push(...node.types);
      } else {
        this.logVerbose(`Skipping unidentified node of kind "${node.kind}" in extends section.`);
      }
    });

    return clauses.map((node) => this.getTypeNode(node));
  }

  private getImplements(nodes: ReadonlyArray<ts.HeritageClause>): Array<TypeModel> {
    const clauses: Array<ts.ExpressionWithTypeArguments> = [];

    nodes?.forEach((node) => {
      if (node.token === ts.SyntaxKind.ImplementsKeyword) {
        clauses.push(...node.types);
      } else {
        this.logVerbose(`Skipping unidentified node of kind "${node.kind}" in implements section.`);
      }
    });

    return clauses.map((node) => this.getTypeNode(node));
  }

  private getDefaultExpression(node: ts.ExportAssignment): TypeModelRef {
    const name = getExportName(node.name) ?? '_default';
    const expr = node.expression;

    if (ts.isIdentifier(expr)) {
      const decl = getDeclarationFromNode(this.context.checker, expr);
      this.enqueue(decl);
      return getRef(expr.text);
    } else if (ts.isArrowFunction(expr)) {
      this.includeInContext(expr, () => ({
        ...this.getMethodSignature(expr),
        name,
      }));
    } else {
      this.includeInContext(expr, () => ({
        kind: 'const',
        name,
        value: this.getExpression(expr),
        comment: getComment(this.context.checker, node),
      }));
    }

    return getRef(name);
  }

  private getAlias(node: ts.TypeAliasDeclaration): TypeModelAlias {
    const name = this.getName(node, node.name.text);

    return {
      kind: 'alias',
      name,
      child: this.getTypeNode(node.type),
      types: this.getTypeParameters(node.typeParameters),
      comment: getComment(this.context.checker, node),
    };
  }

  private getClass(node: ts.ClassDeclaration): TypeModelClass {
    const { checker } = this.context;
    const type = checker.getTypeAtLocation(node);
    const decls = type.symbol.declarations.filter(ts.isInterfaceDeclaration);
    const name = this.getName(node, node.name?.text);
    const docs = getAllJsDocs(checker, decls);

    decls.forEach((m) => this.enqueue(m));

    return {
      kind: 'class',
      name,
      extends: this.getExtends(node.heritageClauses),
      implements: this.getImplements(node.heritageClauses),
      props: this.getClassMembers(node.members),
      types: this.getTypeParameters(node.typeParameters),
      comment: stringifyJsDocs(docs),
    };
  }

  private getPropName(name: ts.PropertyName): string | TypeModel {
    if (!name) {
      return undefined;
    } else if (ts.isIdentifier(name)) {
      return name.text;
    } else if (ts.isStringLiteral(name)) {
      return name.text;
    } else if (ts.isNumericLiteral(name)) {
      return name.text;
    } else if (ts.isComputedPropertyName(name)) {
      return this.getExpression(name.expression);
    } else {
      return name.getText();
    }
  }

  private getInterface(node: ts.InterfaceDeclaration): TypeModelInterface {
    const { checker, availableImports, root } = this.context;
    const type = checker.getTypeAtLocation(node);
    const decls = type.symbol.declarations
      .filter(ts.isInterfaceDeclaration)
      .filter((m) => !isImportedFile(m, root, availableImports));
    const clauses: Array<ts.HeritageClause> = [];
    const props: Array<ts.TypeElement> = [];
    const typeParameters: Array<ts.TypeParameterDeclaration> = [];
    const name = this.getName(node, node.name.text);
    const docs = getAllJsDocs(checker, decls);

    decls.forEach((m) => {
      m.heritageClauses?.forEach((c) => {
        clauses.includes(c) || includeClauses(this.context, clauses, c, docs.tags);
      });
      m.members?.forEach((p) => {
        props.includes(p) || includeProp(props, p, (prop) => this.getPropName(prop), docs.tags);
      });
      m.typeParameters?.forEach((t, i) => {
        typeParameters.length === i && typeParameters.push(t);
      });
    });

    return {
      kind: 'interface',
      name,
      extends: this.getExtends(clauses),
      props: this.getProps(props),
      types: this.getTypeParameters(typeParameters),
      comment: stringifyJsDocs(docs),
    };
  }

  private getExpression(node: ts.Expression): TypeModel {
    if (ts.isArrowFunction(node)) {
      const typeNode = this.convertToTypeNodeFromNode(node);

      if (ts.isFunctionTypeNode(typeNode)) {
        // we usually want the original, but in case the function was extended
        // (i.e., converted to an interface) we take the retrieved one
        return this.getMethodSignature(node);
      }

      return this.getTypeNode(typeNode);
    } else if (ts.isNumericLiteral(node)) {
      return {
        kind: 'literal',
        value: node.text,
      };
    } else if (ts.isStringLiteral(node)) {
      return {
        kind: 'literal',
        value: JSON.stringify(node.text),
      };
    } else if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
      return {
        kind: 'boolean',
      };
    } else if (ts.isIdentifier(node)) {
      const decl = getDeclarationFromNode(this.context.checker, node);
      this.enqueue(decl);
      return getRef(node.text);
    } else if (ts.isPropertyAccessExpression(node)) {
      return {
        kind: 'access',
        object: this.getExpression(node.expression),
        name: this.getExpression(node.name),
      };
    } else {
      return this.getInferredType(node);
    }
  }

  private getVariableValue(node: ts.VariableDeclaration): TypeModel {
    if (node.type) {
      return this.getTypeNode(node.type);
    } else if (node.initializer) {
      return this.getExpression(node.initializer);
    } else {
      const typeNode = this.convertToTypeNodeFromNode(node);
      return this.getTypeNode(typeNode);
    }
  }

  private getVariable(node: ts.VariableDeclaration): TypeModelVariable {
    const name = this.getName(node, node.name.getText());

    return {
      kind: 'const',
      name,
      value: this.getVariableValue(node),
      comment: getComment(this.context.checker, node),
    };
  }

  private getEnum(node: ts.EnumDeclaration): TypeModelEnumLiteral {
    const symbol = getSymbol(this.context.checker, node);
    const name = this.getName(node, node.name.text);

    return {
      kind: 'enumLiteral',
      name,
      const: symbol.flags === ts.SymbolFlags.ConstEnum,
      values: this.getEnumMembers(node.members),
      comment: getComment(this.context.checker, node),
    };
  }

  private includeInContext(node: ts.Node, createType: () => TypeModelExport) {
    const c = this.context;
    const symbol = getSymbol(c.checker, node);
    const { external, fn } = getPackage(node, symbol, c.root, c.availableImports);

    if (!external) {
      this.refs.push(createType());
    } else {
      this.logVerbose(`Node from "${fn}" is external and should not be included.`);
    }
  }

  private includeExportedTypeAlias(node: ts.TypeAliasDeclaration) {
    this.includeInContext(node, () => this.getAlias(node));
  }

  private includeDefaultExport(node: ts.ExportAssignment) {
    const expr = node.expression;

    if (expr) {
      this.includeInContext(expr, () => getDefault(this.getDefaultExpression(node)));
    } else if (ts.isFunctionDeclaration(node)) {
      const name = '_default';
      this.includeInContext(node, () => ({
        ...this.getMethodSignature(node),
        name,
      }));
      this.includeInContext(node, () => getDefault(getRef(name)));
    } else if (ts.isClassDeclaration(node)) {
      this.includeInContext(node, () => getDefault(this.getClass(node)));
    } else {
      this.printWarning('default export', node);
    }
  }

  private includeExportedFunction(node: ts.FunctionDeclaration) {
    this.includeInContext(node, () => this.getFunctionDeclaration(node));
  }

  private includeExportedClass(node: ts.ClassDeclaration) {
    this.includeInContext(node, () => this.getClass(node));
  }

  private includeExportedInterface(node: ts.InterfaceDeclaration) {
    const name = this.getName(node, node.name.text);
    const exists = this.refs.some((m) => m.kind === 'interface' && m.name === name);

    if (!exists) {
      this.includeInContext(node, () => this.getInterface(node));
    } else {
      this.logVerbose(`Skipping already included interface "${name}".`);
    }
  }

  private includeExportedVariable(node: ts.VariableDeclaration) {
    this.includeInContext(node, () => this.getVariable(node));
  }

  private includeExportedVariables(node: ts.VariableStatement) {
    node.declarationList.declarations.forEach((decl) => this.includeExportedVariable(decl));
  }

  private includeImportedValue(node: ts.ImportSpecifier) {
    const decl = node.symbol.declarations[0];
    this.enqueue(decl);
  }

  private includeExportedEnum(node: ts.EnumDeclaration) {
    this.includeInContext(node, () => this.getEnum(node));
  }

  private includeSelectedExports(elements: ts.NodeArray<ts.ExportSpecifier>) {
    // selected exports here
    elements.forEach((el) => {
      if (el.symbol) {
        const original = this.context.checker.getAliasedSymbol(el.symbol);

        if (original) {
          const decl = getDeclarationFromSymbol(this.context.checker, original);

          if (decl) {
            this.processNode(decl);
            this.swapName(original.name, el.symbol.name);
          }
        } else if (el.propertyName) {
          // renamed selected export
          const symbol = this.context.checker.getExportSpecifierLocalTargetSymbol(el);

          if (symbol) {
            const decl = getDeclarationFromSymbol(this.context.checker, symbol);

            if (decl) {
              this.processNode(decl);
              this.swapName(el.propertyName.text, el.symbol.name);
            }
          }
        }
      }
    });
  }

  private includeStarExports(node: ts.ExportDeclaration) {
    if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      // * exports from a module
      const moduleName = node.moduleSpecifier.text;
      const sourceFile = node.getSourceFile();

      this.context.forEachResolvedModule((value, originalName) => {
        if (originalName === moduleName) {
          const fileName = value?.resolvedModule?.resolvedFileName ?? value?.resolvedFileName;

          if (fileName) {
            const newFile = this.context.program.getSourceFile(fileName);

            ts.forEachChild(newFile, (node) => {
              if (shouldInclude(node)) {
                this.enqueue(node);
              }
            });
          }
        }
      }, sourceFile);
    }
  }

  private includeExportsDeclaration(node: ts.ExportDeclaration) {
    const { exportClause } = node;

    if (exportClause && ts.isNamedExports(exportClause) && exportClause.elements) {
      this.includeSelectedExports(exportClause.elements);
    } else {
      this.includeStarExports(node);
    }
  }

  private processModule(node: ts.ModuleDeclaration) {
    const c = this.context;
    const name = node.name.text;
    const availableImportNames = Object.keys(this.context.availableImports);
    c.modules[name] = this.refs = c.modules[name] || [];
    c.moduleNames[name] = this.names = c.moduleNames[name] || new Map();

    node.body?.forEachChild((subNode) => {
      if (isNodeExported(subNode) || availableImportNames.includes(name)) {
        this.enqueue(subNode);
      }
    });
  }

  private processNode(node: ts.Node) {
    this.processed.push(node);

    if (ts.isTypeAliasDeclaration(node)) {
      this.includeExportedTypeAlias(node);
    } else if (isDefaultExport(node)) {
      this.includeDefaultExport(node);
    } else if (ts.isVariableDeclaration(node)) {
      this.includeExportedVariable(node);
    } else if (ts.isVariableStatement(node)) {
      this.includeExportedVariables(node);
    } else if (ts.isFunctionDeclaration(node)) {
      this.includeExportedFunction(node);
    } else if (ts.isInterfaceDeclaration(node)) {
      this.includeExportedInterface(node);
    } else if (ts.isClassDeclaration(node)) {
      this.includeExportedClass(node);
    } else if (ts.isImportSpecifier(node)) {
      this.includeImportedValue(node);
    } else if (ts.isEnumDeclaration(node)) {
      this.includeExportedEnum(node);
    } else if (ts.isTypeLiteralNode(node)) {
      // empty on purpose
      this.logVerbose(`Skipping type literal node: ${node}`);
    } else if (ts.isExportDeclaration(node)) {
      this.includeExportsDeclaration(node);
    } else if (ts.isModuleDeclaration(node)) {
      this.modules.push(node);
    } else if (ts.isImportTypeNode(node) || ts.isPropertySignature(node) || ts.isPropertyAssignment(node)) {
      // empty on purpose
      this.logVerbose(`Skipping import type node: ${node}`);
    } else {
      this.printWarning('type', node);
    }
  }

  private enqueue(item: ts.Node) {
    if (!item) {
      // empty on purpose
    } else if (ts.isEnumMember(item)) {
      this.enqueue(item.parent);
    } else if (!this.queue.includes(item) && !this.processed.includes(item)) {
      this.queue.push(item);
    }
  }

  processQueue() {
    while (this.queue.length || this.modules.length) {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        this.processNode(item);
      }

      if (this.modules.length > 0) {
        const mod = this.modules.shift();
        this.processModule(mod);
      }
    }
  }
}
