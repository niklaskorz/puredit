<script>
  import { distinctProjectionKeywords } from "./config";
</script>

{#if distinctProjectionKeywords}
  <b><slot /></b>
{:else}
  <span class="ͼa"><slot /></span>
{/if}
