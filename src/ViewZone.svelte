<script lang="ts">
  import type { editor } from "monaco-editor";
  import { onDestroy, onMount } from "svelte";
  import portal from "./portal";

  const domNode = document.createElement("div");
  domNode.style.zIndex = "100";
  let container: HTMLElement;
  let heightInPx = 0;
  let zoneId: string | null = null;
  let offset = 0;
  // `getOffsetForColumn` does not work if the given line and column are currently not visible.
  // As a workaround, we assume that a character is 9 logical pixels wide.
  // This roughly works for the chosen monospace font Fira Code at font size 14.
  $: offset = 9 * (column - 1);

  export let editor: editor.ICodeEditor;
  export let line: number;
  export let column: number;

  const resizeObserver = new ResizeObserver(() => {
    heightInPx = container.offsetHeight;
  });

  onMount(() => {
    document.body.appendChild(domNode);
    resizeObserver.observe(container);
    console.log("mounted");
  });

  onDestroy(() => {
    resizeObserver.disconnect();
    editor.changeViewZones((accessor) => {
      if (zoneId) {
        accessor.removeZone(zoneId);
      }
    });
  });

  $: if (heightInPx) {
    resizeObserver.disconnect();
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
    requestAnimationFrame(() => {
      resizeObserver.observe(container);
    });
  }
</script>

<div
  class="view-zone"
  style="padding-left: {offset}px;"
  use:portal={domNode}
  bind:this={container}
>
  <slot />
</div>

<style>
  .view-zone {
    padding: 5px 0;
  }
</style>
