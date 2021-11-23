<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as monaco from "monaco-editor";
  import Widget from "./Widget.svelte";
  import ts from "typescript";
  import ViewZone from "./ViewZone.svelte";

  let editor: monaco.editor.ICodeEditor;
  let container: HTMLElement;

  let lines: ts.LineAndCharacter[] = [];

  const resizeObserver = new ResizeObserver(() => {
    editor.layout();
  });

  const updateLines = () => {
    const model = editor.getModel();
    if (!model) {
      return;
    }

    let code = model.getValue();

    let sourceFile = ts.createSourceFile(
      "script.ts",
      code,
      ts.ScriptTarget.ES2021
    );

    lines = [];
    const find = (node: ts.Node) => {
      if (ts.isExpressionStatement(node)) {
        const call = node.expression;
        if (ts.isCallExpression(call)) {
          const callee = call.expression;
          if (ts.isPropertyAccessExpression(callee)) {
            const obj = callee.expression;
            const prop = callee.name;
            if (
              ts.isIdentifier(obj) &&
              ts.isIdentifier(prop) &&
              obj.escapedText === "db" &&
              prop.escapedText === "change"
            ) {
              const pos = node.getStart(sourceFile, false);
              const lineCharPos: ts.LineAndCharacter =
                ts.getLineAndCharacterOfPosition(sourceFile, pos);
              lines.push(lineCharPos);
              return;
            }
          }
        }
      }
      ts.forEachChild(node, find);
    };
    find(sourceFile);
  };

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
let y = 42;
`,
      language: "typescript",
      fontFamily:
        "'Fira Code Retina', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', monospace",
      fontSize: 14,
      fontLigatures: true,
    });

    const model = editor.getModel();
    if (model) {
      updateLines();
      model.onDidChangeContent((e) => {
        updateLines();
      });
    }

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
  {#each lines as line}
    <ViewZone {editor} line={line.line} column={line.character + 1}>
      <Widget />
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
