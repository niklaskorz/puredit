<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as monaco from "monaco-editor";
  import Widget from "./Widget.svelte";

  let editor: monaco.editor.ICodeEditor;
  let container: HTMLElement;
  let widget: HTMLElement;

  onMount(mountEditor);
  function mountEditor() {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module "dsl" {
export enum TextDirection {
  Both,
  Left,
  Right,
}

export class Column {
  trim(direction?: TextDirection): Column;
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
import { db, TextDirection } from "dsl";
function x() {
    console.log("Hello world!");
}
db.change("students", table => {
  table.column("name").replace(table.column("firstName"), "Mr.");
  table.column("lastName").trim(TextDirection.Right);
});
let y = 42;`,
      language: "typescript",
      fontFamily:
        "'Fira Code Retina', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', monospace",
      fontSize: 14,
      fontLigatures: true,
      /*dimension: {
        width: 800,
        height: 600,
      },*/
    });

    editor.changeViewZones((accessor) => {
      accessor.addZone({
        afterLineNumber: 9,
        domNode: widget,
        heightInPx: widget.offsetHeight,
      });
    });
  }
  onDestroy(() => {
    if (editor) {
      editor.dispose();
      const model = editor.getModel();
      // if (model) model.dispose();
    }
  });
</script>

<div class="monaco-container" bind:this={container} />

<Widget bind:el={widget} />

<style>
  .monaco-container {
    height: 100vh;
    width: 100vw;
  }
</style>
