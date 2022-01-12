<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as monaco from "monaco-editor";
  import Widget from "./Widget.svelte";
  import ts, { SourceFile } from "typescript";
  import ViewZone from "./ViewZone.svelte";
  import { Block, extractBlocksFromSource } from "./blocks";
  import { parser, language } from "./parser";
  import type { QueryMatch, SyntaxNode } from "web-tree-sitter";

  interface Editor extends monaco.editor.IStandaloneCodeEditor {
    setHiddenAreas(areas: monaco.Range[]): void;
  }

  enum EditorMode {
    ProjectionReplacesCode = "projection-replaces-code",
    CodeOnly = "code-only",
    Hybrid = "hybrid",
  }

  let mode = EditorMode.ProjectionReplacesCode;
  let modeParam = new URLSearchParams(location.search).get("mode");
  switch (modeParam) {
    case "projection-replaces-code":
      mode = EditorMode.ProjectionReplacesCode;
      break;
    case "code-only":
      mode = EditorMode.CodeOnly;
      break;
    case "hybrid":
      mode = EditorMode.Hybrid;
      break;
  }
  console.log("mode:", mode);

  let editor: Editor;
  let model: monaco.editor.ITextModel;
  let container: HTMLElement;

  let blocks: Block[] = [];
  let sourceFile: SourceFile;

  const query = language.query(`
; Operation replace
(expression_statement
  (call_expression
    function: (member_expression
      object: (call_expression
        function: (member_expression
          object: (identifier) @match.table
          property: (property_identifier) @match.column
        )
        arguments: (arguments
          (string (string_fragment) @columnName)
        )
      )
      property: (property_identifier) @match.replace
    )
    arguments: (arguments
      (string (string_fragment) @target)
      (string (string_fragment) @value)
    )
  )
  (#eq? @match.table "table")
  (#eq? @match.column "column")
  (#eq? @match.replace "replace")
) @type.operationReplace

; Operation trim
(expression_statement
  (call_expression
    function: (member_expression
      object: (call_expression
        function: (member_expression
          object: (identifier) @match.table
          property: (property_identifier) @match.column
        )
        arguments: (arguments
          (string (string_fragment) @columnName)
        )
      )
      property: (property_identifier) @match.trim
    )
    arguments: (arguments
      (string (string_fragment) @direction)
    )
  )
  (#eq? @match.table "table")
  (#eq? @match.column "column")
  (#eq? @match.trim "trim")
) @type.operationTrim
`);

  const resizeObserver = new ResizeObserver(() => {
    editor.layout();
  });

  function nodeToObject(node: SyntaxNode): object {
    return {
      type: node.type,
      text: node.text,
      children: node.children.map(nodeToObject),
    };
  }

  function matchToObject(match: QueryMatch): Record<string, string> {
    return match.captures.reduce((prev, curr) => {
      if (curr.name.startsWith("type.")) {
        prev.type = curr.name.slice(5);
      } else if (!curr.name.startsWith("match.")) {
        prev[curr.name] = curr.node.text;
      }
      return prev;
    }, {} as Record<string, string>);
  }

  const updateLines = () => {
    let code = model.getValue();

    console.time("tree-sitter");
    const node = parser.parse(code).rootNode;
    //console.log(nodeToObject(node));
    const matches = query.matches(node).map(matchToObject);
    console.timeEnd("tree-sitter");
    console.log("matches:", matches);

    console.time("tsc");
    sourceFile = ts.createSourceFile("script.ts", code, ts.ScriptTarget.ES2021);
    blocks = extractBlocksFromSource(sourceFile);
    console.timeEnd("tsc");
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
  if (true) {
    while (2 < 1) {
      db.change("rooms", table => {
        table.column("lastName").replace("<target>", "<value>");
        table.column("firstName").trim("both");
      })
    }
  }
}
db.change("students", table => {
  table.column("name").replace("Mister", "Mr.");
  table.column("lastName").trim("right");
});
let y = 42;
x + 10;
y + 10;
`,
      language: "typescript",
      fontFamily:
        "'Fira Code Retina', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', monospace",
      fontSize: 14,
      fontLigatures: true,
    }) as Editor;

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

  $: {
    if (editor && mode === EditorMode.ProjectionReplacesCode) {
      const areas = blocks.map(
        (block) => new monaco.Range(block.line + 1, 1, block.lineEnd + 1, 1)
      );
      editor.setHiddenAreas(areas);
    }
  }
</script>

<div class="monaco-container" bind:this={container} />

{#if editor != null && mode !== EditorMode.CodeOnly}
  {#each blocks as block}
    <ViewZone
      {editor}
      line={mode === EditorMode.ProjectionReplacesCode
        ? block.lineEnd + 1
        : block.line}
      column={block.column + 1}
    >
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
