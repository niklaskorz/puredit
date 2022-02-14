import { arg, contextVariable, statementPattern } from "../../../parsers/lezer";
import { svelteProjection } from "./svelte";
import TrimProjection from "./TrimProjection.svelte";
import type { Projection } from "./types";

const table = contextVariable("table");
const columnTarget = arg("columnTarget", "string");
const columnSource = arg("columnSource", "string");
const direction = arg("direction", "string");

export const [pattern, draft] = statementPattern`
${table}[${columnTarget}] = ${table}[${columnSource}].trim(${direction});
`;

export const widget = svelteProjection(TrimProjection);

export const trimProjection: Projection = {
  pattern,
  widgets: [widget],
};
