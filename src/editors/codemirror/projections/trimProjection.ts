import { arg, statementPattern } from "../../../parsers/lezer";
import { svelteProjection } from "./svelte";
import TrimProjection from "./TrimProjection.svelte";

export const [pattern, draft] = statementPattern`
table
  .column(${arg("column", "string")})
  .trim(${arg("direction", "string")});
`;

export const widget = svelteProjection(TrimProjection);
