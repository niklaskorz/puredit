import type { Text } from "@codemirror/state";
import { arg, block, contextVariable } from "@puredit/parser";
import type { Match } from "@puredit/parser";
import { stringLiteralValue } from "@puredit/projections/shared";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import IncrementProjection from "./IncrementProjection.svelte";
import type { ContextColumns, ContextTables } from "./context";
import { pythonParser } from "./parser";

// const db = contextVariable("db");
const var_x = arg("var_x", "identifier");

export const [pattern, draft] = pythonParser.statementPattern`
${var_x} += 1
`;

export const widget = svelteProjection(IncrementProjection);

export const incrementProjection: Projection = {
  name: "increment variable",
  description: "Increments a variable",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
