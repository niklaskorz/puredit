<script lang="ts" context="module">
  let nextId = 0;
  function genId(): number {
    return nextId++;
  }
</script>

<script lang="ts">
  import * as monaco from "monaco-editor";
  import { onDestroy, onMount } from "svelte";
  import portal from "../../shared/portal";

  interface Editor extends monaco.editor.IStandaloneCodeEditor {
    setHiddenAreas(areas: monaco.Range[]): void;
  }

  const domNode = document.createElement("span");
  domNode.style.zIndex = "100";
  let container: HTMLElement;
  let width = 0;
  let height = 0;
  let widgetId = genId();
  let widget: monaco.editor.IContentWidget | null = null;

  export let editor: Editor;
  export let line: number;
  export let column: number;

  const resizeObserver = new ResizeObserver(() => {
    width = container.offsetWidth;
    height = container.offsetHeight;
  });

  onMount(() => {
    document.body.appendChild(domNode);
    resizeObserver.observe(container);
    console.log("mounted");
  });

  onDestroy(() => {
    resizeObserver.disconnect();
    if (widget) {
      editor.removeContentWidget(widget);
    }
  });

  $: if (editor) {
    editor.setHiddenAreas([new monaco.Range(1, 5, 1, 10)]);
  }

  $: if (width && height) {
    resizeObserver.disconnect();
    widget = {
      getId: () => `ContentWidget.${widgetId}`,
      getDomNode: () => domNode,
      getPosition: () => ({
        position: {
          lineNumber: line,
          column,
        },
        range: {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column + 10,
        },
        preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
      }),
      beforeRender: () => ({
        width,
        height,
      }),
    };
    editor.addContentWidget(widget);
    requestAnimationFrame(() => {
      resizeObserver.observe(container);
    });
  }
</script>

<span use:portal={domNode} bind:this={container}>
  <slot />
</span>

<style>
  span {
    display: inline-block;
    cursor: pointer;
    white-space: nowrap;
  }
</style>
