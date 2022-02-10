<script lang="ts">
  import Editor from "./editors/codemirror/Editor.svelte";
  import Playground from "./parsers/lezer/Playground.svelte";
</script>

<main>
  <Editor />
</main>

<style>
  :global(body) {
    box-sizing: border-box;
  }

  :global(*, *::before, *::after) {
    box-sizing: inherit;
  }

  main {
    width: 100vw;
    height: 100vh;
    overflow: auto;
  }
</style>
