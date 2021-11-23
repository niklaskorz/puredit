<script lang="ts">
  import type { editor } from "monaco-editor";
  import { onDestroy, onMount } from "svelte";
  import portal from "./portal";

  const domNode = document.createElement("div");
  let heightInPx = 0;
  let zoneId: string | null = null;

  export let editor: editor.ICodeEditor;
  export let line: number;
  export let column: number;

  onMount(() => {
    document.body.appendChild(domNode);
    heightInPx = domNode.clientHeight;
  });

  onDestroy(() => {
    editor.changeViewZones((accessor) => {
      if (zoneId) {
        accessor.removeZone(zoneId);
      }
    });
  });

  $: if (heightInPx) {
    editor.changeViewZones((accessor) => {
      if (zoneId) {
        accessor.removeZone(zoneId);
      }
      zoneId = accessor.addZone({
        afterLineNumber: line,
        domNode,
        heightInPx,
      });
    });
  }
</script>

<div
  class="view-zone"
  style="padding-left: {editor.getOffsetForColumn(line, column)}px;"
  use:portal={domNode}
  bind:clientHeight={heightInPx}
>
  <slot />
</div>

<style>
  .view-zone {
    z-index: 100;
  }
</style>
