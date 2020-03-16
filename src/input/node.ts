import * as ts from 'typescript';
import { createBinding } from './utils';
import { isDefaultExport, getModifiers, isGlobal, isBaseLib, getLib } from '../helpers';
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
} from '../types';

function getComment(checker: ts.TypeChecker, node: ts.Node): string {
  const doc = node.symbol?.getDocumentationComment(checker);
  return doc?.map(item => item.text).join('\n');
}

function getPredicateName(name: ts.Identifier | ts.ThisTypeNode): string {
  if (ts.isIdentifier(name)) {
    return name.text;
  }

  return 'this';
}

function getRefName(name: ts.EntityName): string {
  if (ts.isIdentifier(name)) {
    return name.text;
  } else if (ts.isQualifiedName(name)) {
    const ns = getRefName(name.left);
    return `${ns}.${name.right.text}`;
  }

  debugger;
}

function getPropName(name: ts.PropertyName): string {
  if (name === undefined) debugger;
  if (ts.isIdentifier(name)) {
    return name.text;
  } else if (ts.isStringLiteral(name)) {
    return name.text;
  } else if (ts.isNumericLiteral(name)) {
    return name.text;
  } else if (ts.isComputedPropertyName(name)) {
    return name.getText();
  }

  debugger;
  return '';
}

function getParameterName(name: ts.BindingName): string {
  if (ts.isIdentifier(name)) {
    return name.text;
  } else if (ts.isObjectBindingPattern(name)) {
    debugger;
    return '';
  } else if (ts.isArrayBindingPattern(name)) {
    debugger;
    return '';
  }

  debugger;
  return '';
}

function getDeclaration(symbol: ts.Symbol): ts.Declaration {
  return symbol?.declarations?.[0];
}

function getSymbol(checker: ts.TypeChecker, node: ts.Node): ts.Symbol {
  const symbol = node.aliasSymbol ?? node.symbol;

  if (!symbol && ts.isTypeNode(node)) {
    const type = checker.getTypeFromTypeNode(node);
    return type.aliasSymbol ?? type.symbol;
  }

  return symbol;
}

class DeclVisitor {
  private readonly queue: Array<ts.Node> = [];
  private readonly processed: Array<ts.Node> = [];

  constructor(private context: DeclVisitorContext, node: ts.Node) {
    this.queue.push(node);
  }

  private normalizeName(node: ts.Node, name: string) {
    const fn = node.getSourceFile()?.fileName;
    const lib = getLib(fn, this.context.availableImports);
    return createBinding(this.context, lib, name);
  }

  private getUnion(node: ts.UnionTypeNode): TypeModelUnion {
    return {
      kind: 'union',
      types: node.types.map(m => this.getNode(m)),
    };
  }

  private getLiteralValue(node: ts.LiteralTypeNode): any {
    switch (node.literal.kind) {
      case ts.SyntaxKind.StringLiteral:
        return node.literal.text;
      case ts.SyntaxKind.TrueKeyword:
        return true;
      case ts.SyntaxKind.FalseKeyword:
        return false;
      default:
        const type = this.context.checker.getTypeFromTypeNode(node) as any;
        return type.value;
    }
  }

  private getLiteral(node: ts.LiteralTypeNode): TypeModel {
    return {
      kind: 'literal',
      value: this.getLiteralValue(node),
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
      return {
        kind: 'ref',
        refName: this.normalizeName(node, node.symbol.name),
        types: this.getTypeParameters(node.typeParameters),
      };
    } else if (isDefaultExport(node) || ts.isVariableDeclaration(node) || ts.isVariableStatement(node)) {
      this.enqueue(node);
    }

    return {
      kind: 'ref',
      refName: this.normalizeName(node, node.symbol.name),
      types: [],
    };
  }

  private getPropDeclaration(node: ts.PropertyDeclaration): TypeModel {
    const checker = this.context.checker;
    const type = node.type ?? checker.typeToTypeNode(checker.getTypeAtLocation(node));
    return this.getTypeNode(type);
  }

  private getPropValue(node: ts.Node): TypeModel {
    if (ts.isPropertySignature(node)) {
      return this.getTypeNode(node.type);
    } else if (ts.isMethodSignature(node)) {
      return this.getFunctionSignature(node);
    } else if (ts.isPropertyDeclaration(node)) {
      return this.getPropDeclaration(node);
    } else if (ts.isMethodDeclaration(node)) {
      return this.getMethodSignature(node);
    }

    debugger;
  }

  private getNormalProp(node: ts.TypeElement): TypeModelProp {
    return {
      kind: 'prop',
      name: getPropName(node.name),
      modifiers: getModifiers(node.symbol),
      id: node.symbol?.id,
      optional: node.questionToken !== undefined,
      comment: getComment(this.context.checker, node),
      valueType: this.getPropValue(node),
    };
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
      comment: getComment(this.context.checker, node),
    };
  }

  private getProps(nodes: ts.NodeArray<ts.TypeElement>): Array<TypeModel> {
    const props: Array<TypeModel> = [];

    nodes?.forEach(node => {
      if (ts.isIndexSignatureDeclaration(node)) {
        props.push(this.getIndexProp(node));
      } else if (ts.isCallSignatureDeclaration(node)) {
        props.push(this.getFunctionSignature(node));
      } else if (ts.isConstructSignatureDeclaration(node)) {
        props.push(this.getConstructorCall(node));
      } else {
        props.push(this.getNormalProp(node));
      }
    });

    return props;
  }

  private getMember(node: ts.ClassElement): TypeModel {
    if (ts.isConstructorDeclaration(node)) {
      return this.getConstructor(node);
    }

    return {
      kind: 'prop',
      name: node.name.getText(),
      modifiers: getModifiers(node.symbol),
      id: node.symbol.id,
      optional: node.questionToken !== undefined,
      comment: getComment(this.context.checker, node),
      valueType: this.getPropValue(node),
    };
  }

  private getMembers(nodes: ts.NodeArray<ts.ClassElement>): Array<TypeModel> {
    return nodes?.map(node => this.getMember(node)) ?? [];
  }

  private getMethodSignature(node: ts.SignatureDeclaration): TypeModelFunction {
    const checker = this.context.checker;
    const returnType =
      node.type ?? checker.typeToTypeNode(checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node)));
    return {
      kind: 'function',
      parameters: this.getFunctionParameters(node.parameters),
      returnType: this.getTypeNode(returnType),
      types: this.getTypeParameters(node.typeParameters),
      comment: getComment(checker, node),
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

  private getFunctionSignature(node: ts.SignatureDeclarationBase): TypeModelFunction {
    return {
      kind: 'function',
      parameters: this.getFunctionParameters(node.parameters),
      returnType: this.getTypeNode(node.type),
      types: this.getTypeParameters(node.typeParameters),
      comment: getComment(this.context.checker, node),
    };
  }

  private getTypeParameter(node: ts.TypeParameterDeclaration): TypeModelTypeParameter {
    return {
      kind: 'typeParameter',
      parameter: {
        kind: 'ref',
        refName: node.name.text,
        types: [],
      },
      constraint: node.constraint && this.getTypeNode(node.constraint),
      default: node.default && this.getTypeNode(node.default),
    };
  }

  private getTypeParameters(nodes: ts.NodeArray<ts.TypeParameterDeclaration>): Array<TypeModel> {
    return nodes?.map(node => this.getTypeParameter(node)) ?? [];
  }

  private getTypeArguments(nodes: ts.NodeArray<ts.TypeNode>): Array<TypeModel> {
    return nodes?.map(node => this.getTypeNode(node)) ?? [];
  }

  private getFunctionParameter(node: ts.ParameterDeclaration): TypeModelFunctionParameter {
    return {
      kind: 'parameter',
      param: getParameterName(node.name),
      spread: node.dotDotDotToken !== undefined,
      optional: node.questionToken !== undefined,
      modifiers: getModifiers(node.symbol),
      value: this.getTypeNode(node.type),
    };
  }

  private getFunctionParameters(nodes: ts.NodeArray<ts.ParameterDeclaration>): Array<TypeModelFunctionParameter> {
    return nodes?.map(node => this.getFunctionParameter(node)) ?? [];
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
          kind: 'prefix',
          prefix: 'keyof',
          value: this.getTypeNode(node.type),
        };
      case ts.SyntaxKind.UniqueKeyword:
        return {
          kind: 'prefix',
          prefix: 'unique',
          value: this.getTypeNode(node.type),
        };
      case ts.SyntaxKind.ReadonlyKeyword:
        return {
          kind: 'prefix',
          prefix: 'readonly',
          value: this.getTypeNode(node.type),
        };
    }
  }

  private getMappedType(node: ts.MappedTypeNode): TypeModelInterface {
    const p = node.typeParameter;
    return {
      kind: 'interface',
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

  private getTypeReference(node: ts.TypeReferenceNode): TypeModelRef {
    const refName = getRefName(node.typeName);
    const decl = getDeclaration(getSymbol(this.context.checker, node));

    if (decl && !ts.isTypeParameterDeclaration(decl)) {
      this.enqueue(decl);
      return {
        kind: 'ref',
        refName: this.normalizeName(decl, refName),
        types: this.getTypeArguments(node.typeArguments),
      };
    }

    return {
      kind: 'ref',
      refName: this.normalizeName(node, refName),
      types: this.getTypeArguments(node.typeArguments),
    }
  }

  private getTypeLiteral(node: ts.TypeLiteralNode): TypeModelInterface {
    return {
      kind: 'interface',
      extends: [],
      props: this.getProps(node.members),
      types: [],
    };
  }

  private getExpressionWithTypeArguments(node: ts.ExpressionWithTypeArguments): TypeModelRef {
    const symbol = this.context.checker.getSymbolAtLocation(node.expression);
    const decl = symbol.declarations[0];
    this.enqueue(decl);
    return {
      kind: 'ref',
      refName: this.normalizeName(decl, symbol.name),
      types: this.getTypeArguments(node.typeArguments),
    };
  }

  private getArray(node: ts.ArrayTypeNode): TypeModelRef {
    return {
      kind: 'ref',
      refName: 'Array',
      types: [this.getTypeNode(node.elementType)],
    };
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
      types: node.types.map(n => this.getTypeNode(n)),
    };
  }

  private getTypeNode(node: ts.TypeNode): TypeModel {
    if (ts.isUnionTypeNode(node)) {
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
    } else if (ts.isConditionalTypeNode(node)) {
      return this.getConditionalType(node);
    } else if (ts.isFunctionTypeNode(node)) {
      return this.getFunctionSignature(node);
    } else if (ts.isInferTypeNode(node)) {
      return this.getInfer(node);
    } else if (ts.isIntersectionTypeNode(node)) {
      return this.getIntersection(node);
    } else if (ts.isParenthesizedTypeNode(node)) {
      return this.getTypeNode(node.type);
    } else if (ts.isConstructorTypeNode(node)) {
      return this.getConstructorCall(node);
    } else if (ts.isTypePredicateNode(node)) {
      return this.getPredicate(node);
    } else if (ts.isTypeQueryNode(node)) {
      const symbol = this.context.checker.getSymbolAtLocation(node.exprName);
      const type = this.context.checker.getTypeOfSymbolAtLocation(symbol, node);
      const typeNode = this.context.checker.typeToTypeNode(type);
      return this.getTypeNode(typeNode);
    }

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
      case ts.SyntaxKind.ThisKeyword:
        return {
          kind: 'this',
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
      case ts.SyntaxKind.ThisType:
        return {
          kind: 'this',
        };
    }

    debugger;
  }

  private getExtends(nodes: ts.NodeArray<ts.HeritageClause>): Array<TypeModel> {
    const clauses: Array<ts.ExpressionWithTypeArguments> = [];
    nodes?.forEach(node => node.token === ts.SyntaxKind.ExtendsKeyword && clauses.push(...node.types));
    return clauses.map(node => this.getTypeNode(node));
  }

  private getImplements(nodes: ts.NodeArray<ts.HeritageClause>): Array<TypeModel> {
    const clauses: Array<ts.ExpressionWithTypeArguments> = [];
    nodes?.forEach(node => node.token === ts.SyntaxKind.ImplementsKeyword && clauses.push(...node.types));
    return clauses.map(node => this.getTypeNode(node));
  }

  private getAlias(node: ts.TypeAliasDeclaration): TypeModelAlias {
    return {
      kind: 'alias',
      child: this.getTypeNode(node.type),
      types: this.getTypeParameters(node.typeParameters),
      comment: getComment(this.context.checker, node),
    };
  }

  private getClass(node: ts.ClassDeclaration): TypeModelClass {
    return {
      kind: 'class',
      extends: this.getExtends(node.heritageClauses),
      implements: this.getImplements(node.heritageClauses),
      props: this.getMembers(node.members),
      types: this.getTypeParameters(node.typeParameters),
      comment: getComment(this.context.checker, node),
    };
  }

  private getInterface(node: ts.InterfaceDeclaration): TypeModelInterface {
    return {
      kind: 'interface',
      extends: this.getExtends(node.heritageClauses),
      props: this.getProps(node.members),
      types: this.getTypeParameters(node.typeParameters),
      comment: getComment(this.context.checker, node),
    };
  }

  private getExpression(node: ts.Expression): TypeModel {
    if (ts.isArrowFunction(node)) {
      return this.getMethodSignature(node);
    } else {
      const type = this.context.checker.getTypeAtLocation(node);
      const typeNode = this.context.checker.typeToTypeNode(type);
      const decl = getDeclaration(type.aliasSymbol ?? type.symbol);

      if (typeNode) {
        return this.getTypeNode(typeNode);
      } else if (decl) {
        return this.getNode(decl);
      }

      debugger;
    }
  }

  private getVariableValue(node: ts.VariableDeclaration): TypeModel {
    if (node.type) {
      return this.getTypeNode(node.type);
    } else if (node.initializer) {
      return this.getExpression(node.initializer);
    } else {
      const type = this.context.checker.getTypeAtLocation(node);
      const typeNode = this.context.checker.typeToTypeNode(type);
      return this.getTypeNode(typeNode);
    }
  }

  private getVariable(node: ts.VariableDeclaration): TypeModelVariable {
    return {
      kind: 'const',
      value: this.getVariableValue(node),
      comment: getComment(this.context.checker, node),
    };
  }

  private includeInContext(name: string, node: ts.Node, createType: () => TypeModel) {
    const c = this.context;
    const fn = node.parent?.getSourceFile()?.fileName;
    const symbol = c.checker.getSymbolAtLocation(node);

    if (!isGlobal(symbol) && !isBaseLib(fn) && !getLib(fn, c.availableImports)) {
      const existing = c.refs[name];
      const type = createType();

      if (existing) {
        if (existing.kind === 'interface' && type.kind === 'interface') {
          // perform declaration merging
          for (const prop of type.props) {
            if (prop.kind !== 'prop' || !existing.props.some(m => m.kind === prop.kind && m.name === prop.name)) {
              existing.props.push(prop);
            }
          }
        }
      } else {
        c.refs[name] = type;
      }
    }
  }

  private includeExportedTypeAlias(node: ts.TypeAliasDeclaration) {
    const name = node.name.text;
    this.includeInContext(name, node, () => this.getAlias(node));
  }

  private includeDefaultExport(node: ts.ExportAssignment) {
    if (node.expression) {
      const expr = node.expression;
      this.includeInContext('_default', expr, () => this.getExpression(expr));
    } else if (ts.isFunctionDeclaration(node)) {
      this.includeInContext('_default', node, () => this.getMethodSignature(node));
    }
  }

  private includeExportedFunction(node: ts.FunctionDeclaration) {
    const name = node.name.text;
    this.includeInContext(name, node, () => this.getMethodSignature(node));
  }

  private includeExportedClass(node: ts.ClassDeclaration) {
    const name = node.name.text;
    this.includeInContext(name, node, () => this.getClass(node));
  }

  private includeExportedInterface(node: ts.InterfaceDeclaration) {
    const name = node.name.text;
    this.includeInContext(name, node, () => this.getInterface(node));
  }

  private includeExportedVariable(node: ts.VariableDeclaration) {
    const name = node.name.getText();
    this.includeInContext(name, node, () => this.getVariable(node));
  }

  private includeExportedVariables(node: ts.VariableStatement) {
    node.declarationList.declarations.map(decl => this.includeExportedVariable(decl));
  }

  private includeImportedValue(node: ts.ImportSpecifier) {
    const decl = node.symbol.declarations[0];
    this.enqueue(decl);
  }

  private enqueue(item: ts.Node) {
    if (item && this.queue.indexOf(item) === -1 && this.processed.indexOf(item) === -1) {
      this.queue.push(item);
    }
  }

  private process(node: ts.Node) {
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
    } else {
      this.context.warn(`Could not resolve type at position ${node.pos} of "${node.getSourceFile()?.fileName}". Kind: ${node.kind}.`);
    }
  }

  processQueue() {
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      this.processed.push(item);
      this.process(item);
    }
  }
}

export function includeNode(context: DeclVisitorContext, node: ts.Node) {
  const visitor = new DeclVisitor(context, node);
  visitor.processQueue();
}
