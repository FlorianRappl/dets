import * as ts from "typescript";
import { resolve } from "path";
import { stringifyDeclaration } from "./stringify";
import { includeExportedType } from "./visit";
import {
  isNodeExported,
  findDeclaredTypings,
  findPiralCoreApi
} from "./helpers";
import { DeclVisitorContext } from "./types";

function logWarn(message: string) {
  console.warn(message);
}

function generateDeclaration(
  name: string,
  root: string,
  files: Array<string>,
  availableImports: Array<string> = []
) {
  const typingsPath = findDeclaredTypings(root);
  const apiPath = findPiralCoreApi(root);
  const rootNames = [...files, typingsPath].filter(m => !!m);
  const program = ts.createProgram(rootNames, {});
  const checker = program.getTypeChecker();
  const context: DeclVisitorContext = {
    modules: {},
    refs: {},
    availableImports,
    usedImports: [],
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
        logWarn(
          'Cannot find the provided typings. Check the "typings" field of your "package.json" for the correct path.'
        );
      }
    }
  } else {
    throw new Error(
      'Cannot find the "piral-core" module. Are you sure it exists? Please run "npm i" to install missing modules.'
    );
  }

  return stringifyDeclaration(context);
}

//const root = resolve(__dirname, "../../../Temp/piral-instance-094");
const root = resolve(__dirname, "../../../Smapiot/piral/src/samples/sample-piral");

console.log(
  generateDeclaration(
    "piral-sample",
    root,
    [resolve(root, "src/index.tsx")],
    ["react", "react-dom", "react-router", "react-router-dom"]
  )
);
