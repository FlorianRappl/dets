import { TypeChecker, Program, Node } from 'typescript';
import { TypeModelExport } from './model';

export type ImportDefs = Record<string, Node>;

export type ImportRefs = Record<string, ImportDefs>;

export type TypeRefs = Array<TypeModelExport>;

export interface DeclVisitorContext {
  modules: Record<string, TypeRefs>;
  checker: TypeChecker;
  program: Program;
  exports: Array<Node>;
  usedImports: Array<string>;
  availableImports: ImportRefs;
  warn(message: string): void;
  error(message: string): void;
}
