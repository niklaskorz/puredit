import { arg, contextVariable, statementPattern } from "../../../parsers/lezer";
import ReplaceProjection from "./ReplaceProjection.svelte";
import { svelteProjection } from "./svelte";

const table = contextVariable("table");
const column = arg("column", "string");
const target = arg("target", "string");
const replacement = arg("replacement", "string");

export const [pattern, draft] = statementPattern`
${table}.column(${column}).replace(${target}, ${replacement});
`;

export const widget = svelteProjection(ReplaceProjection);
