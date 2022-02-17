<script lang="ts">
  import DarkMode from "svelte-dark-mode";
  import type { Theme } from "svelte-dark-mode/types/DarkMode.svelte";
  import { EditorState, basicSetup } from "@codemirror/basic-setup";
  import { Extension, Annotation, Compartment } from "@codemirror/state";
  import { EditorView, keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  import { onDestroy, onMount } from "svelte";
  import { example, typeDeclarationsMap } from "../../shared/code";
  import { projectionPlugin } from "./projections";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { injectTypes, typescript } from "./extensions/typescript";

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
    ];
    const projectionalEditorExtensions = extensions.concat([
      typescript(true),
      projectionPlugin,
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

<style global lang="scss">
  .container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 50% 50%;
  }

  .cm-editor .cm-scroller {
    font-family: var(--mono-font, monospace);
    font-size: 14px;
  }

  .cm-tooltip {
    font-family: var(--system-font, sans-serif);
  }

  .cm-boolean-toggle {
    cursor: pointer;
  }

  .ͼ1 .cm-line.flex {
    display: flex;
    align-items: center;
  }

  .inline-flex {
    display: inline-flex;
    align-items: center;
  }

  .flex > *,
  .inline-flex > * {
    flex: 0 0 auto;
  }

  .ͼ1 .cm-gutterElement {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .cm-completionIcon {
    box-sizing: content-box;
  }

  .cm-completionIcon-projection::after {
    content: "✨";
  }
</style>
