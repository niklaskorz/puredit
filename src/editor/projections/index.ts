import { flexPlugin } from "./flex";
import { autocompletion } from "@codemirror/autocomplete";
import { completionSource as typescriptCompletionSource } from "../extensions/typescript";
import { projectionState } from "./state";
import { transactionFilter } from "./filter";
import { completions } from "./completions";

export const projectionPlugin = [
  projectionState.extension,
  transactionFilter,
  flexPlugin,
  autocompletion({
    activateOnTyping: true,
    override: [completions, typescriptCompletionSource],
  }),
];
