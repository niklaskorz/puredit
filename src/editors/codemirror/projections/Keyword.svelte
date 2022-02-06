<script lang="ts">
  import type { EditorState } from "@codemirror/basic-setup";
  import { HighlightStyle, tags } from "@codemirror/highlight";

  export let state: EditorState;
</script>

<span class={HighlightStyle.get(state, tags.keyword)}><slot /></span>
