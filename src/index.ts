import * as ts from 'typescript';
import { includeApi, includeTypings, includeExports } from './input';
import { stringifyDeclaration } from './output';
import { findAppRoot, getLibName } from './helpers';
import { DeclVisitorContext } from './types';

export function setupVisitorContext(name: string, files: Array<string>) {
  const rootNames = files.filter(m => !!m);
  const program = ts.createProgram(rootNames, {
    allowJs: true,
    esModuleInterop: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.React,
  });
  const checker = program.getTypeChecker();
  const context: DeclVisitorContext = {
    modules: {},
    refs: {},
    availableImports: {},
    usedImports: [],
    checker,
    program,
    warn(message) {
      console.warn(message);
    },
    error(message) {
      throw new Error(message);
    },
    ids: [],
  };
  context.modules[name] = context.refs;
  return context;
}

export function fillVisitorContextFromApi(context: DeclVisitorContext, apiPath: string, apiName: string) {
  const api = context.program.getSourceFile(apiPath);

  if (api) {
    ts.forEachChild(api, node => includeApi(context, node, apiName));
  } else {
    context.error(
      `Cannot find the "${apiPath}" module. Are you sure it exists? Please run "npm i" to install missing modules.`,
    );
  }
}

export function fillVisitorContextFromTypes(context: DeclVisitorContext, typingsPath: string) {
  const tp = context.program.getSourceFile(typingsPath);

  if (tp) {
    ts.forEachChild(tp, node => includeTypings(context, node));
  } else {
    context.warn(
      'Cannot find the provided typings. Check the "typings" field of your "package.json" for the correct path.',
    );
  }
}

export function addVisitorContextImports(context: DeclVisitorContext, imports: Array<string>) {
  const sourceFiles = context.program.getSourceFiles();
  const remaining = [...imports];

  for (const sourceFile of sourceFiles) {
    if (remaining.length === 0) {
      break;
    }

    sourceFile.resolvedModules?.forEach((value, key) => {
      const index = remaining.indexOf(key);

      if (index !== -1) {
        const file = context.program.getSourceFile(value.resolvedFileName);
        includeExports(context, key, file.symbol);
        remaining.splice(index, 1);
      }
    });
  }
}

export function addVisitorContextAmbientModules(context: DeclVisitorContext, imports: Array<string>) {
  const modules = context.checker.getAmbientModules();

  for (const module of modules) {
    const file = module.declarations?.[0]?.getSourceFile()?.fileName;
    const lib = getLibName(file);

    if (imports.includes(lib)) {
      includeExports(context, module.name, module);
    }
  }
}

export interface DeclOptions {
  name: string;
  root: string;
  files?: Array<string>;
  types?: Array<string>;
  apis?: Array<{
    file: string;
    name: string;
  }>;
  imports?: Array<string>;
}

export function generateDeclaration(options: DeclOptions) {
  const { name, root, imports = [], files = [], types = [], apis = [] } = options;
  const sources = [
    ...files.map(file => findAppRoot(root, file)),
    ...apis.map(api => findAppRoot(root, api.file)),
    ...types.map(type => findAppRoot(root, type)),
  ];

  const context = setupVisitorContext(name, sources);
  addVisitorContextImports(context, imports);
  addVisitorContextAmbientModules(context, imports);

  for (const api of apis) {
    const path = findAppRoot(root, api.file);
    fillVisitorContextFromApi(context, path, api.name);
  }

  for (const type of types) {
    const path = findAppRoot(root, type);
    fillVisitorContextFromTypes(context, path);
  }

  return stringifyDeclaration(context);
}
