<script lang="ts">
  import { onMount } from "svelte";
  import type { EditorState } from "@codemirror/state";
  import type { EditorView } from "@codemirror/view";
  import { HighlightStyle, tags } from "@codemirror/highlight";
  import type { Match } from "@puredit/parser";
  import type { FocusGroup } from "@puredit/projections/focus";
  import TextInput from "@puredit/projections/TextInput.svelte";
  import { validateFromList } from "@puredit/projections/shared";
  import type { ContextTable } from "./context";
  import { listCodeToValue, listValueToCode } from "./helpers";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let context: ContextTable;
  export let state: EditorState;
  export let focusGroup: FocusGroup;

  const aggregationMethods = ["minimal", "maximal"];

  onMount(() => {
    if (isNew) {
      requestAnimationFrame(() => {
        focusGroup.first();
      });
    }
  });
</script>

<span class="inline-flex">
  <span>join</span>
  <TextInput
    className={HighlightStyle.get(state, tags.atom)}
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
    className={HighlightStyle.get(state, tags.atom)}
    node={match.args.sheetRange}
    {state}
    {view}
    {focusGroup}
    placeholder="sheet range"
  />
  <span>on</span>
  <TextInput
    className={HighlightStyle.get(state, tags.atom)}
    node={match.args.targetColumn}
    {state}
    {view}
    {focusGroup}
    placeholder="column"
  />
  <span>where</span>
  <TextInput
    className={HighlightStyle.get(state, tags.atom)}
    node={match.args.expression}
    {state}
    {view}
    {focusGroup}
    placeholder="expression"
  />
  <span>is</span>
  <TextInput
    className={HighlightStyle.get(state, tags.atom)}
    node={match.args.aggregationMethod}
    {state}
    {view}
    {focusGroup}
    placeholder="aggregation method"
    completions={aggregationMethods}
    validate={validateFromList(aggregationMethods)}
  />
</span>
