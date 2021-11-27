<script lang="ts">
  import Select from "svelte-select";
  import type { SourceFile } from "typescript";
  import type * as monaco from "monaco-editor";
  import type { Block } from "./blocks";
  import type { Value } from "./parse";
  import ts from "typescript";

  let select: Select;
  export let block: Block;
  export let sourceFile: SourceFile;
  export let editor: monaco.editor.ICodeEditor;
  export let model: monaco.editor.ITextModel;

  interface Part {
    type: string;
    value: string;
    onChange?(): void;
  }

  const changeable = (value: Value) => () => {
    const newValue = prompt("Insert new value", value.value);
    if (!newValue) {
      return;
    }
    const text = JSON.stringify(newValue);
    const start = ts.getLineAndCharacterOfPosition(sourceFile, value.start);
    const end = ts.getLineAndCharacterOfPosition(sourceFile, value.end);
    model.pushEditOperations(
      null,
      [
        {
          range: {
            startLineNumber: start.line + 1,
            startColumn: start.character + 1,
            endLineNumber: end.line + 1,
            endColumn: end.character + 1,
          },
          text,
        },
      ],
      () => null
    );
  };

  const mapOperations = (block: Block): Part[][] =>
    block.operations.map((op) => {
      if (op.type === "replace") {
        return [
          { type: "label", value: "Replace" },
          {
            type: "string",
            value: op.target.value,
            onChange: changeable(op.target),
          },
          { type: "label", value: "in" },
          {
            type: "identifier",
            value: op.column.value,
            onChange: changeable(op.column),
          },
          { type: "label", value: "with" },
          {
            type: "string",
            value: op.value.value,
            onChange: changeable(op.value),
          },
        ];
      }
      if (op.type === "trim") {
        return [
          { type: "label", value: "Trim" },
          {
            type: "identifier",
            value: op.column.value,
            onChange: changeable(op.column),
          },
          { type: "label", value: "on" },
          {
            type: "enum",
            value: op.direction.value,
            onChange: changeable(op.direction),
          },
        ];
      }
      return [];
    });

  let items = [
    { value: "replace", label: "Replace" },
    { value: "trim", label: "Trim" },
  ];

  function addOperation(code: string) {
    const pos = ts.getLineAndCharacterOfPosition(sourceFile, block.insertAt);
    model.pushEditOperations(
      null,
      [
        {
          range: {
            startLineNumber: pos.line + 1,
            startColumn: pos.character + 1,
            endLineNumber: pos.line + 1,
            endColumn: pos.character + 1,
          },
          text: code,
        },
      ],
      () => null
    );
    editor.getAction("editor.action.formatDocument").run();
  }

  function handleSelect(event: any) {
    const value = event.detail.value;
    if (value === "replace") {
      addOperation('table.column("<column>").replace("<target>", "<value>");');
    } else if (value === "trim") {
      addOperation('table.column("<column>").trim("<direction>");');
    }
    select.handleClear();
  }
</script>

<div class="inner">
  <div class="head">
    Change table <span class="select" on:click={changeable(block.table)}
      ><span class="identifier">{block.table.value}</span> &#9660;</span
    >
  </div>
  <div class="items">
    {#each mapOperations(block) as op}
      <div class="item">
        {#each op as part}
          {#if part.type === "label"}
            {part.value}
          {:else}
            <span class="select" on:click={part.onChange}>
              <span class={part.type}>{part.value}</span> &#9660;
            </span>
          {/if}{" "}
        {/each}
      </div>
    {/each}
    <div class="item new">
      <Select
        placeholder="Add new operation..."
        {items}
        placeholderAlwaysShow={true}
        on:select={handleSelect}
        bind:this={select}
      />
    </div>
  </div>
</div>

<style>
  .inner {
    margin: 0;
    display: inline-block;
    border: 1px solid #000;
  }

  .head {
    padding: 10px;
    border-bottom: 1px solid #000;
  }

  .items {
    padding: 10px;
  }

  .item {
    margin: 5px 0;
  }

  .new {
    margin-top: 15px;
    /*font-style: italic;
    color: gray;
    cursor: text;*/
  }

  .select {
    display: inline-block;
    cursor: pointer;
    padding: 2px 4px;
    border: 1px solid transparent;
    border-radius: 3px;
  }

  .select:hover {
    border: 1px solid #000;
  }

  .identifier {
    font-weight: bold;
  }

  .string {
    color: rgb(153, 18, 18);
  }

  .enum {
    color: rgb(20, 112, 20);
  }
</style>
