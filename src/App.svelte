<script lang="ts">
  import Editor from "./Editor.svelte";
  import AstEditor from "./AstEditor.svelte";
</script>

<main>
  <AstEditor />
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    overflow: auto;
  }
</style>
