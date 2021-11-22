<script lang="ts">
    import type { editor } from "monaco-editor";
    import { onDestroy, onMount } from "svelte";
    import portal from "./portal";

    const domNode = document.createElement("div");
    let heightInPx = 0;
    let zoneId: string | null = null;

    export let editor: editor.ICodeEditor;
    export let afterLineNumber: number;

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
                afterLineNumber,
                domNode,
                heightInPx,
            });
        });
    }
</script>

<div class="view-zone" use:portal={domNode} bind:clientHeight={heightInPx}>
    <slot />
</div>

<style>
    .view-zone {
        z-index: 100;
        padding: 20px 0;
    }
</style>
