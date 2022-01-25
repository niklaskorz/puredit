<script lang="ts">
  //import AstEditor from "./asteditor/AstEditor.svelte";
  import CodeMirrorEditor from "./codemirroreditor/CodeMirrorEditor.svelte";
  //import MonacoEditor from "./monacoeditor/MonacoEditor.svelte";
  import TreeSitterEditor from "./treesittereditor/TreeSitterEditor.svelte";
</script>

<main>
  <CodeMirrorEditor />
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    overflow: auto;
  }
</style>
