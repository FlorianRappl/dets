import * as ts from 'typescript';
import { resolve } from 'path';
import { stringifyDeclaration } from './output';
import { findAppRoot, getLibName } from './helpers';
import { defaultLogger, wrapLogger } from './logger';
import { DetsClassicPlugin, DetsPlugin } from './plugins';
import { includeApi, includeTypings, includeExports, DeclVisitor } from './input';
import { DeclVisitorContext, DeclVisitorFlags, Logger, LogLevel } from './types';

export function setupVisitorContext(
  name: string,
  root: string,
  files: Array<string>,
  imports: Array<string>,
  log: Logger,
  flags: DeclVisitorFlags,
) {
  const rootNames = files.filter((m) => !!m);
  const [major, minor] = ts.versionMajorMinor.split('.').map((x) => Number(x));
  const supportsBundler = (major === 5 && minor >= 3) || major > 5;
  const program = ts.createProgram(rootNames, {
    allowJs: true,
    esModuleInterop: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: supportsBundler ? ts.ModuleResolutionKind.Bundler : ts.ModuleResolutionKind.Node10,
    jsx: ts.JsxEmit.React,
  });
  const checker = program.getTypeChecker();
  const context: DeclVisitorContext = {
    modules: {
      [name]: [],
    },
    moduleNames: {
      [name]: new Map(),
    },
    availableImports: {},
    usedImports: [],
    imports,
    exports: [],
    root,
    name,
    checker,
    program,
    log,
    flags,
    forEachResolvedModule(cb, file) {
      if ('forEachResolvedModule' in program) {
        context.program.forEachResolvedModule(cb, file);
      } else {
        file.resolvedModules?.forEach(cb);
      }
    },
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

export function fillExportsFromReferences(context: DeclVisitorContext, typingsPath: string) {
  const tp = context.program.getSourceFile(typingsPath);

  if (tp) {
    // find and use triple-slash directives
    const ps = tp.pragmas?.get('reference');

    if (ps) {
      const values = Array.isArray(ps) ? ps.map((m) => m.arguments?.path?.value) : [ps.arguments?.path?.value];

      values.forEach((value) => {
        if (typeof value === 'string') {
          const path = resolve(typingsPath, '..', value);
          fillExportsFromTypes(context, path);
        }
      });
    }
  }
}

export function fillExportsFromTypes(context: DeclVisitorContext, typingsPath: string) {
  const tp = context.program.getSourceFile(typingsPath);

  if (tp) {
    fillExportsFromReferences(context, typingsPath);
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

    context.forEachResolvedModule((value, key) => {
      const index = remaining.indexOf(key);
      const fileName = value?.resolvedModule?.resolvedFileName ?? value?.resolvedFileName;

      if (!fileName) {
        context.log.verbose(`Skipping module without filename: ${value}.`);
      } else if (index === -1) {
        context.log.verbose(`Skipping module "${fileName}" as it does not match.`);
      } else {
        const file = context.program.getSourceFile(fileName);
        includeExports(context, key, file?.symbol);
        remaining.splice(index, 1);
      }
    }, sourceFile);
  }
}

export function addAmbientModules(context: DeclVisitorContext, imports: Array<string>) {
  const modules = context.checker.getAmbientModules();
  context.log.verbose(`Adding ${modules.length} ambient modules.`);

  for (const module of modules) {
    const file = module.declarations?.[0]?.getSourceFile()?.fileName;
    const lib = getLibName(file, context.root);

    if (imports.includes(lib)) {
      includeExports(context, module.name, module);
    }
  }
}

async function runAll(context: DeclVisitorContext, plugins: Array<DetsPlugin>, type: DetsClassicPlugin['type']) {
  const { log } = context;
  log.verbose(`Running the ${type}" plugins.`);

  for (const plugin of plugins) {
    try {
      if ('type' in plugin) {
        if (plugin.type === type) {
          await plugin.run(context);
        }
      } else if (typeof plugin[type] === 'function') {
        const runner = plugin[type];
        await runner.call(plugin, context);
      }
    } catch (ex) {
      log.error(`The plugin "${plugin.name}" crashed: ${ex}`);
    }
  }
}

export async function processVisitorContext(context: DeclVisitorContext, plugins: Array<DetsPlugin>) {
  const { log } = context;
  await runAll(context, plugins, 'before-init');
  const visitor = new DeclVisitor(context);
  await runAll(context, plugins, 'before-process');
  log.verbose('Processing the queue.');
  visitor.processQueue();
  await runAll(context, plugins, 'after-process');
  await runAll(context, plugins, 'before-stringify');
  log.verbose('Generating the string representation.');
}

export interface DetsOptions {
  /**
   * The root directory to use. If in doubt just use `process.cwd()`.
   * All other paths (e.g., files) are relative to this directory.
   */
  root?: string;
  /**
   * An optional list of plugins to run.
   */
  plugins?: Array<DetsPlugin>;
  /**
   * Determines if the `@ignore` rule should not be handled by
   * removing the found property.
   */
  noIgnore?: boolean;
  /**
   * Defines imported dependencies which should be excluded from bundling.
   */
  imports?: Array<string>;
  /**
   * Overrides the logger + loglevel combination.
   */
  log?: Logger;
  /**
   * Provides the logger instance for logging.
   */
  logger?: Logger;
  /**
   * Defines the log level to use with the logger.
   */
  logLevel?: LogLevel;
  /**
   * If given does not wrap the declaration in a "declare module" statement.
   */
  noModuleDeclaration?: boolean;
}

export interface DeclOptions extends DetsOptions {
  /**
   * The name of the declaration module.
   */
  name: string;
  /**
   * The additional files to consider for typing inspection.
   */
  files?: Array<string>;
  /**
   * The additional type modules to consider for API generation.
   */
  types?: Array<string>;
  /**
   * The APIs to build.
   */
  apis?: Array<{
    /**
     * The root module where the API can be gathered.
     */
    file: string;
    /**
     * The name of the API interface object in the module.
     */
    name: string;
  }>;
}

/**
 * Generates a new declaration using the provided options.
 * @param options The options for declaration generation.
 * @returns The content of the declaration.
 */
export async function generateDeclaration(options: DeclOptions) {
  const {
    name,
    root = process.cwd(),
    imports = [],
    files = [],
    types = [],
    apis = [],
    plugins = [],
    logger = defaultLogger,
    logLevel = 3,
    noIgnore = false,
    noModuleDeclaration = false,
  } = options;
  const log = wrapLogger(logger, logLevel);

  log.verbose(`Aggregating the sources from "${root}".`);

  const sources = [
    ...files.map((file) => findAppRoot(root, file)),
    ...apis.map((api) => findAppRoot(root, api.file)),
    ...types.map((type) => findAppRoot(root, type)),
  ];

  log.verbose(`Setting up a visitor context for "${name}".`);

  const context = setupVisitorContext(name, root, sources, imports, log, {
    noIgnore,
    noModuleDeclaration,
  });

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

  await processVisitorContext(context, plugins);
  return stringifyDeclaration(context);
}

export interface TypingOptions extends DetsOptions {
  /**
   * The additional files to consider for typing inspection.
   */
  files?: Array<string>;
  /**
   * The type modules to inspect for retrieving the typings.
   */
  types: Array<string>;
}

/**
 * Retrieves the typings using the given typing options.
 * @param options The options for the typing generation.
 * @returns The retrieved typings module.
 */
export async function retrieveTypings(options: TypingOptions) {
  const name = 'main';
  const {
    root = process.cwd(),
    imports = [],
    files = [],
    types = [],
    plugins = [],
    logger = defaultLogger,
    logLevel = 3,
    noIgnore = false,
    noModuleDeclaration = false,
  } = options;
  const log = wrapLogger(logger, logLevel);

  log.verbose(`Aggregating the sources from "${root}".`);

  const sources = [...files.map((file) => findAppRoot(root, file)), ...types.map((type) => findAppRoot(root, type))];

  log.verbose(`Setting up a visitor context for "${name}".`);

  const context = setupVisitorContext(name, root, sources, imports, log, {
    noIgnore,
    noModuleDeclaration,
  });

  log.verbose(`Starting type aggregation from "${root}".`);

  for (const type of types) {
    const path = findAppRoot(root, type);
    fillExportsFromTypes(context, path);
  }

  log.verbose(`Processing the visitor context.`);

  await processVisitorContext(context, plugins);
  return context.modules.main;
}
