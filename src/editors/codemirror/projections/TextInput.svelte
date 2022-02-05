<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import type { SyntaxNode } from "@lezer/common";

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
  $: {
    value = state.doc
      .sliceString(node.from + 1, node.to - 1)
      .replaceAll("\\\\", "\\")
      .replaceAll('\\"', '"')
      .replaceAll("\\'", "'")
      //.replaceAll(" ", "·")
      .replaceAll("\n", "↵");
  }

  const onInput: svelte.JSX.FormEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    view?.dispatch({
      filter: false,
      changes: {
        from: node.from + 1,
        to: node.to - 1,
        insert: currentTarget.value
          .replaceAll("\\", "\\\\")
          .replaceAll('"', '\\"')
          .replaceAll("'", "\\'")
          //.replaceAll("·", " ")
          .replaceAll("↵", "\n"),
      },
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
  :global(.ͼ2) label {
    caret-color: black !important;
    & ::selection {
      background: #d9d9d9 !important;
    }
    & :focus::selection {
      background: #d7d4f0 !important;
    }
  }
  :global(.ͼ3) label {
    & ::selection {
      background: #222 !important;
    }
    & :focus::selection {
      background: #233 !important;
    }
  }

  label {
    display: inline-grid;
    vertical-align: top;
    align-items: center;
    position: relative;
    margin: 0 4px;

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

    &:focus-within {
      border: 1px dotted #000;
      z-index: 100;
    }

    &:hover {
      border: 1px solid #000;
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
