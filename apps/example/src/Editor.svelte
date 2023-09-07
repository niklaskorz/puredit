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
  import { example, typeDeclarationsMap } from "./code";
  import { projectionPlugin, completions } from "@puredit/projections";
  import { oneDark } from "@codemirror/theme-one-dark";
  import {
    injectTypes,
    typescript,
    completionSource as typescriptCompletionSource,
  } from "@puredit/codemirror-typescript";
  import { indentationMarkers } from "@replit/codemirror-indentation-markers";
  import { projectionPluginConfig } from "./projections";

  let theme: Theme | undefined;
  let container: HTMLDivElement;
  let projectionalEditor: EditorView | undefined;
  let codeEditor: EditorView | undefined;

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
    const codeEditorExtensions = extensions.concat([typescript()]);

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

    projectionalEditor.dispatch(injectTypes(typeDeclarationsMap));
    codeEditor.dispatch(injectTypes(typeDeclarationsMap));
  });

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

<DarkMode bind:theme />

<div class="container" bind:this={container} />

<style>
  .container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 50% 50%;
  }
</style>
