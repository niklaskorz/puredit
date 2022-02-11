<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import { HighlightStyle, tags } from "@codemirror/highlight";
  import { Direction } from "@codemirror/view";
  import type { Match } from "src/parsers/lezer";
  import { stringLiteralValue } from "./shared";
  import TextInput from "./TextInput.svelte";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let state: EditorState;
</script>

<span class="inline-flex">
  <span>trim column</span>
  <TextInput
    className={HighlightStyle.get(state, tags.name)}
    node={match.args.columnTarget}
    targetNodes={[match.args.columnTarget, match.args.columnSource]}
    {state}
    {view}
    placeholder="column"
    autofocus={isNew}
  />
  <span>on</span>
  <TextInput
    className={HighlightStyle.get(state, tags.atom)}
    node={match.args.direction}
    {state}
    placeholder="direction"
    {view}
  />
  <span
    >{stringLiteralValue(match.args.direction, state.doc) === "both"
      ? "sides"
      : "side"}</span
  >
</span>
