<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as monaco from "monaco-editor";
  import Widget from "./Widget.svelte";
  import ts, { SourceFile } from "typescript";
  import ViewZone from "./ViewZone.svelte";
  import { Block, extractBlocksFromSource } from "./blocks";
  import { typeDeclarations, example } from "../code";

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

  const resizeObserver = new ResizeObserver(() => {
    editor.layout();
  });

  const updateLines = () => {
    let code = model.getValue();

    console.time("tsc");
    sourceFile = ts.createSourceFile("script.ts", code, ts.ScriptTarget.ES2021);
    blocks = extractBlocksFromSource(sourceFile);
    console.timeEnd("tsc");
  };

  onMount(mountEditor);
  function mountEditor() {
    for (const decl of typeDeclarations) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(decl);
    }

    editor = monaco.editor.create(container, {
      value: example,
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
