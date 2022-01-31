<script lang="ts">
  import Editor from "./editors/codemirror/Editor.svelte";
  import Playground from "./parsers/treesitter/Playground.svelte";
</script>

<main>
  <Editor />
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    overflow: auto;
  }
</style>
