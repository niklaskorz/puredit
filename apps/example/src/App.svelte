<script lang="ts">
  import TypescriptEditor from "./ts/Editor.svelte";
  import PythonEditor from "./py/Editor.svelte";

  let activeTab: "ts" | "py" = "ts";

  function selectTypescript() {
    activeTab = "ts";
  }

  function selectPython() {
    activeTab = "py";
  }
</script>

<main>
  <ul class="tab-list">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <li class={activeTab === "ts" ? "active" : ""} on:click={selectTypescript}>
      TypeScript
    </li>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <li class={activeTab === "py" ? "active" : ""} on:click={selectPython}>
      Python
    </li>
  </ul>
  {#if activeTab === "ts"}
    <TypescriptEditor />
  {:else if activeTab === "py"}
    <PythonEditor />
  {/if}
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

  .tab-list {
    font-family: var(--system-font);
    display: flex;
    list-style: none;
    background-color: #111;
    color: #fff;
    margin: 0;
    padding: 0 10px;
    font-size: 0.8em;
  }

  .tab-list > li {
    padding: 10px 10px;
    border: 1px solid transparent;
    cursor: pointer;
  }

  .tab-list > li:hover {
    border-color: #fff;
  }

  .tab-list > li.active {
    text-decoration: underline;
  }
</style>
