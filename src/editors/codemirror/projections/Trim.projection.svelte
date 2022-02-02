<script lang="ts" context="module">
  import { arg, Match, statementPattern } from "../../../parsers/lezer";

  export const [pattern, draft] = statementPattern`
table
  .column(${arg("column", "string")})
  .trim(${arg("direction", "string")});
`;
</script>

<script lang="ts">
  import type { EditorState, EditorView } from "@codemirror/basic-setup";
  import TextInput from "./TextInput.svelte";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let state: EditorState;
</script>

<span class="inline-flex">
  <b>trim column</b>
  <TextInput
    node={match.args.column}
    {state}
    {view}
    placeholder="column"
    autofocus={isNew}
  />
  <b>on</b>
  <TextInput
    node={match.args.direction}
    {state}
    placeholder="direction"
    {view}
  />
</span>
