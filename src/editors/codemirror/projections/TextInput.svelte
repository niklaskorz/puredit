<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import type { SyntaxNode } from "@lezer/common";
  import type { FocusGroup } from "./focus";
  import { stringLiteralValue, stringLiteralValueChange } from "./shared";

  export let view: EditorView | null;
  export let node: SyntaxNode;
  export let state: EditorState;

  export let targetNodes: SyntaxNode[] | null = null;

  export let className: string | null = null;
  export let placeholder: string = "text";
  export let focus: boolean = false;
  export let focusGroup: FocusGroup | undefined;

  let input: HTMLInputElement;
  $: if (view && focus) {
    input.focus();
  }
  $: if (input && focusGroup) {
    focusGroup.registerElement(input);
  }

  let value = "";
  $: value = stringLiteralValue(node, state.doc);

  const onInput: svelte.JSX.FormEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    view?.dispatch({
      filter: false,
      changes:
        targetNodes?.map((targetNode) =>
          stringLiteralValueChange(targetNode, currentTarget.value)
        ) ?? stringLiteralValueChange(node, currentTarget.value),
    });
  };

  const onKeydown: svelte.JSX.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const pos = e.currentTarget.selectionStart;
    if (!focusGroup || pos !== e.currentTarget.selectionEnd) {
      return;
    }
    if (e.key === "ArrowLeft" && pos === 0) {
      e.preventDefault();
      focusGroup.previous(e.currentTarget);
    } else if (e.key === "ArrowRight" && pos === e.currentTarget.value.length) {
      e.preventDefault();
      focusGroup.next(e.currentTarget);
    }
  };
</script>

<label data-value={value || placeholder}>
  <input
    class={className}
    bind:this={input}
    type="text"
    {placeholder}
    size="1"
    {value}
    on:input={onInput}
    on:keydown={onKeydown}
  />
</label>

<style lang="scss">
  /* Reset style overrides of editor */
  label {
    caret-color: #528bff !important;
    & ::selection {
      background: #3e4451 !important;
    }
    & :focus::selection {
      background: #3e4451 !important;
    }
  }

  label {
    display: inline-grid;
    vertical-align: top;
    align-items: center;
    position: relative;
    margin: 0 5px;

    &::after {
      content: attr(data-value);
      visibility: hidden;
      white-space: pre-wrap;
    }
  }

  input {
    position: relative;

    &::placeholder {
      color: gray;
    }

    &:hover {
      border-color: inherit;
      border-style: dashed;
    }

    &:focus-within {
      border-color: inherit;
      border-style: solid;
    }
  }

  label::after,
  input {
    width: auto;
    min-width: 1em;
    grid-area: 1 / 2;
    font: inherit;
    margin: 0;
    resize: none;
    background: none;
    appearance: none;
    outline: none;

    display: inline-block;
    padding: 2px 4px;
    border: 1px solid transparent;
    border-radius: 3px;
  }
</style>
