<script lang="ts">
  import ts from "typescript";
  import type { Node } from "./Node";
  import NodeEl from "./NodeEl.svelte";
  import Widget from "./Widget.svelte";

  let code = `// Example code
import { db, TextDirection } from "dsl";
function x() {
    console.log("Hello world!");
}
db.change("students", table => {
  table.column("name").replace(table.column("firstName"), "Mr.");
  table.column("lastName").trim(TextDirection.Right);
});
let y = 42;
`;

  let sourceFile = ts.createSourceFile(
    "script.ts",
    code,
    ts.ScriptTarget.ES2021
  );
  let printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  function transformNode(node: ts.Node): Node {
    if (!ts.isExpressionStatement(node)) {
      return node;
    }
    let call = node.expression;
    if (!ts.isCallExpression(call)) {
      return node;
    }
    let callee = call.expression;
    if (!ts.isPropertyAccessExpression(callee)) {
      return node;
    }
    let obj = callee.expression;
    let prop = callee.name;
    if (
      ts.isIdentifier(obj) &&
      ts.isIdentifier(prop) &&
      obj.escapedText == "db" &&
      prop.escapedText == "change"
    ) {
      console.log(
        "Found DSL:",
        printer.printNode(ts.EmitHint.Unspecified, callee, sourceFile)
      );
      return {
        ...node,
        projectional: true,
      };
    }
    return node;
  }

  let nodes: Node[] = [];
  ts.forEachChild(sourceFile, (node) => {
    nodes.push(transformNode(node));
  });

  let widget: HTMLElement;
</script>

<main>
  {#each nodes as node}
    <NodeEl {printer} {sourceFile} {node} />
  {/each}
</main>

<style>
  main {
    font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir,
      segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial,
      sans-serif;
  }
</style>
