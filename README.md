# dets

(pronounced: *deee - ts*)

> A TypeScript declaration file bundler.

dets is a small utility to generate single-file TypeScript declaration files. It can operate in multiple modes.

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

(tbd)

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

Any ideas, issues, or enhancements are much appreciated!

We follow common sense here, so I hope that we do not need a long code of conduct or anything overall complex for everyone to feel welcome here.

## License

MIT License (MIT). For more information see [LICENSE](./LICENSE) file.
