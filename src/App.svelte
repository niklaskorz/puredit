<script lang="ts">
  import Editor from "./editors/codemirror/Editor.svelte";
  import Playground from "./parsers/lezer/Playground.svelte";
</script>

<main>
  <Playground />
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    overflow: auto;
  }
</style>
