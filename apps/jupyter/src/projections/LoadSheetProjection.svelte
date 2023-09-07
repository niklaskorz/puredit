<script lang="ts">
  import { onMount } from "svelte";
  import { tags } from "@lezer/highlight";
  import type { EditorState } from "@codemirror/state";
  import type { EditorView } from "@codemirror/view";
  import { highlightingFor } from "@codemirror/language";
  import type { Match } from "@puredit/parser";
  import type { FocusGroup } from "@puredit/projections/focus";
  import TextInput from "@puredit/projections/TextInput.svelte";
  import type { ContextGlobal } from "./context";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  // svelte-ignore unused-export-let
  export let context: ContextGlobal;
  export let state: EditorState;
  export let focusGroup: FocusGroup;

  onMount(() => {
    if (isNew) {
      requestAnimationFrame(() => {
        focusGroup.first();
      });
    }
  });
</script>

<span class="inline-flex">
  <span>load sheet</span>
  <TextInput
    className={highlightingFor(state, [tags.string])}
    node={match.args.sheetName}
    {state}
    {view}
    {focusGroup}
    placeholder="sheet name"
  />
  <span>from</span>
  <TextInput
    className={highlightingFor(state, [tags.string])}
    node={match.args.fileName}
    {state}
    {view}
    {focusGroup}
    placeholder="file name"
  />
  <span class="colon">:</span>
</span>

<style>
  .colon {
    margin-left: -10px;
  }
</style>
