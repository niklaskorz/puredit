import { flexPlugin } from "./flex";
import { projectionState } from "./state";
import { transactionFilter } from "./filter";
import { completions } from "./completions";

export const projectionPlugin = [
  projectionState.extension,
  transactionFilter,
  flexPlugin,
];

export { completions };
