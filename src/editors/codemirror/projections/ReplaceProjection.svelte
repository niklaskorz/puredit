<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import { HighlightStyle, tags } from "@codemirror/highlight";
  import type { Match } from "src/parsers/lezer";
  import TextInput from "./TextInput.svelte";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let state: EditorState;
</script>

<span class="inline-flex">
  <span>replace</span>
  <TextInput
    className={HighlightStyle.get(state, tags.string)}
    node={match.args.target}
    {state}
    {view}
    placeholder="target"
    autofocus={isNew}
  />
  <span>in column</span>
  <TextInput
    className={HighlightStyle.get(state, tags.name)}
    node={match.args.columnTarget}
    targetNodes={[match.args.columnTarget, match.args.columnSource]}
    {state}
    placeholder="column"
    {view}
  />
  <span>with</span>
  <TextInput
    className={HighlightStyle.get(state, tags.string)}
    node={match.args.replacement}
    {state}
    placeholder="replacement"
    {view}
  />
</span>
