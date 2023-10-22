import type { Text } from "@codemirror/state";
import { arg, block, contextVariable } from "@puredit/parser";
import type { Match } from "@puredit/parser";
import { stringLiteralValue } from "@puredit/projections/shared";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import TimesProjection from "./TimesProjection.svelte";
// import type { ContextColumns, ContextTables } from "./context";
import { pythonParser } from "./parser";

const times_value = arg("times_value", "integer");

export const [pattern, draft] = pythonParser.statementPattern`
for index in range(${times_value}):
    ${block({})}
`;

export const widget = svelteProjection(TimesProjection);

export const timesProjection: Projection = {
  name: "times",
  description: "Loop a block X times",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
