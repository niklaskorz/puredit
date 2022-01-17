<script lang="ts">
  import ts, { SyntaxKind } from "typescript";
  import type { Node, SourceFile } from "typescript";
  import {
    nodes,
    Element,
    Block,
    Inline,
    EachNode,
    DebugNode,
    PropertyNode,
    TextNode,
  } from "./nodes";

  export let element: Element;
  export let sourceFile: SourceFile;
  export let node: Node;

  function getPropertyNode(property: string): Node {
    return (node as any)[property] as Node;
  }

  function getPropertyNodes(property: string): Node[] {
    return (node as any)[property] as Node[];
  }

  function getPropertyString(property: string): string {
    return (node as any)[property] as string;
  }
</script>

{#if element instanceof Block}
  <div class={element.classes}>
    {#each element.content as child}<svelte:self
        element={child}
        {sourceFile}
        {node}
      />{/each}
  </div>
{:else if element instanceof Inline}
  <span class={element.classes}
    >{#each element.content as child}<svelte:self
        element={child}
        {sourceFile}
        {node}
      />{/each}</span
  >
{:else if element instanceof PropertyNode}
  <svelte:self
    element={nodes[getPropertyNode(element.selector).kind]}
    {sourceFile}
    node={getPropertyNode(element.selector)}
  />
{:else if element instanceof TextNode}
  {node.getText(sourceFile)}
{:else if element instanceof EachNode}
  {#each getPropertyNodes(element.selector) as child, i}
    {#if i !== 0}{element.delimiter}{/if}<svelte:self
      element={nodes[child.kind]}
      {sourceFile}
      node={child}
    />
  {/each}
{:else if element instanceof DebugNode}
  <div>
    {ts.SyntaxKind[node.kind]} ({node.kind})
  </div>
{:else}{element}{/if}

<style>
  .indent {
    padding-left: 17px;
    border-left: 1px solid #ccc;
  }

  .keyword {
    color: purple;
  }

  .literal-value {
    color: blue;
  }

  .string-literal {
    color: darkred;
  }

  .numeric-literal {
    color: green;
  }

  .identifier {
  }
</style>
