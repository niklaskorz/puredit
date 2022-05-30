<script type="ts">
  import type { EditorState } from "@codemirror/state";
  import type { EditorView } from "@codemirror/view";
  import type { SyntaxNode } from "@puredit/parser";
  import type { FocusGroup } from "@puredit/projections/focus";
  import {
    stringLiteralValue,
    stringLiteralValueChange,
  } from "@puredit/projections/shared";
  import { MathfieldElement } from "mathlive";
  import { onDestroy, onMount } from "svelte";

  export let view: EditorView | null;
  export let node: SyntaxNode;
  export let state: EditorState;
  export let focusGroup: FocusGroup | null = null;

  let target: HTMLElement;

  const mfe = new MathfieldElement({
    fontsDirectory: "https://unpkg.com/mathlive@0.73.6/dist/fonts",
    soundsDirectory: "https://unpkg.com/mathlive@0.73.6/dist/sounds",
  });

  function updateMathfield(value: string) {
    if (!mfe.hasFocus()) {
      mfe.setValue(value, { suppressChangeNotifications: true });
    }
  }

  $: updateMathfield(stringLiteralValue(node, state.doc));
  mfe.addEventListener("input", () => {
    view?.dispatch({
      filter: false,
      changes: stringLiteralValueChange(node, mfe.value),
    });
  });
  mfe.addEventListener("move-out", (e) => {
    switch (e.detail.direction) {
      case "forward":
      case "downward":
        focusGroup.next(mfe);
        break;
      case "backward":
      case "upward":
        focusGroup.previous(mfe);
        break;
    }
  });

  onMount(() => {
    target.appendChild(mfe);
    mfe.setOptions({
      inlineShortcuts: {
        ...mfe.getOption("inlineShortcuts"),
        matrix: "\\begin{pmatrix} \\end{pmatrix}",
        col: "&",
        row: "\\\\",
      },
    });
  });

  $: if (mfe && focusGroup) {
    focusGroup.registerElement(mfe);
  }

  onDestroy(() => {
    if (mfe && focusGroup) {
      focusGroup.unregisterElement(mfe);
    }
  });
</script>

<span bind:this={target} />

<style global>
  math-field {
    display: inline-flex;
    font-size: 1.2em;
  }
</style>
