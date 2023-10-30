import { TypeChecker, Program, Node } from 'typescript';
import { Logger } from './log';
import { TypeModelExport } from './model';

export type ImportDefs = Record<string, Node>;

export type ImportRefs = Record<string, ImportDefs>;

export type TypeRefs = Array<TypeModelExport>;

export interface DeclVisitorFlags {
  noIgnore: boolean;
  noModuleDeclaration: boolean;
}

export type NamesMap = Map<Node, string>;

export interface DeclVisitorContext {
  modules: Record<string, TypeRefs>;
  moduleNames: Record<string, NamesMap>;
  checker: TypeChecker;
  program: Program;
  exports: Array<Node>;
  imports: Array<string>;
  usedImports: Array<string>;
  availableImports: ImportRefs;
  log: Logger;
  name: string;
  flags: DeclVisitorFlags;
  root: string;
}
