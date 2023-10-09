<script lang="ts">
  import DarkMode from "svelte-dark-mode";
  import type { Theme } from "svelte-dark-mode/types/DarkMode.svelte";
  import { basicSetup } from "codemirror";
  import { EditorState, Annotation, Compartment } from "@codemirror/state";
  import type { Extension } from "@codemirror/state";
  import { EditorView, keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  import { autocompletion } from "@codemirror/autocomplete";
  import { onDestroy, onMount } from "svelte";
  import { projectionPlugin, completions } from "@puredit/projections";
  import { oneDark } from "@codemirror/theme-one-dark";
  import {
    typescript,
    completionSource as typescriptCompletionSource,
  } from "@puredit/codemirror-typescript";
  import { indentationMarkers } from "@replit/codemirror-indentation-markers";
  import { projectionPluginConfig } from "./projections";

  let theme: Theme | undefined;
  let container: HTMLDivElement;
  let projectionalEditor: EditorView | undefined;

  const syncChangeAnnotation = Annotation.define<boolean>();
  const darkThemeCompartment = new Compartment();

  onMount(() => {
    const extensions: Extension[] = [
      basicSetup,
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
    ];
    const projectionalEditorExtensions = extensions.concat([
      typescript({ disableCompletions: true, disableTooltips: true }),
      projectionPlugin(projectionPluginConfig),
      autocompletion({
        activateOnTyping: true,
        override: [completions, typescriptCompletionSource],
      }),
    ]);

    projectionalEditor = new EditorView({
      state: EditorState.create({
        extensions: projectionalEditorExtensions,
      }),
      parent: container,
      dispatch(tr) {
        projectionalEditor!.update([tr]);
        if (!tr.changes.empty && !tr.annotation(syncChangeAnnotation)) {
          // TODO: Propagte changes to VS Code
        }
      },
    });

    projectionalEditor.dispatch();
  });

  onDestroy(() => {
    projectionalEditor?.destroy();
  });

  function onThemeChange(theme?: Theme) {
    const transaction = {
      effects: [
        darkThemeCompartment.reconfigure(theme === "dark" ? oneDark : []),
      ],
    };
    projectionalEditor?.dispatch(transaction);
  }

  // Dynamically update color scheme on theme change
  $: onThemeChange(theme);
</script>

<DarkMode bind:theme />

<div class="container" bind:this={container} />

<style>
  .container {
    width: 100%;
    height: 100%;
  }
</style>
