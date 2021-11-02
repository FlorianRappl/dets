# dets

[![Build Status](https://florianrappl.visualstudio.com/dets/_apis/build/status/FlorianRappl.dets?branchName=main)](https://florianrappl.visualstudio.com/dets/_build/latest?definitionId=23&branchName=main)
[![npm](https://img.shields.io/npm/v/dets.svg)](https://www.npmjs.com/package/dets)
[![GitHub tag](https://img.shields.io/github/tag/FlorianRappl/dets.svg)](https://github.com/FlorianRappl/dets/releases)
[![GitHub issues](https://img.shields.io/github/issues/FlorianRappl/dets.svg)](https://github.com/FlorianRappl/dets/issues)

(pronounced: *deee - ts*)

> A TypeScript declaration file bundler.

*dets* is a small utility to generate single-file TypeScript declaration files. It can operate in multiple modes.

It is best used if you want to selectively export an API or if you want to build an isolated *d.ts* file that does not depend on any other declaration packages.

## Installation

You can run dets directly via `npx`. Otherwise, if you want to use it globally you can install it via:

```sh
npm i dets -g
```

We recommend a local installation though:

```sh
npm i dets --save-dev
```

## Usage

There are two primary ways of using dets: Either via the command line or programmatically.

### Special Treatments

#### Ignoring Properties

By default, members that have a `@ignore` comment will be ignored. Therefore, an interface like

```ts
interface Foo {
  bar: boolean;
  /**
   * @ignore
   */
  foo: string;
}
```

will be changed by dets to look like:

```ts
interface Foo {
  bar: boolean;
}
```

This can be disabled via the CLI or programmatic options (`--no-ignore`). Additionally, a special comment like `@dets_preserve` could be added, too.

```ts
interface Foo {
  bar: boolean;
  /**
   * @ignore
   * @dets_preserve
   */
  foo: string;
}
```

Here, the property is kept, but the `dets_preserve` dets comment will be removed:

```ts
interface Foo {
  bar: boolean;
  /**
   * @ignore
   */
  foo: string;
}
```

#### Removing Properties

When doing interface merging certain properties may be desired to be hidden. To do this a special tag comment `@dets_removeprop` is used:

```ts
// original interface
interface Foo {
  foo: string;
  bar: boolean;
}

// somewhere later
/**
 * @dets_removeprop foo
 */
interface Foo {
  qxz: number;
}
```

This results in the merged interface, just without the excluded property:

```ts
interface Foo {
  bar: boolean;
  qxz: number;
}
```

#### Removing Inheritance Clauses

When doing interface merging certain extend clauses may be desired to be hidden. To do this a special tag comment `@dets_removeclause` is used:

```ts
// original interface
interface Foo extends FooBase1, FooBase2 {
  foo: string;
}

// somewhere later
/**
 * @dets_removeclause FooBase1
 */
interface Foo {}
```

This results in the merged interface, just without the excluded clauses:

```ts
interface Foo extends FooBase2 {
  foo: string;
}
```

### From the CLI

An example call for dets from the command line is:

```sh
dets --name foo --files src/**/*.ts --types src/index.ts --out dist/index.d.ts
```

Here we use a glob pattern for the input files and an explicit path for the output.

The available command line arguments are:

```plain
Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --name     Sets the name of the module                                [string]
  --files    Sets the files referenced by TypeScript       [array] [default: []]
  --types    Sets the type entry modules to export via their file path
                                                           [array] [default: []]
  --apis     Sets the interfaces to include using "InterfaceName:FilePath"
             syntax                                        [array] [default: []]
  --imports  Sets the imports to avoid bundling in via their package names
                                                           [array] [default: []]
  --out      Sets the path to the output file
                                         [string] [default: "./dist/index.d.ts"]
```

If `name` is omitted then the `name` from the closest `package.json` is taken.

### From Node Applications

An example code for using dets in a Node.js application is:

```ts
import { generateDeclaration } from "dets";
import { writeFileSync } from "fs";

const content = generateDeclaration({
  name: "foo",
  root: process.cwd(),
  files: ["src/**/*.ts"],
  types: ["src/index.ts"]
});

writeFileSync("dist/index.d.ts", content, "utf8");
```

This is effectively the same call as the example in the CLI section.

There are multiple other possibilities, which may be relevant.

The basis for most operations is a `DeclVisitorContext`, which can be created via the `setupVisitorContext` function.

```ts
import { setupVisitorContext } from "dets";

const context = setupVisitorContext('foo', ["src/**/*.ts"]);
```

Using the `DeclVisitorContext` you can fill from an exported object, which is automatically enriched with all available information form the given input files:

```ts
import { fillVisitorContextFromApi } from "dets";

fillVisitorContextFromApi(context, 'src/types/api.ts', 'MyExportedApi');
```

Alternatively, just get all exports from a given module.

Using the `DeclVisitorContext` you can fill from an exported object, which is automatically enriched with all available information form the given input files:

```ts
import { fillVisitorContextFromTypes } from "dets";

fillVisitorContextFromTypes(context, 'src/types/index.ts');
```

#### Using Plugins

dets also comes with an integrated plugin system that allows customizing the behavior such as modifying the captured type information.

As an example:

```ts
import { generateDeclaration, createExcludePlugin } from "dets";
import { writeFileSync } from "fs";

const content = generateDeclaration({
  name: "foo",
  root: process.cwd(),
  files: ["src/**/*.ts"],
  types: ["src/index.ts"],
  plugins: [createExcludePlugin(['foo'])],
});

writeFileSync("dist/index.d.ts", content, "utf8");
```

This excludes the `foo` module from the output. Since the `foo` module was the subject to create only the declaration mergings on existing modules survive.

Furthermore, custom plugins can be created, too:

```ts
import { generateDeclaration } from "dets";

const printFoundModulesInConsole = {
  // type of the plugin ('before-init' | 'before-process' | 'after-process' | 'before-stringify')
  type: 'after-process',
  // name of the plugin
  name: 'console-printer',
  // function to run with the created context
  run(context) {
    console.log('Found the following modules:', Object.keys(context.modules));
  },
};

generateDeclaration({
  name: "foo",
  root: process.cwd(),
  files: ["src/**/*.ts"],
  types: ["src/index.ts"],
  plugins: [printFoundModulesInConsole],
});
```

## Development

Right now *dets* is fully in development. So things may change in the (near) future.

Any ideas, issues, or enhancements are much appreciated!

We follow common sense here, so I hope that we do not need a long code of conduct or anything overall complex for everyone to feel welcome here.

## License

MIT License (MIT). For more information see [LICENSE](./LICENSE) file.
