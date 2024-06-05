#!/usr/bin/env node

import * as yargs from 'yargs';
import { dirname, resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { exec } from 'child_process';

const root = process.cwd();
const args = yargs
  .describe('name', 'Sets the name of the module.')
  .string('name')
  .default('name', getName(root))
  .describe('files', 'Sets the files referenced by TypeScript.')
  .array('files')
  .default('files', [] as Array<string>)
  .demandOption('files')
  .describe('types', 'Sets the type entry modules to export via their file path.')
  .array('types')
  .default('types', [] as Array<string>)
  .describe('apis', 'Sets the interfaces to include using "InterfaceName:FilePath" syntax.')
  .array('apis')
  .default('apis', [] as Array<string>)
  .describe('imports', 'Sets the imports to avoid bundling in via their package names.')
  .array('imports')
  .default('imports', [] as Array<string>)
  .describe('ignore', 'Actively uses the ignore comment to drop properties.')
  .boolean('ignore')
  .default('ignore', true)
  .describe('module-declaration', 'Wraps the declaration in a "declare module" block.')
  .boolean('module-declaration')
  .default('module-declaration', true)
  .describe('out', 'Sets the path to the output file.')
  .string('out')
  .default('out', './dist/index.d.ts').argv;

function getName(dir: string) {
  const location = resolve(dir, 'package.json');

  if (!existsSync(location)) {
    const parent = resolve(dir, '..');

    if (parent !== dir) {
      return getName(parent);
    }

    return undefined;
  }

  return require(location).name;
}

function getApiDecl(api: string) {
  const [name, file] = api.split(':');
  return { name, file };
}

function writeFile(path: string, content: string) {
  const full = resolve(root, path);
  const dir = dirname(full);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(full, content, 'utf8');
}

function runScript(script: string, cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const cp = exec(script, { cwd });
    cp.on('close', (code, signal) => (code === 0 ? resolve() : reject(new Error(signal))));
  });
}

async function runCli() {
  const { generateDeclaration } = require('./index');
  const content = await generateDeclaration({
    root,
    name: args.name,
    apis: args.apis.map(getApiDecl),
    files: args.files,
    noModuleDeclaration: !args['module-declaration'],
    imports: args.imports,
    types: args.types,
    noIgnore: !args.ignore,
  });
  writeFile(args.out, content);
}

if (!args.name) {
  console.error('Please provide a name for the module.');
  process.exit(1);
}

if (args.files.length === 0) {
  console.error('At least one input file expected.');
  process.exit(1);
}

(async () => {
  try {
    require('typescript');
  } catch {
    console.warn(`TypeScript is missing. Trying to install ...`);
    await runScript('npm install typescript@^5', resolve(__dirname, '..'));
  }

  try {
    await runCli();
  } catch {
    process.exit(1);
  }

  process.exit(0);
})();
