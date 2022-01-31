<script lang="ts">
  import { getContext } from "svelte";
  import { SyntaxKind } from "typescript";
  import {
    nodes,
    Element,
    Block,
    Inline,
    isTsNode,
    isStatement,
  } from "./nodes";
  import { isString, nextId } from "../../shared/utils";

  export let element: Element;
  let container: HTMLElement;
  let extraClasses = "";
  let id = nextId();

  const { activeId, addOverlay, popOverlay } = getContext("overlay");

  function onMouseEnter() {
    if (!isTsNode(element)) {
      return;
    }
    activeId.update((ids: number[]) => {
      ids.push(id);
      return ids;
    });
    addOverlay({
      content: SyntaxKind[element.kind],
      top: container.offsetTop + container.offsetHeight,
      left: container.offsetLeft,
    });
  }

  function onMouseLeave() {
    if (!isTsNode(element)) {
      return;
    }
    activeId.update((ids: number[]) => {
      ids.pop();
      return ids;
    });
    popOverlay();
  }

  $: {
    if ($activeId[$activeId.length - 1] === id) {
      extraClasses = "active";
    } else {
      extraClasses = "";
    }
  }
</script>

{#if element instanceof Block}
  <div class={element.classes}>
    {#each element.content as child}<svelte:self element={child} />{/each}
  </div>
{:else if element instanceof Inline}
  <div class="inline {element.classes}">
    {#each element.content as child}<svelte:self element={child} />{/each}
  </div>
{:else if isTsNode(element)}
  <div
    data-kind={SyntaxKind[element.kind]}
    class={[isStatement(element) ? "" : "inline", extraClasses].join(" ")}
    on:mouseenter={onMouseEnter}
    on:mouseleave={onMouseLeave}
    bind:this={container}
  >
    <svelte:self element={nodes[element.kind](element)} />
  </div>
{:else if isString(element)}{element}{/if}

<style>
  div {
    background: inherit;
  }

  .inline {
    display: inline;
  }

  .active {
    background-color: rgb(231, 245, 255);
    border-radius: 3px;
  }

  .indent {
    padding-left: 17px;
    border-left: 1px solid #ccc;
  }

  .keyword {
    color: #00f;
  }

  .string-literal {
    color: #a31515;
  }

  .numeric-literal {
    color: #098658;
  }

  .identifier {
    color: #000;
  }

  .editable {
    cursor: pointer;
  }

  .editable:hover {
    background-color: #aaa;
  }
</style>
