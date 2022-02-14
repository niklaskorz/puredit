<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import type { SyntaxNode } from "@lezer/common";
  import { onDestroy } from "svelte";
  import type { FocusGroup } from "./focus";
  import { stringLiteralValue, stringLiteralValueChange } from "./shared";

  export let view: EditorView | null;
  export let node: SyntaxNode;
  export let state: EditorState;

  export let targetNodes: SyntaxNode[] | null = null;

  export let className: string | null = null;
  export let placeholder: string = "text";
  export let focus: boolean = false;
  export let focusGroup: FocusGroup | null = null;

  let input: HTMLInputElement | undefined;
  $: if (input && view && focus) {
    input.focus();
  }
  $: if (input && focusGroup) {
    focusGroup.registerElement(input);
  }

  onDestroy(() => {
    if (input && focusGroup) {
      focusGroup.unregisterElement(input);
    }
  });

  type ValidationFunction = (value: string) => string | undefined;
  export let validate: ValidationFunction | null = null;
  let error: string | undefined;
  let value = "";
  $: {
    value = stringLiteralValue(node, state.doc);
    if (validate) {
      error = validate(value);
    }
  }

  function updateValue(value: string) {
    view?.dispatch({
      filter: false,
      changes:
        targetNodes?.map((targetNode) =>
          stringLiteralValueChange(targetNode, value)
        ) ?? stringLiteralValueChange(node, value),
    });
  }

  const onInput: svelte.JSX.FormEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    updateValue(currentTarget.value);
  };

  const onKeydown: svelte.JSX.KeyboardEventHandler<HTMLInputElement> = (e) => {
    // Completion
    if (filteredCompletions.length) {
      if (e.key === "ArrowUp") {
        selectedCompletion -= 1;
        if (selectedCompletion < 0) {
          selectedCompletion += filteredCompletions.length;
        }
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowDown") {
        selectedCompletion += 1;
        if (selectedCompletion >= filteredCompletions.length) {
          selectedCompletion -= filteredCompletions.length;
        }
        e.preventDefault();
        return;
      }
      if (e.key === "Enter") {
        updateValue(filteredCompletions[selectedCompletion]);
        focusGroup?.next(e.currentTarget);
        e.preventDefault();
        return;
      }
    }

    // Focus management
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

  export let completions: string[] = [];
  let filteredCompletions = completions;
  let selectedCompletion = 0;
  $: {
    filteredCompletions = completions.filter((completion) =>
      completion.toLocaleLowerCase().includes(value.toLocaleLowerCase())
    );
    selectedCompletion = 0;
  }
</script>

<label data-value={value || placeholder}>
  <input
    class="{className} {error ? 'input-error' : ''}"
    bind:this={input}
    type="text"
    {placeholder}
    size="1"
    {value}
    on:input={onInput}
    on:keydown={onKeydown}
  />
  <div class="tooltip">
    {#if value && error}
      <div class="tooltip-error" title={error}>
        Error: {error}
      </div>
    {/if}
    {#if filteredCompletions.length}
      <ul class="tooltip-completion">
        {#each filteredCompletions as completion, i}
          <li
            class={selectedCompletion === i ? "selected" : ""}
            on:pointerdown={() => updateValue(completion)}
          >
            {completion}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
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

  .input-error {
    text-decoration-line: underline;
    text-decoration-style: wavy;
    text-decoration-color: #d11;
  }

  .tooltip {
    display: none;
    position: absolute;
    left: 0;
    top: 100%;
    background-color: #111;
    color: #ccc;
    z-index: 100;
    border-radius: 4px;
    font-size: 12px;
    padding: 5px 0;
    white-space: nowrap;
    min-width: 100%;

    label:focus-within > & {
      display: block;
    }
  }

  .tooltip-error {
    padding: 5px 10px;
    text-overflow: ellipsis;
    overflow-x: hidden;
    max-width: 300px;
    border-bottom: 1px solid #333;
    font-family: var(--system-font, sans-serif);
  }

  .tooltip-completion {
    list-style: none;
    margin: 0;
    margin-top: 5px;
    padding: 0;

    & > li {
      padding: 5px 10px;
      cursor: pointer;

      &.selected,
      &:hover {
        background-color: #333;
      }

      &.selected {
        text-decoration: underline;
      }
    }
  }
</style>
