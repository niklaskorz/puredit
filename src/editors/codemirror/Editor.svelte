<script lang="ts">
  import { EditorState, basicSetup } from "@codemirror/basic-setup";
  import { Extension, Annotation } from "@codemirror/state";
  import { EditorView, keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  import { onDestroy, onMount } from "svelte";
  import { example, typeDeclarationsMap } from "../../shared/code";
  import { projectionPlugin } from "./projections";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { injectTypes, typescript } from "./extensions/typescript";

  let container: HTMLDivElement;
  let projectionalEditor: EditorView;
  let codeEditor: EditorView;

  const syncChangeAnnotation = Annotation.define<boolean>();

  onMount(() => {
    const extensions: Extension[] = [
      basicSetup,
      keymap.of([indentWithTab]),
      oneDark,
    ];
    projectionalEditor = new EditorView({
      state: EditorState.create({
        doc: example,
        extensions: extensions.concat([typescript(true), projectionPlugin]),
      }),
      parent: container,
      dispatch(tr) {
        projectionalEditor.update([tr]);
        if (!tr.changes.empty && !tr.annotation(syncChangeAnnotation)) {
          codeEditor.dispatch({
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
        extensions: extensions.concat([typescript()]),
      }),
      parent: container,
      dispatch(tr) {
        codeEditor.update([tr]);
        if (!tr.changes.empty && !tr.annotation(syncChangeAnnotation)) {
          projectionalEditor.dispatch({
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
    projectionalEditor.destroy();
    codeEditor.destroy();
  });
</script>

<div class="container" bind:this={container} />

<style global lang="scss">
  .container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 50% 50%;
  }

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
