<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import { HighlightStyle, tags } from "@codemirror/highlight";
  import type { Match } from "src/parsers/lezer";
  import Keyword from "./Keyword.svelte";
  import TextInput from "./TextInput.svelte";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let state: EditorState;
</script>

<span class="inline-flex">
  <Keyword>trim column</Keyword>
  <TextInput
    className={HighlightStyle.get(state, tags.name)}
    node={match.args.column}
    {state}
    {view}
    placeholder="column"
    autofocus={isNew}
  />
  <Keyword>on</Keyword>
  <TextInput
    className={HighlightStyle.get(state, tags.literal)}
    node={match.args.direction}
    {state}
    placeholder="direction"
    {view}
  />
</span>
