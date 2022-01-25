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

  let container: HTMLDivElement;
  let editor: EditorView;

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
</style>
