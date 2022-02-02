<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import type { Match } from "src/parsers/lezer";
  import TextInput from "./TextInput.svelte";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let state: EditorState;
</script>

<span class="inline-flex">
  <b>replace</b>
  <TextInput
    node={match.args.target}
    {state}
    {view}
    placeholder="target"
    autofocus={isNew}
  />
  <b>in column</b>
  <TextInput node={match.args.column} {state} placeholder="column" {view} />
  <b>with</b>
  <TextInput
    node={match.args.replacement}
    {state}
    placeholder="replacement"
    {view}
  />
</span>
