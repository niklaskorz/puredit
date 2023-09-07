<script lang="ts">
  import { onMount } from "svelte";
  import { tags } from "@lezer/highlight";
  import type { EditorState } from "@codemirror/state";
  import type { EditorView } from "@codemirror/view";
  import { highlightingFor } from "@codemirror/language";
  import type { Match } from "@puredit/parser";
  import type { FocusGroup } from "@puredit/projections/focus";
  import TextInput from "@puredit/projections/TextInput.svelte";
  import type { ContextTable } from "./context";
  import { listCodeToValue, listValueToCode } from "./helpers";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  // svelte-ignore unused-export-let
  export let context: ContextTable;
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
  <span>take</span>
  <TextInput
    className={highlightingFor(state, [tags.atom])}
    node={match.args.columns}
    {state}
    {view}
    {focusGroup}
    placeholder="columns"
    codeToValue={listCodeToValue}
    valueToCode={listValueToCode}
  />
  <span>from</span>
  <TextInput
    className={highlightingFor(state, [tags.atom])}
    node={match.args.sheetRange}
    {state}
    {view}
    {focusGroup}
    placeholder="sheet range"
  />
  <span>where</span>
  <TextInput
    className={highlightingFor(state, [tags.atom])}
    node={match.args.expression}
    {state}
    {view}
    {focusGroup}
    placeholder="expression"
  />
</span>
