import * as ts from "typescript";
import { resolve } from "path";
import { DeclVisitorContext } from "./types";
import { stringify } from "./stringify";
import { includeType } from "./visit";
import { getRefName } from "./helpers";

function generateDeclaration(
  name: string,
  root: string,
  entryFiles: Array<string>,
  imports: Array<string> = []
) {
  const program = ts.createProgram(entryFiles, {});
  const checker = program.getTypeChecker();
  const context: DeclVisitorContext = {
    refs: {},
    imports,
    checker,
    ids: [],
  };

  const visit = (node: ts.Node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === "PiletApi") {
      const type = checker.getTypeAtLocation(node);
      includeType(context, type);
    }
  };

  const sf = program.getSourceFile(
    resolve(root, "node_modules/piral-core/lib/types/api.d.ts")
  );
  ts.forEachChild(sf, visit);
  //TODO also include typings from package.json
  console.dir(context.refs);
  const content = stringify(context.refs);
  const preamble = imports
    .map(lib => `import * as ${getRefName(lib)} from '${lib}';`)
    .join("\n");
  return `${preamble}\n\ndeclare module "${name}" {\n${content
    .split("\n")
    .join("\n  ")}\n}`;
}

const root = resolve(__dirname, "../../../Temp/piral-instance-094");
console.log(
  generateDeclaration(
    "piral-010",
    root,
    [resolve(root, "src/index.tsx")],
    ["react", "react-dom", "react-router", "react-router-dom"]
  )
);
