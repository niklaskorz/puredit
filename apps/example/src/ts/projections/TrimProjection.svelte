<script lang="ts">
  import { onMount } from "svelte";
  import { tags } from "@lezer/highlight";
  import type { EditorState } from "@codemirror/state";
  import type { EditorView } from "@codemirror/view";
  import { highlightingFor } from "@codemirror/language";
  import type { Match } from "@puredit/parser";
  import type { FocusGroup } from "@puredit/projections/focus";
  import {
    stringLiteralValue,
    validateFromList,
  } from "@puredit/projections/shared";
  import TextInput from "@puredit/projections/TextInput.svelte";
  import type { ContextTable } from "./context";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let context: ContextTable;
  export let state: EditorState;
  export let focusGroup: FocusGroup;

  let textColumns: string[];
  $: textColumns = Object.keys(context.columns).filter(
    (key) => context.columns[key] === "TEXT"
  );

  const trimDirections = ["both", "left", "right"];

  onMount(() => {
    if (isNew) {
      requestAnimationFrame(() => {
        focusGroup.first();
      });
    }
  });
</script>

<span class="inline-flex">
  <span>trim column</span>
  <TextInput
    className={highlightingFor(state, [tags.atom])}
    node={match.args.columnTarget}
    targetNodes={[match.args.columnTarget, match.args.columnSource]}
    {state}
    {view}
    {focusGroup}
    placeholder="column"
    completions={textColumns}
    validate={validateFromList(textColumns)}
  />
  <span>on</span>
  <TextInput
    className={highlightingFor(state, [tags.atom])}
    node={match.args.direction}
    {state}
    {focusGroup}
    placeholder="direction"
    completions={trimDirections}
    validate={validateFromList(trimDirections)}
    {view}
  />
  <span
    >{stringLiteralValue(match.args.direction, state.doc) === "both"
      ? "sides"
      : "side"}</span
  >
</span>
