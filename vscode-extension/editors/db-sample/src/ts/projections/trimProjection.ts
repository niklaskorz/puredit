import { arg, contextVariable } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import { tsParser } from "./parser";
import TrimProjection from "./TrimProjection.svelte";

const table = contextVariable("table");
const columnTarget = arg("columnTarget", "string");
const columnSource = arg("columnSource", "string");
const direction = arg("direction", "string");

export const [pattern, draft] = tsParser.statementPattern`
${table}[${columnTarget}] = ${table}[${columnSource}].trim(${direction});
`;

export const widget = svelteProjection(TrimProjection);

export const trimProjection: Projection = {
  name: "trim column",
  description: "Remove whitespace on the given sides of a column",
  pattern,
  draft,
  requiredContextVariables: ["table"],
  widgets: [widget],
};
