<script lang="ts">
  import { EditorState, basicSetup } from "@codemirror/basic-setup";
  import { EditorView, keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  import { autocompletion } from "@codemirror/autocomplete";
  import { javascript } from "@codemirror/lang-javascript";
  import { onDestroy, onMount } from "svelte";
  import { example } from "../code";
  import { checkboxPlugin } from "./CheckboxPlugin";
  import { textPlugin } from "./TextPlugin";
  import { linter } from "@codemirror/lint";

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
          textPlugin,
          typechecker,
        ],
      }),
      parent: container,
    });
  });

  onDestroy(() => {
    editor.destroy();
  });
</script>

<div bind:this={container} />

<style>
  :global(.cm-content) {
    font-family: "JetBrains Mono", "SF Mono", "Menlo", "Consolas", "Monaco",
      "Courier New", monospace;
    font-size: 16px;
  }

  :global(.cm-text-widget) {
    caret-color: black;
  }

  :global(.cm-tooltip) {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
  }
</style>
