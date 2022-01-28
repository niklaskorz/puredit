<script lang="ts">
  import { EditorState, basicSetup } from "@codemirror/basic-setup";
  import { EditorView, keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  import { autocompletion } from "@codemirror/autocomplete";
  import { javascript } from "@codemirror/lang-javascript";
  import { onDestroy, onMount } from "svelte";
  import { example } from "../code";
  import { checkboxPlugin } from "./CheckboxPlugin";
  import { projectionState, textPlugin } from "./TextPlugin";
  import { linter, lintGutter } from "@codemirror/lint";
  import { StateEffect } from "@codemirror/state";
  import { linePlugin } from "./LinePlugin";

  let container: HTMLDivElement;
  let editor: EditorView;

  const typechecker = linter((view) => {
    return [
      {
        from: 5,
        to: 10,
        severity: "warning",
        source: "tsc",
        message: "A test warning",
        actions: [
          {
            name: "Fix it",
            apply(view, from, to) {
              console.log("Fixing", from, "to", to);
            },
          },
        ],
      },
    ];
  });

  onMount(() => {
    editor = new EditorView({
      state: EditorState.create({
        doc: example,
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          autocompletion(),
          javascript({ typescript: true }),
          checkboxPlugin,
          //textPlugin,
          //linePlugin,
          typechecker,
          lintGutter(),
        ],
      }),
      parent: container,
    });
    editor.dispatch({
      effects: StateEffect.appendConfig.of([projectionState]),
    });
  });

  onDestroy(() => {
    editor.destroy();
  });
</script>

<div bind:this={container} />

<style global>
  .cm-editor .cm-scroller {
    font-family: "JetBrains Mono", "SF Mono", "Menlo", "Consolas", "Monaco",
      "Courier New", monospace;
    font-size: 16px;
  }

  .cm-tooltip {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
  }

  .cm-boolean-toggle {
    cursor: pointer;
  }

  .ͼ1 .cm-line.flex {
    display: flex;
    align-items: center;
  }

  .ͼ1 .cm-gutterElement {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  /* Reset style overrides of editor */
  .ͼ2 .cm-text-widget {
    caret-color: black !important;
  }
  .ͼ2 .cm-text-widget ::selection {
    background: #d9d9d9 !important;
  }
  .ͼ3 .cm-text-widget ::selection {
    background: #222 !important;
  }
  .ͼ2 .cm-text-widget :focus::selection {
    background: #d7d4f0 !important;
  }
  .ͼ3 .cm-text-widget :focus::selection {
    background: #233 !important;
  }

  .cm-text-widget {
    color: rgb(153, 18, 18);
  }
  .cm-text-widget > input {
    position: relative;
  }
  .cm-text-widget > input:focus-within {
    z-index: 100;
  }

  /* TextWidget */

  .input-sizer {
    display: inline-grid;
    vertical-align: top;
    align-items: center;
    position: relative;
    /*margin: -3px 0;*/
  }

  .input-sizer::after,
  .input-sizer > input {
    width: auto;
    min-width: 1em;
    grid-area: 1 / 2;
    font: inherit;
    margin: 0;
    resize: none;
    background: none;
    appearance: none;
    outline: none;
  }

  .input-sizer::after {
    content: attr(data-value);
    visibility: hidden;
    white-space: pre-wrap;
  }

  .select,
  .input-sizer::after {
    display: inline-block;
    cursor: pointer;
    padding: 2px 4px;
    border: 1px solid transparent;
    border-radius: 3px;
  }

  .select:focus-within {
    border: 1px dotted #000;
  }

  .select:hover {
    border: 1px solid #000;
  }

  .string {
    color: rgb(153, 18, 18);
    cursor: text;
  }

  input::placeholder {
    color: gray;
  }
</style>
