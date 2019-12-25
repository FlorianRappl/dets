import * as ts from "typescript";
import { resolve } from "path";
import { typeVisitor, TypeModel } from './visit';

function generateDeclaration(root: string, entryFile: string) {
  const program = ts.createProgram([resolve(root, entryFile)], {});
  const checker = program.getTypeChecker();
  const parts: Record<string, TypeModel> = {};
  //const mods = program.getSourceFiles().map(m => m.fileName);

  const visit = (node: ts.Node) => {
    // Only consider exported nodes
    if (ts.isInterfaceDeclaration(node) && node.name.text === "PiletApi") {
      const type = checker.getTypeAtLocation(node);
      parts.PiletApi = typeVisitor(checker, type);
    }
  };

  const sf = program.getSourceFile(
    resolve(root, "node_modules/piral-core/lib/types/api.d.ts")
  );

  ts.forEachChild(sf, visit);

  console.dir(parts);
}

//generateDeclaration([resolve(__dirname, "../example/index.d.ts")]);
generateDeclaration(
  resolve(__dirname, "../../../Piral-Playground/piral-010"),
  "src/index.tsx"
);
