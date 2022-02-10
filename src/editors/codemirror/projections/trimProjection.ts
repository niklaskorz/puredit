import { arg, contextVariable, statementPattern } from "../../../parsers/lezer";
import { svelteProjection } from "./svelte";
import TrimProjection from "./TrimProjection.svelte";

const table = contextVariable("table");
const column = arg("column", "string");
const direction = arg("direction", "string");

export const [pattern, draft] = statementPattern`
${table}.column(${column}).trim(${direction});
`;

export const widget = svelteProjection(TrimProjection);
