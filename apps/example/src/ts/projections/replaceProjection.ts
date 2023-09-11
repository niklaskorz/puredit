import { arg, contextVariable } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import { tsParser } from "./parser";
import ReplaceProjection from "./ReplaceProjection.svelte";

const table = contextVariable("table");
const columnTarget = arg("columnTarget", "string");
const columnSource = arg("columnSource", "string");
const target = arg("target", "string");
const replacement = arg("replacement", "string");

export const [pattern, draft] = tsParser.statementPattern`
${table}[${columnTarget}] = ${table}[${columnSource}].replace(${target}, ${replacement});
`;

export const widget = svelteProjection(ReplaceProjection);

export const replaceProjection: Projection = {
  name: "replace text in column",
  description: "Replaces all occurences of a text in a column",
  pattern,
  draft,
  requiredContextVariables: ["table"],
  widgets: [widget],
};
