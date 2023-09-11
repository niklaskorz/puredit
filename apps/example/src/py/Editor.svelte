<script lang="ts">
  // import DarkMode from "svelte-dark-mode";
  import type { Theme } from "svelte-dark-mode/types/DarkMode.svelte";
  import { basicSetup } from "codemirror";
  import { EditorState, Annotation, Compartment } from "@codemirror/state";
  import type { Extension } from "@codemirror/state";
  import { EditorView, keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  import { autocompletion } from "@codemirror/autocomplete";
  import { indentUnit } from "@codemirror/language";
  import { python } from "@codemirror/lang-python";
  import { onDestroy, onMount } from "svelte";
  import { example } from "./code";
  import { projectionPlugin, completions } from "@puredit/projections";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { indentationMarkers } from "@replit/codemirror-indentation-markers";
  import { projectionPluginConfig } from "./projections";
  import { runPython } from "./pyodide";

  let theme: Theme | undefined;
  let container: HTMLDivElement;
  let projectionalEditor: EditorView | undefined;
  let codeEditor: EditorView | undefined;
  let output: string | null = null;

  const syncChangeAnnotation = Annotation.define<boolean>();
  const darkThemeCompartment = new Compartment();

  onMount(() => {
    const extensions: Extension[] = [
      basicSetup,
      indentUnit.of("    "), // 4 spaces for Python
      keymap.of([indentWithTab]),
      darkThemeCompartment.of(theme === "dark" ? oneDark : []),
      indentationMarkers(),
      EditorView.theme({
        ".cm-scroller": {
          fontFamily: "var(--mono-font, monospace)",
          fontSize: "14px",
        },
        ".cm-tooltip": {
          fontFamily: "var(--system-font, sans-serif)",
        },
      }),
      python(),
    ];
    const projectionalEditorExtensions = extensions.concat([
      projectionPlugin(projectionPluginConfig),
      autocompletion({
        activateOnTyping: true,
        override: [completions],
      }),
    ]);
    const codeEditorExtensions = extensions;

    projectionalEditor = new EditorView({
      state: EditorState.create({
        doc: example,
        extensions: projectionalEditorExtensions,
      }),
      parent: container,
      dispatch(tr) {
        projectionalEditor!.update([tr]);
        if (!tr.changes.empty && !tr.annotation(syncChangeAnnotation)) {
          codeEditor!.dispatch({
            changes: tr.changes,
            annotations: syncChangeAnnotation.of(true),
            filter: false,
          });
        }
      },
    });
    codeEditor = new EditorView({
      state: EditorState.create({
        doc: example,
        extensions: codeEditorExtensions,
      }),
      parent: container,
      dispatch(tr) {
        codeEditor!.update([tr]);
        if (!tr.changes.empty && !tr.annotation(syncChangeAnnotation)) {
          projectionalEditor!.dispatch({
            changes: tr.changes,
            annotations: syncChangeAnnotation.of(true),
            filter: false,
          });
        }
      },
    });
  });

  let runningExecution = false;
  async function executeCode() {
    if (runningExecution) {
      return;
    }
    runningExecution = true;
    output = "Loading...";
    const code = codeEditor.state.sliceDoc();
    const result = await runPython(code);
    if (result.error) {
      output = result.error.toString();
    } else {
      output = result.output;
    }
    runningExecution = false;
  }

  function clearOutput() {
    output = null;
  }

  onDestroy(() => {
    projectionalEditor?.destroy();
    codeEditor?.destroy();
  });

  function onThemeChange(theme?: Theme) {
    const transaction = {
      effects: [
        darkThemeCompartment.reconfigure(theme === "dark" ? oneDark : []),
      ],
    };
    projectionalEditor?.dispatch(transaction);
    codeEditor?.dispatch(transaction);
  }

  // Dynamically update color scheme on theme change
  $: onThemeChange(theme);
</script>

<!-- <DarkMode bind:theme /> -->

<div class="container" bind:this={container} />
<button class="floating-button" on:click={executeCode}>Execute</button>
{#if output}
  <pre class="output">{output}</pre>
  <button class="floating-button" on:click={clearOutput}>Close</button>
{/if}

<style>
  .container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 50% 50%;
  }

  .floating-button {
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: blue;
    cursor: pointer;
    color: #fff;
    border: none;
    border-radius: 3px;
    padding: 5px 10px;
    font-size: 1.2em;
    font-family: var(--system-font);
  }

  .output {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    font-family: var(--mono-font);
    background-color: #fff;
    color: #000;
    overflow: auto;
    margin: 0;
    padding: 20px;
    line-height: 1.5;
  }
</style>
