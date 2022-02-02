<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import type { Match } from "src/parsers/lezer";
  import Keyword from "./Keyword.svelte";
  import TextInput from "./TextInput.svelte";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let state: EditorState;
</script>

<span class="inline-flex">
  <Keyword>change table</Keyword>
  <TextInput
    className="ͼf"
    node={match.args.table}
    {state}
    {view}
    placeholder="table"
    autofocus={isNew}
  />
</span>
