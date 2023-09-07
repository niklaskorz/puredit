<script lang="ts">
  import { tags } from "@lezer/highlight";
  import type { EditorState } from "@codemirror/state";
  import { highlightingFor } from "@codemirror/language";

  export let state: EditorState;
</script>

<span class={highlightingFor(state, [tags.keyword])}><slot /></span>
