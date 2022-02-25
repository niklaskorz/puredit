import { arg, contextVariable, statementPattern } from "../../parser";
import ReplaceProjection from "./ReplaceProjection.svelte";
import { svelteProjection } from "./svelte";
import type { Projection } from "./types";

const table = contextVariable("table");
const columnTarget = arg("columnTarget", "string");
const columnSource = arg("columnSource", "string");
const target = arg("target", "string");
const replacement = arg("replacement", "string");

export const [pattern, draft] = statementPattern`
${table}[${columnTarget}] = ${table}[${columnSource}].replace(${target}, ${replacement});
`;

export const widget = svelteProjection(ReplaceProjection);

export const replaceProjection: Projection = {
  pattern,
  widgets: [widget],
};
