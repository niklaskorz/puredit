<script lang="ts">
  import ts from "typescript";
  import { setContext } from "svelte";
  import { example } from "../../shared/code";
  import Node from "./Node.svelte";
  import { nodes } from "./nodes";
  import { writable } from "svelte/store";

  interface OverlayData {
    content: string;
    top: number;
    left: number;
  }

  let sourceFile = ts.createSourceFile(
    "script.ts",
    example,
    ts.ScriptTarget.ES2021
  );
  let overlayHistory: OverlayData[] = [];
  let overlay: OverlayData | undefined = undefined;

  setContext("overlay", {
    activeId: writable([-1]),
    addOverlay(data: OverlayData) {
      if (overlay) {
        overlayHistory.push(overlay);
      }
      overlay = data;
    },
    popOverlay() {
      overlay = overlayHistory.pop();
    },
  });
</script>

<div class="editor">
  <Node element={nodes[sourceFile.kind](sourceFile)} />
  {#if overlay}
    <div class="overlay" style="top: {overlay.top}px; left: {overlay.left}px;">
      {overlay.content}
    </div>
  {/if}
</div>

<style>
  .editor {
    padding: 10px;
    line-height: 2;
    font-size: 14px;
    font-family: "Fira Code", "Menlo", "Monaco", "Consolas", monospace;
    position: relative;
    white-space: pre;
  }

  .overlay {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    font-weight: bold;
    position: absolute;
    background-color: #fff;
    border: 1px solid #000;
    border-radius: 3px;
    padding: 2px 8px;
  }
</style>
