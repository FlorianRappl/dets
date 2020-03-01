# dets

[![Build Status](https://florianrappl.visualstudio.com/dets/_apis/build/status/FlorianRappl.dets?branchName=master)](https://florianrappl.visualstudio.com/dets/_build/latest?definitionId=23&branchName=master)
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

(tbd)

## Development

Right now *dets* is fully in development. So things may change in the (near) future.

Any ideas, issues, or enhancements are much appreciated!

We follow common sense here, so I hope that we do not need a long code of conduct or anything overall complex for everyone to feel welcome here.

## License

MIT License (MIT). For more information see [LICENSE](./LICENSE) file.
