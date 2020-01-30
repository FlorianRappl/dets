import * as ts from "typescript";
import { resolve } from "path";
import { DeclVisitorContext } from "./types";
import { stringifyModule } from "./stringify";
import { includeExportedType } from "./visit";
import { getRefName, isNodeExported } from "./helpers";

function generateDeclaration(
  name: string,
  root: string,
  entryFiles: Array<string>,
  imports: Array<string> = []
) {
  const { typings } = require(resolve(root, "package.json"));
  const typingsPath = typings && resolve(root, typings);
  const apiPath = resolve(root, "node_modules/piral-core/lib/types/api.d.ts");
  const files = [...entryFiles, typingsPath].filter(m => !!m);
  const program = ts.createProgram(files, {});
  const checker = program.getTypeChecker();
  const context: DeclVisitorContext = {
    modules: {},
    refs: {},
    imports,
    checker,
    ids: []
  };

  const api = program.getSourceFile(apiPath);
  context.modules[name] = context.refs;

  const includeNode = (node: ts.Node) => {
    const type = checker.getTypeAtLocation(node);
    includeExportedType(context, type);
  };

  const includeApi = (node: ts.Node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === "PiletApi") {
      includeNode(node);
    }
  };

  const includeTypings = (node: ts.Node) => {
    if (ts.isModuleDeclaration(node)) {
      const moduleName = node.name.text;
      const existing = context.modules[moduleName];
      context.modules[moduleName] = context.refs = existing || {};
      node.body.forEachChild(subNode => {
        if (isNodeExported(subNode)) {
          includeNode(subNode);
        }
      });
    } else if (isNodeExported(node)) {
      context.refs = context.modules[name];
      includeNode(node);
    }
  };

  if (api) {
    ts.forEachChild(api, includeApi);

    if (typingsPath) {
      const tp = program.getSourceFile(typingsPath);

      if (tp) {
        ts.forEachChild(tp, includeTypings);
      } else {
        console.warn(
          'Cannot find the provided typings. Check the "typings" field of your "package.json" for the correct path.'
        );
      }
    }
  } else {
    console.error(
      'Cannot find the "piral-core" module. Are you sure it exists? Please run "npm i" to install missing modules.'
    );
  }

  const modules = Object.keys(context.modules)
    .map(moduleName => stringifyModule(moduleName, context.modules[moduleName]))
    .join("\n\n");

  const preamble = imports
    .map(lib => `import * as ${getRefName(lib)} from '${lib}';`)
    .join("\n");

  return `${preamble}\n\n${modules}`;
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
