#!/usr/bin/env node

import * as yargs from 'yargs';
import { generateDeclaration } from './index';
import { writeFileSync } from 'fs';

const args = yargs
  .describe('name', 'Sets the name of the module')
  .string('name')
  .describe('files', 'Sets the files referenced by TypeScript')
  .array('files')
  .default('files', [] as Array<string>)
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

const content = generateDeclaration({
  name: args.name,
  root: process.cwd(),
  apis: args.apis.map(getApiDecl),
  files: args.files,
  imports: args.imports,
  types: args.types,
});

writeFileSync(args.out, content, 'utf8');
