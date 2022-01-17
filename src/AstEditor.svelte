<script lang="ts">
  import ts from "typescript";
  import { example } from "./code";
  import Node from "./Node.svelte";

  let sourceFile = ts.createSourceFile(
    "script.ts",
    example,
    ts.ScriptTarget.ES2021
  );
  sourceFile.getChildren();
</script>

<div class="editor">
  {#each sourceFile.statements as node}
    <Node {sourceFile} {node} />
  {/each}
</div>

<style>
  .editor {
    padding: 10px;
    line-height: 2;
    font-family: "Fira Code", "Menlo", "Monaco", "Consolas", monospace;
  }
</style>
