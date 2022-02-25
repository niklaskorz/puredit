<script lang="ts">
  import { onMount } from "svelte";
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import { HighlightStyle, tags } from "@codemirror/highlight";
  import type { Match } from "src/parser";
  import type { FocusGroup } from "./focus";
  import { stringLiteralValue, validateFromList } from "./shared";
  import TextInput from "./TextInput.svelte";
  import type { ContextTable } from "./types";

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
    className={HighlightStyle.get(state, tags.atom)}
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
    className={HighlightStyle.get(state, tags.atom)}
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
