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
  <span>change table</span>
  <TextInput
    className={HighlightStyle.get(state, tags.name)}
    node={match.args.table}
    {state}
    {view}
    {focusGroup}
    placeholder="table"
    focus={isNew}
  />
</span>
