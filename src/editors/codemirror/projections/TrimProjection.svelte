<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import { HighlightStyle, tags } from "@codemirror/highlight";
  import type { Match } from "src/parsers/lezer";
  import type { FocusGroup } from "./focus";
  import { stringLiteralValue } from "./shared";
  import TextInput from "./TextInput.svelte";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let state: EditorState;
  export let focusGroup: FocusGroup;

  const trimDirections = ["both", "left", "right"];
  function validateTrimDirection(value: string) {
    if (!trimDirections.includes(value)) {
      return "invalid direction";
    }
  }
</script>

<span class="inline-flex">
  <span>trim column</span>
  <TextInput
    className={HighlightStyle.get(state, tags.name)}
    node={match.args.columnTarget}
    targetNodes={[match.args.columnTarget, match.args.columnSource]}
    {state}
    {view}
    {focusGroup}
    placeholder="column"
    focus={isNew}
  />
  <span>on</span>
  <TextInput
    className={HighlightStyle.get(state, tags.atom)}
    node={match.args.direction}
    {state}
    {focusGroup}
    placeholder="direction"
    completions={trimDirections}
    validate={validateTrimDirection}
    {view}
  />
  <span
    >{stringLiteralValue(match.args.direction, state.doc) === "both"
      ? "sides"
      : "side"}</span
  >
</span>
