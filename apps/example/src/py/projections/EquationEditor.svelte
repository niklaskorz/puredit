<script type="ts">
  import type { EditorState } from "@codemirror/state";
  import type { EditorView } from "@codemirror/view";
  import type { SyntaxNode } from "@puredit/parser";
  import type {
    CursorPositionHandler,
    FocusGroup,
  } from "@puredit/projections/focus";
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
  let activeFocusGroup: FocusGroup | null = null;

  MathfieldElement.fontsDirectory =
    "https://unpkg.com/mathlive@0.95.5/dist/fonts";
  MathfieldElement.soundsDirectory =
    "https://unpkg.com/mathlive@0.95.5/dist/sounds";

  const mfe = new MathfieldElement();

  (mfe as Partial<CursorPositionHandler>).focusGroupSetCursorPosition = (
    cursorPosition
  ) => {
    switch (cursorPosition) {
      case "start":
        mfe.executeCommand("moveToMathfieldStart");
        break;
      case "end":
        mfe.executeCommand("moveToMathfieldEnd");
        break;
    }
  };

  function updateMathfield(value: string) {
    if (!mfe.hasFocus()) {
      mfe.setValue(value, { silenceNotifications: true });
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
  mfe.addEventListener("focus-out", (e) => {
    switch (e.detail.direction) {
      case "forward":
        focusGroup.next(mfe);
        break;
      case "backward":
        focusGroup.previous(mfe);
        break;
    }
  });

  onMount(() => {
    target.appendChild(mfe);
    mfe.inlineShortcuts = {
      ...mfe.inlineShortcuts,
      matrix: "\\begin{pmatrix} \\end{pmatrix}",
      col: "&",
      row: "\\\\",
    };
  });

  function registerInFocusGroup(focusGroup: FocusGroup) {
    unregisterFromActiveFocusGroup();
    focusGroup.registerElement(mfe);
    activeFocusGroup = focusGroup;
  }

  function unregisterFromActiveFocusGroup() {
    if (activeFocusGroup) {
      activeFocusGroup.unregisterElement(mfe);
      activeFocusGroup = null;
    }
  }

  $: if (focusGroup) {
    registerInFocusGroup(focusGroup);
  } else {
    unregisterFromActiveFocusGroup();
  }

  onDestroy(() => {
    unregisterFromActiveFocusGroup();
  });
</script>

<span bind:this={target} />

<!-- svelte-ignore css-unused-selector -->
<style global>
  math-field {
    display: inline-flex;
    font-size: 1.2em;
    border-color: transparent;
    background-color: transparent;
    color: inherit;
  }
</style>
