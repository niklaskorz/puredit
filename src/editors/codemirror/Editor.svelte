<script lang="ts">
  import { EditorState, basicSetup } from "@codemirror/basic-setup";
  import type { Extension } from "@codemirror/state";
  import { EditorView, keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  import { autocompletion } from "@codemirror/autocomplete";
  import { javascript } from "@codemirror/lang-javascript";
  import { onDestroy, onMount } from "svelte";
  import { example } from "../../shared/code";
  import { projectionPlugin } from "./projections";
  import { linter, lintGutter } from "@codemirror/lint";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { typescript } from "./extensions/typescript";

  let container: HTMLDivElement;
  let projectionalEditor: EditorView;
  let codeEditor: EditorView;

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
    const extensions: Extension[] = [
      // EditorView.theme({}, { dark: true }),
      basicSetup,
      keymap.of([indentWithTab]),
      oneDark,
      autocompletion(),
      typescript(),
      // typechecker,
      // lintGutter(),
    ];
    projectionalEditor = new EditorView({
      state: EditorState.create({
        doc: example,
        extensions: extensions.concat([projectionPlugin]),
      }),
      parent: container,
      dispatch(tr) {
        projectionalEditor.update([tr]);
        if (!tr.changes.empty) {
          codeEditor.setState(
            EditorState.create({
              doc: tr.state.doc,
              extensions,
            })
          );
        }
      },
    });
    codeEditor = new EditorView({
      state: EditorState.create({
        doc: example,
        extensions,
      }),
      parent: container,
      dispatch(tr) {
        codeEditor.update([tr]);
        if (!tr.changes.empty) {
          projectionalEditor.setState(
            EditorState.create({
              doc: tr.state.doc,
              extensions: extensions.concat([projectionPlugin]),
            })
          );
        }
      },
    });
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
    display: flex;
    & > .cm-editor {
      flex: 1;
    }
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
</style>
