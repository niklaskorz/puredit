import { arg, block } from "@puredit/parser";
import type { Projection } from "@puredit/projections/types";
import { pythonParser } from "./parser";
import { simpleProjection } from "@puredit/simple-projection";

const times_var = arg("times_var", "identifier");
const times_value = arg("times_value", "identifier");

export const [pattern, draft] = pythonParser.statementPattern`
for ${times_var} in range(${times_value}):
    ${block({})}
`;

// todo: fix unnecessary indent
export const widget = simpleProjection([
  times_value,
  ".times with ",
  times_var,
  ":",
]);

// alternative: explicit and long projection definion
// import { svelteProjection } from "@puredit/projections/svelte";
// import IncrementProjection from "./IncrementProjection.svelte";
// export const widget = svelteProjection(TimesProjection);

export const timesProjection: Projection = {
  name: "times",
  description: "Loop a block X times",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
