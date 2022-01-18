<script lang="ts">
  //import AstEditor from "./asteditor/AstEditor.svelte";
  //import MonacoEditor from "./monacoeditor/MonacoEditor.svelte";
  import TreeSitterEditor from "./treesittereditor/TreeSitterEditor.svelte";
</script>

<main>
  <TreeSitterEditor />
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    overflow: auto;
  }
</style>
