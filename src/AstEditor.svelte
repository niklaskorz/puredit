<script lang="ts">
  import { element } from "svelte/internal";
  import ts from "typescript";
  import { example } from "./code";
  import Node from "./Node.svelte";
  import { nodes } from "./nodes";

  let sourceFile = ts.createSourceFile(
    "script.ts",
    example,
    ts.ScriptTarget.ES2021
  );
</script>

<div class="editor">
  <Node element={nodes[sourceFile.kind]} {sourceFile} node={sourceFile} />
</div>

<style>
  .editor {
    padding: 10px;
    line-height: 2;
    font-size: 14px;
    font-family: "Fira Code", "Menlo", "Monaco", "Consolas", monospace;
  }
</style>
