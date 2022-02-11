<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import { HighlightStyle, tags } from "@codemirror/highlight";
  import type { Match } from "src/parsers/lezer";
  import type { FocusGroup } from "./focus";
  import TextInput from "./TextInput.svelte";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let state: EditorState;
  export let focusGroup: FocusGroup;
</script>

<span class="inline-flex">
  <span>replace</span>
  <TextInput
    className={HighlightStyle.get(state, tags.string)}
    node={match.args.target}
    {state}
    {view}
    {focusGroup}
    placeholder="target"
    focus={isNew}
  />
  <span>in column</span>
  <TextInput
    className={HighlightStyle.get(state, tags.name)}
    node={match.args.columnTarget}
    targetNodes={[match.args.columnTarget, match.args.columnSource]}
    {state}
    {view}
    {focusGroup}
    placeholder="column"
  />
  <span>with</span>
  <TextInput
    className={HighlightStyle.get(state, tags.string)}
    node={match.args.replacement}
    {state}
    {view}
    {focusGroup}
    placeholder="replacement"
  />
</span>
