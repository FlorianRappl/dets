import * as ts from 'typescript';
import { createBinding, getPackage, getSimpleRef, isIncluded } from './utils';
import {
  isDefaultExport,
  getModifiers,
  isGlobal,
  fullyQualifiedName,
  getPropName,
  getParameterName,
  getDeclarationFromNode,
  getTypeRefName,
  getPredicateName,
  getComment,
  getSymbol,
  getSymbolName,
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
} from '../types';

class DeclVisitor {
  private readonly queue: Array<ts.Node> = [];
  private readonly processed: Array<ts.Node> = [];

  constructor(private context: DeclVisitorContext, node: ts.Node) {
    this.queue.push(node);
  }

  private normalizeName(node: ts.Node) {
    const c = this.context;
    const symbol = node.symbol ?? node.aliasSymbol ?? c.checker.getSymbolAtLocation(node);
    const global = isGlobal(symbol);
    const { moduleName, lib } = getPackage(node, global, c.availableImports);

    if (global && lib) {
      return fullyQualifiedName(symbol);
    }

    return createBinding(c, moduleName, getSymbolName(symbol));
  }

  private convertToTypeNodeFromType(type: ts.Type) {
    const c = this.context.checker;
    return c.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.NoTruncation);
  }

  private convertToTypeNodeFromNode(node: ts.Node) {
    const type = this.context.checker.getTypeAtLocation(node);
    return this.convertToTypeNodeFromType(type);
  }

  private inferType(node: ts.Expression) {
    const typeNode = this.convertToTypeNodeFromNode(node);
    return this.getTypeNode(typeNode);
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
        return JSON.stringify(node.literal.text);
      case ts.SyntaxKind.TrueKeyword:
        return 'true';
      case ts.SyntaxKind.FalseKeyword:
        return 'false';
      case ts.SyntaxKind.BigIntLiteral:
        return node.literal.text;
      default:
        const type = this.context.checker.getTypeFromTypeNode(node) as any;
        return type?.value;
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
        refName: this.normalizeName(node),
        types: this.getTypeParameters(node.typeParameters),
      };
    } else if (isDefaultExport(node) || ts.isVariableDeclaration(node) || ts.isVariableStatement(node)) {
      this.enqueue(node);
      return getSimpleRef(this.normalizeName(node));
    } else if (ts.isPropertyAssignment(node)) {
      return {
        kind: 'prop',
        modifiers: getModifiers(node.symbol),
        name: node.symbol.name,
        optional: node.questionToken !== undefined,
        valueType: this.getExpression(node.initializer),
      };
    }

    return getSimpleRef(node.symbol.name);
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
    return {
      kind: 'prop',
      name: getPropName(node.name),
      modifiers: getModifiers(node.symbol),
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

  private getClassMember(node: ts.ClassElement): TypeModelProp {
    return {
      kind: 'prop',
      name: node.name.getText(),
      modifiers: getModifiers(node.symbol),
      optional: false,
      comment: getComment(this.context.checker, node),
      valueType: this.getPropValue(node),
    };
  }

  private getProps(nodes: ReadonlyArray<ts.TypeElement>): Array<TypeModel> {
    const props: Array<TypeModel> = [];

    nodes?.forEach(node => {
      if (ts.isIndexSignatureDeclaration(node)) {
        props.push(this.getIndexProp(node));
      } else if (ts.isCallSignatureDeclaration(node)) {
        props.push(this.getMethodSignature(node));
      } else if (ts.isConstructSignatureDeclaration(node)) {
        props.push(this.getConstructorCall(node));
      } else if (ts.isGetAccessor(node)) {
        props.push(this.getGetAccessor(node));
      } else if (ts.isSetAccessor(node)) {
        props.push(this.getSetAccessor(node));
      } else {
        props.push(this.getNormalProp(node));
      }
    });

    return props;
  }

  private getClassMembers(nodes: ReadonlyArray<ts.ClassElement>): Array<TypeModel> {
    const members: Array<TypeModel> = [];

    nodes?.forEach(node => {
      if (ts.isConstructorDeclaration(node)) {
        members.push(this.getConstructor(node));
      } else if (ts.isCallSignatureDeclaration(node)) {
        members.push(this.getMethodSignature(node));
      } else if (ts.isConstructSignatureDeclaration(node)) {
        members.push(this.getConstructorCall(node));
      } else if (ts.isGetAccessor(node)) {
        members.push(this.getGetAccessor(node));
      } else if (ts.isSetAccessor(node)) {
        members.push(this.getSetAccessor(node));
      } else {
        members.push(this.getClassMember(node));
      }
    });

    return members;
  }

  private getEnumMember(node: ts.EnumMember): TypeMemberModel {
    const value = node.initializer;

    return {
      kind: 'member',
      name: getPropName(node.name),
      value: value && this.getExpression(value),
      comment: getComment(this.context.checker, node),
    };
  }

  private getEnumMembers(nodes: ReadonlyArray<ts.EnumMember>): Array<TypeMemberModel> {
    return nodes?.map(node => this.getEnumMember(node)) ?? [];
  }

  private getReturnType(node: ts.SignatureDeclaration) {
    const checker = this.context.checker;
    const type =
      node.type ??
      this.convertToTypeNodeFromType(checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node)));
    return this.getTypeNode(type);
  }

  private getMethodSignature(node: ts.SignatureDeclaration): TypeModelFunction {
    return {
      kind: 'function',
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
      parameter: getSimpleRef(node.name.text),
      constraint: node.constraint && this.getTypeNode(node.constraint),
      default: node.default && this.getTypeNode(node.default),
    };
  }

  private getTypeParameters(nodes: ReadonlyArray<ts.TypeParameterDeclaration>): Array<TypeModel> {
    return nodes?.map(node => this.getTypeParameter(node)) ?? [];
  }

  private getTypeArguments(nodes: ReadonlyArray<ts.TypeNode>): Array<TypeModel> {
    return nodes?.map(node => this.getTypeNode(node)) ?? [];
  }

  private getFunctionParameterValue(node: ts.ParameterDeclaration): TypeModel {
    if (node.type) {
      return this.getTypeNode(node.type);
    } else if (node.initializer) {
      return this.getExpression(node.initializer);
    } else {
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

  private getSetAccessor(node: ts.SetAccessorDeclaration): TypeModelSetAccessor {
    return {
      kind: 'set',
      name: getPropName(node.name),
      parameters: this.getFunctionParameters(node.parameters),
      comment: getComment(this.context.checker, node),
      modifiers: getModifiers(node.symbol),
    };
  }

  private getGetAccessor(node: ts.GetAccessorDeclaration): TypeModelGetAccessor {
    return {
      kind: 'get',
      name: getPropName(node.name),
      type: this.getReturnType(node),
      comment: getComment(this.context.checker, node),
      modifiers: getModifiers(node.symbol),
    };
  }

  private getTypeReference(node: ts.TypeReferenceNode): TypeModelRef {
    const c = this.context.checker;
    const decl = getDeclarationFromNode(c, node);

    if (decl && !ts.isTypeParameterDeclaration(decl)) {
      if (ts.isEnumMember(decl)) {
        this.enqueue(decl.parent);
      } else {
        this.enqueue(decl);
      }

      return {
        kind: 'ref',
        refName: this.normalizeName(decl),
        types: this.getTypeArguments(node.typeArguments),
      };
    }

    return {
      kind: 'ref',
      refName: getTypeRefName(node.typeName),
      types: this.getTypeArguments(node.typeArguments),
    };
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
    const decl = getDeclarationFromNode(this.context.checker, node.expression);
    this.enqueue(decl);
    return {
      kind: 'ref',
      refName: this.normalizeName(decl),
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

  private getTuple(node: ts.TupleTypeNode): TypeModelTuple {
    return {
      kind: 'tuple',
      types: node.elementTypes.map(n => this.getTypeNode(n)),
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
      return this.getMethodSignature(node);
    } else if (ts.isInferTypeNode(node)) {
      return this.getInfer(node);
    } else if (ts.isIntersectionTypeNode(node)) {
      return this.getIntersection(node);
    } else if (ts.isParenthesizedTypeNode(node)) {
      return {
        kind: 'parenthesis',
        value: this.getTypeNode(node.type),
      };
    } else if (ts.isConstructorTypeNode(node)) {
      return this.getConstructorCall(node);
    } else if (ts.isTypePredicateNode(node)) {
      return this.getPredicate(node);
    } else if (ts.isTupleTypeNode(node)) {
      return this.getTuple(node);
    } else if (ts.isTypeQueryNode(node)) {
      const symbol = this.context.checker.getSymbolAtLocation(node.exprName);
      const type = this.context.checker.getTypeOfSymbolAtLocation(symbol, node);
      const typeNode = this.convertToTypeNodeFromType(type);
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
        return getSimpleRef('this');
    }

    this.printWarning('type node', node);
  }

  private getExtends(nodes: ReadonlyArray<ts.HeritageClause>): Array<TypeModel> {
    const clauses: Array<ts.ExpressionWithTypeArguments> = [];
    nodes?.forEach(node => node.token === ts.SyntaxKind.ExtendsKeyword && clauses.push(...node.types));
    return clauses.map(node => this.getTypeNode(node));
  }

  private getImplements(nodes: ReadonlyArray<ts.HeritageClause>): Array<TypeModel> {
    const clauses: Array<ts.ExpressionWithTypeArguments> = [];
    nodes?.forEach(node => node.token === ts.SyntaxKind.ImplementsKeyword && clauses.push(...node.types));
    return clauses.map(node => this.getTypeNode(node));
  }

  private getDefaultExpression(node: ts.ExportAssignment): TypeModel {
    if (!ts.isArrowFunction(node.expression)) {
      return {
        kind: 'const',
        value: this.getExpression(node.expression),
        comment: getComment(this.context.checker, node),
      };
    } else {
      return this.getMethodSignature(node.expression);
    }
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
      props: this.getClassMembers(node.members),
      types: this.getTypeParameters(node.typeParameters),
      comment: getComment(this.context.checker, node),
    };
  }

  private getInterface(node: ts.InterfaceDeclaration): TypeModelInterface {
    const type = this.context.checker.getTypeAtLocation(node);
    const decls = type.symbol.declarations.filter(ts.isInterfaceDeclaration);
    const clauses: Array<ts.HeritageClause> = [];
    const props: Array<ts.TypeElement> = [];
    const typeParameters: Array<ts.TypeParameterDeclaration> = [];

    decls.forEach(m => {
      m.heritageClauses?.forEach(c => {
        clauses.includes(c) || clauses.push(c);
      });
      m.members?.forEach(p => {
        props.includes(p) || isIncluded(props, p) || props.push(p);
      });
      m.typeParameters?.forEach((t, i) => {
        typeParameters.length === i && typeParameters.push(t);
      });
    });

    return {
      kind: 'interface',
      extends: this.getExtends(clauses),
      props: this.getProps(props),
      types: this.getTypeParameters(typeParameters),
      comment: getComment(this.context.checker, node),
    };
  }

  private getExpression(node: ts.Expression): TypeModel {
    if (ts.isArrowFunction(node)) {
      return this.getMethodSignature(node);
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
    } else {
      return this.inferType(node);
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
    return {
      kind: 'const',
      value: this.getVariableValue(node),
      comment: getComment(this.context.checker, node),
    };
  }

  private getEnum(node: ts.EnumDeclaration): TypeModelEnumLiteral {
    const symbol = getSymbol(this.context.checker, node);
    return {
      kind: 'enumLiteral',
      const: symbol.flags === ts.SymbolFlags.ConstEnum,
      values: this.getEnumMembers(node.members),
      comment: getComment(this.context.checker, node),
    };
  }

  private includeInContext(name: string, node: ts.Node, createType: () => TypeModel) {
    const c = this.context;
    const symbol = getSymbol(c.checker, node);

    if (!isGlobal(symbol) && !getPackage(node, false, c.availableImports).external) {
      const existing = c.refs[name];

      if (!existing) {
        c.refs[name] = createType();
      }
    }
  }

  private includeExportedTypeAlias(node: ts.TypeAliasDeclaration) {
    const name = node.name.text;
    this.includeInContext(name, node, () => this.getAlias(node));
  }

  private includeDefaultExport(node: ts.ExportAssignment) {
    const expr = node.expression;

    if (expr) {
      this.includeInContext('_default', expr, () => this.getDefaultExpression(node));
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

  private includeExportedEnum(node: ts.EnumDeclaration) {
    const name = node.name.text;
    this.includeInContext(name, node, () => this.getEnum(node));
  }

  private printWarning(type: string, node: ts.Node) {
    this.context.warn(
      `Could not resolve ${type} at position ${node.pos} of "${node.getSourceFile()?.fileName}". Kind: ${node.kind}.`,
    );
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
    } else if (ts.isEnumDeclaration(node)) {
      this.includeExportedEnum(node);
    } else if (ts.isTypeLiteralNode(node)) {
      //ignore
    } else {
      this.printWarning('type', node);
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
