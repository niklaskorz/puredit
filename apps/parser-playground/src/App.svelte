<script lang="ts">
  import Playground from "./Playground.svelte";
</script>

<main>
  <Playground />
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
    --system-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
    --mono-font: "JetBrains Mono", "SF Mono", "Menlo", "Consolas", "Monaco",
      "Courier New", monospace;
  }
</style>
