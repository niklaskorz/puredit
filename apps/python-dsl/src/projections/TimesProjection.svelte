<script lang="ts">
  import { onMount } from "svelte";
  import { tags } from "@lezer/highlight";
  import type { EditorState } from "@codemirror/state";
  import type { EditorView } from "@codemirror/view";
  import { highlightingFor } from "@codemirror/language";
  import type { Match } from "@puredit/parser";
  import type { FocusGroup } from "@puredit/projections/focus";
  import TextInput from "@puredit/projections/TextInput.svelte";
  //  import { validateFromList } from "@puredit/projections/shared";
  //  import type { ContextGlobal } from "./context";

  export let isNew: boolean;
  export let view: EditorView | null;
  export let match: Match;
  export let state: EditorState;
  export let focusGroup: FocusGroup;

  onMount(() => {
    if (isNew) {
      requestAnimationFrame(() => {
        focusGroup.first();
      });
    }
  });
</script>

<span class="inline-flex">
  <span class="noindent" />
  <TextInput
    className={highlightingFor(state, [tags.atom])}
    node={match.args.times_value}
    {state}
    {view}
    {focusGroup}
    placeholder="number times"
  />
  <span class="boundleft">.times with </span>
  <TextInput
    className={highlightingFor(state, [tags.atom])}
    node={match.args.times_var}
    {state}
    {view}
    {focusGroup}
    placeholder="index var"
  />
  <span class="boundleft">:</span>
</span>

<style>
  .boundleft {
    margin-left: -10px;
  }
  .noindent {
    margin-left: -10px;
  }
</style>
