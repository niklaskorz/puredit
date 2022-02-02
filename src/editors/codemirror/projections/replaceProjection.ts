import { arg, statementPattern } from "../../../parsers/lezer";
import ReplaceProjection from "./ReplaceProjection.svelte";
import { svelteProjection } from "./svelte";

export const [pattern, draft] = statementPattern`
table
  .column(${arg("column", "string")})
  .replace(
    ${arg("target", "string")},
    ${arg("replacement", "string")}
  );
`;

export const widget = svelteProjection(ReplaceProjection);
