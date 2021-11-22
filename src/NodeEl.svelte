<script lang="ts">
  import ts, { isFunctionDeclaration, visitFunctionBody } from "typescript";
  import type { Node } from "./Node";
  import Widget from "./Widget.svelte";

  function children(node?: ts.Node): Node[] {
    if (!node) {
      return [];
    }
    return node.getChildren(sourceFile);
  }

  export let printer: ts.Printer;
  export let sourceFile: ts.SourceFile;
  export let node: Node;

  let text = "unknown";
  $: try {
    text = printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  } catch (e) {
    text = "(failed to parse)";
    console.error(e, node);
  }

  let widget: HTMLElement;
</script>

{#if ts.isFunctionDeclaration(node)}
  <div class="box">
    <div class="head">
      Function <b>{node.name?.text}</b>
    </div>
    <div class="items">
      {#each node.body?.statements ?? [] as child}
        <svelte:self {printer} {sourceFile} node={child} />
      {/each}
    </div>
  </div>
{:else if node.projectional}
  <Widget bind:el={widget} />
{:else}
  <div class="item">
    {text}
  </div>
{/if}

<style>
  .box {
    display: inline-block;
    margin: 5px 0;
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
</style>
