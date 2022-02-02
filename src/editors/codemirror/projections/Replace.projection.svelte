<script lang="ts" context="module">
  import { arg, Match, statementPattern } from "../../../parsers/lezer";

  export const [pattern, draft] = statementPattern`
table
  .column(${arg("column", "string")})
  .replace(
    ${arg("target", "string")},
    ${arg("replacement", "string")}
  );
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
