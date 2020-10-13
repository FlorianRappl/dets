import * as ts from 'typescript';
import { includeApi, includeTypings, includeExports, DeclVisitor } from './input';
import { stringifyDeclaration } from './output';
import { findAppRoot, getLibName } from './helpers';
import { defaultLogger, wrapLogger } from './logger';
import { DeclVisitorContext, Logger, LogLevel } from './types';

export function setupVisitorContext(name: string, files: Array<string>, imports: Array<string>, log: Logger) {
  const rootNames = files.filter((m) => !!m);
  const program = ts.createProgram(rootNames, {
    allowJs: true,
    esModuleInterop: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.React,
  });
  const checker = program.getTypeChecker();
  const context: DeclVisitorContext = {
    modules: {
      [name]: [],
    },
    availableImports: {},
    usedImports: [],
    exports: [],
    checker,
    program,
    log,
  };
  addAvailableImports(context, imports);
  addAmbientModules(context, imports);
  return context;
}

export function fillExportsFromApi(context: DeclVisitorContext, apiPath: string, apiName: string) {
  const api = context.program.getSourceFile(apiPath);

  if (api) {
    ts.forEachChild(api, (node) => includeApi(context, node, apiName));
  } else {
    context.log.error(
      `Cannot find the "${apiPath}" module. Are you sure it exists? Please run "npm i" to install missing modules.`,
    );
  }
}

export function fillExportsFromTypes(context: DeclVisitorContext, typingsPath: string) {
  const tp = context.program.getSourceFile(typingsPath);

  if (tp) {
    ts.forEachChild(tp, (node) => includeTypings(context, node));
  } else {
    context.log.warn(
      'Cannot find the provided typings. Check the "typings" field of your "package.json" for the correct path.',
    );
  }
}

export function addAvailableImports(context: DeclVisitorContext, imports: Array<string>) {
  const sourceFiles = context.program.getSourceFiles();
  const remaining = [...imports];
  context.log.verbose(`Adding ${imports.length} imports from ${sourceFiles.length} source files.`);

  for (const sourceFile of sourceFiles) {
    if (remaining.length === 0) {
      break;
    }

    sourceFile.resolvedModules?.forEach((value, key) => {
      const index = remaining.indexOf(key);
      const fileName = value?.resolvedFileName;

      if (!fileName) {
        context.log.verbose(`Skipping module without filename: ${value}.`);
      } else if (index === -1) {
        context.log.verbose(`Skipping module "${fileName}" as it does not match.`);
      } else {
        const file = context.program.getSourceFile(fileName);
        includeExports(context, key, file?.symbol);
        remaining.splice(index, 1);
      }
    });
  }
}

export function addAmbientModules(context: DeclVisitorContext, imports: Array<string>) {
  const modules = context.checker.getAmbientModules();
  context.log.verbose(`Adding ${modules.length} ambient modules.`);

  for (const module of modules) {
    const file = module.declarations?.[0]?.getSourceFile()?.fileName;
    const lib = getLibName(file);

    if (imports.includes(lib)) {
      includeExports(context, module.name, module);
    }
  }
}

export function processVisitorContext(context: DeclVisitorContext) {
  const visitor = new DeclVisitor(context);
  visitor.processQueue();
  return stringifyDeclaration(context);
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
  logger?: Logger;
  logLevel?: LogLevel;
}

export function generateDeclaration(options: DeclOptions) {
  const { name, root, imports = [], files = [], types = [], apis = [], logger = defaultLogger, logLevel = 3 } = options;
  const log = wrapLogger(logger, logLevel);

  log.verbose(`Aggregating the sources from "${root}".`);

  const sources = [
    ...files.map((file) => findAppRoot(root, file)),
    ...apis.map((api) => findAppRoot(root, api.file)),
    ...types.map((type) => findAppRoot(root, type)),
  ];

  log.verbose(`Setting up a visitor context for "${name}".`);

  const context = setupVisitorContext(name, sources, imports, log);

  log.verbose(`Starting API gathering in "${root}".`);

  for (const api of apis) {
    const path = findAppRoot(root, api.file);
    fillExportsFromApi(context, path, api.name);
  }

  log.verbose(`Starting type aggregation from "${root}".`);

  for (const type of types) {
    const path = findAppRoot(root, type);
    fillExportsFromTypes(context, path);
  }

  log.verbose(`Processing the visitor context.`);

  return processVisitorContext(context);
}
