<script lang="ts" context="module">
  import { arg, block, Match, statementPattern } from "../../../parsers/lezer";
  import { bold, staticWidget } from "./shared";

  export const [pattern, draft] = statementPattern`
db.change(${arg("table", "string")}, (table) => ${block()});
`;

  export const end = staticWidget(() => bold("end change"));
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
  <b>change table</b>
  <TextInput
    node={match.args.table}
    {state}
    {view}
    placeholder="table"
    autofocus={isNew}
  />
</span>
