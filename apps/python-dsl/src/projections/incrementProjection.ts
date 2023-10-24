import { arg, block, contextVariable } from "@puredit/parser";
import type { Projection } from "@puredit/projections/types";
import { pythonParser } from "./parser";
import { simpleProjection } from "@puredit/simple-projection";

const var_x = arg("var_x", "identifier");
export const [pattern, draft] = pythonParser.statementPattern`
${var_x} += 1
`;

// todo: fix unnecessary indent
export const widget = simpleProjection([var_x, "++"]);

// alternative: explicit and long projection definion
// import { svelteProjection } from "@puredit/projections/svelte";
// import IncrementProjection from "./IncrementProjection.svelte";
// export const widget = svelteProjection(IncrementProjection);

export const incrementProjection: Projection = {
  name: "increment variable",
  description: "Increments a variable",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
