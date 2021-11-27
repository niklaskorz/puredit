<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as monaco from "monaco-editor";
  import Widget from "./Widget.svelte";
  import ts, { SourceFile } from "typescript";
  import ViewZone from "./ViewZone.svelte";
  import { Block, extractBlocksFromSource } from "./blocks";

  let editor: monaco.editor.ICodeEditor;
  let model: monaco.editor.ITextModel;
  let container: HTMLElement;

  let blocks: Block[] = [];
  let sourceFile: SourceFile;

  const resizeObserver = new ResizeObserver(() => {
    editor.layout();
  });

  const updateLines = () => {
    let code = model.getValue();

    sourceFile = ts.createSourceFile("script.ts", code, ts.ScriptTarget.ES2021);

    blocks = extractBlocksFromSource(sourceFile);
  };

  onMount(mountEditor);
  function mountEditor() {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module "dsl" {
export class Column {
  trim(direction?: "both" | "left" | "right"): Column;
  replace(target: Column | string, value: Column | string): Column;
}

export class Table {
  column(name: string): Column;
}

export class Database {
  change(tableName: string, fn: (table: Table) => void): void;
}

export let db: Database;
}`,
      "dsl.d.ts"
    );

    editor = monaco.editor.create(container, {
      value: `// Example code
import { db } from "dsl";
function x() {
    console.log("Hello world!");
}
db.change("students", table => {
  table.column("name").replace("Mister", "Mr.");
  table.column("lastName").trim("right");
});
let y = 42;
`,
      language: "typescript",
      fontFamily:
        "'Fira Code Retina', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', monospace",
      fontSize: 14,
      fontLigatures: true,
    });

    model = editor.getModel()!;
    updateLines();
    model.onDidChangeContent((e) => {
      updateLines();
    });

    resizeObserver.observe(container);
  }
  onDestroy(() => {
    resizeObserver.disconnect();
    if (editor) {
      editor.dispose();
      const model = editor.getModel();
      if (model) model.dispose();
    }
  });
</script>

<div class="monaco-container" bind:this={container} />

{#if editor != null}
  {#each blocks as block}
    <ViewZone {editor} line={block.line} column={block.column + 1}>
      <Widget {block} {editor} {model} {sourceFile} />
    </ViewZone>
  {/each}
{/if}

<style>
  :global(body) {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .monaco-container {
    width: 100%;
    height: 100%;
  }
</style>
