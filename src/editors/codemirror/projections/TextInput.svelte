<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import type { SyntaxNode } from "@lezer/common";
  import { stringLiteralValue, stringLiteralValueChange } from "./shared";

  export let view: EditorView | null;
  export let node: SyntaxNode;
  export let state: EditorState;

  export let className: string | null = null;
  export let placeholder: string = "text";
  export let autofocus: boolean = false;

  let input: HTMLInputElement;
  $: if (view && autofocus) {
    input.focus();
  }

  let value = "";
  $: value = stringLiteralValue(node, state.doc);

  const onInput: svelte.JSX.FormEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    view?.dispatch({
      filter: false,
      changes: stringLiteralValueChange(node, currentTarget.value),
    });
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
