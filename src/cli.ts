#!/usr/bin/env node

import * as yargs from 'yargs';
import { dirname, resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { generateDeclaration } from './index';

const root = process.cwd();
const args = yargs
  .describe('name', 'Sets the name of the module')
  .string('name')
  .required('name')
  .describe('files', 'Sets the files referenced by TypeScript')
  .array('files')
  .default('files', [] as Array<string>)
  .required('files')
  .describe('types', 'Sets the type entry modules to export via their file path')
  .array('types')
  .default('types', [] as Array<string>)
  .describe('apis', 'Sets the interfaces to include using "InterfaceName:FilePath" syntax')
  .array('apis')
  .default('apis', [] as Array<string>)
  .describe('imports', 'Sets the imports to avoid bundling in via their package names')
  .array('imports')
  .default('imports', [] as Array<string>)
  .describe('out', 'Sets the path to the output file')
  .string('out')
  .default('out', './dist/index.d.ts').argv;

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

if (!args.name) {
  console.error('Please provide a name for the module.');
  process.exit(1);
}

if (args.files.length === 0) {
  console.error('At least one input file expected.');
  process.exit(1);
}

writeFile(
  args.out,
  generateDeclaration({
    root,
    name: args.name,
    apis: args.apis.map(getApiDecl),
    files: args.files,
    imports: args.imports,
    types: args.types,
  }),
);
