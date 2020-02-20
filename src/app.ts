import { resolve } from "path";
import { generateDeclaration } from "./index";

//const root = resolve(__dirname, "../../../Temp/piral-instance-094");
//const root = resolve(__dirname, "../../../Smapiot/piral/src/samples/sample-piral");
//const root = resolve(__dirname, "../../../Piral-Playground/piral-010");
//const root = resolve(__dirname, "../../../Piral-Playground/piral-010-alpha");
//const root = resolve(__dirname, "../../../Smapiot/piral/src/samples/sample-cross-fx");
//const root = resolve(__dirname, "../../../Piral-Playground/shell-mwe");
const root = resolve(__dirname, "../../../Temp/shell-mwe");

console.log(
  generateDeclaration(
    "piral-sample",
    root,
    [resolve(root, "src/index.tsx")],
    [
      "vue",
      "react",
      "angular",
      "inferno",
      "preact",
      "react-router",
      "@libre/atom",
      "riot",
      "styled-components"
    ]
    //["react", "react-dom", "react-router", "react-router-dom"]
  )
);
