<script lang="ts">
    import type { editor } from "monaco-editor";
    import { onDestroy, onMount } from "svelte";
    import portal from "./portal";

    const domNode = document.createElement("div");
    domNode.style.zIndex = "100";
    let container: HTMLElement;
    let heightInPx = 0;
    let zoneId: string | null = null;

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
    style="padding-left: {editor.getOffsetForColumn(line, column)}px;"
    use:portal={domNode}
    bind:this={container}
>
    <slot />
</div>
