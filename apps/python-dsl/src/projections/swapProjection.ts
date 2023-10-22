import type { Text } from "@codemirror/state";
import { arg, block, contextVariable } from "@puredit/parser";
import type { Match } from "@puredit/parser";
import { stringLiteralValue } from "@puredit/projections/shared";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import SwapProjection from "./SwapProjection.svelte";
import type { ContextColumns, ContextTables } from "./context";
import { pythonParser } from "./parser";

// const db = contextVariable("db");
const var_x = arg("var_x", "identifier");
const var_y = arg("var_y", "identifier");

export const [pattern, draft] = pythonParser.statementPattern`
${var_x}, ${var_y} = ${var_y},${var_x}
`;

export const widget = svelteProjection(SwapProjection);

export const swapProjection: Projection = {
  name: "swap variables",
  description: "Swaps two variables",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
