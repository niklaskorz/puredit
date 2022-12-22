import { arg } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import { tsParser } from "./parser";
import FetchProjection from "./FetchProjection.svelte";

export const [pattern, draft] = tsParser.statementPattern`
const ${arg("var0", "identifier")} = await fetcher<${arg("var1", "*")}>({
    url: ${"`"}/api/tables/${"${"}${arg("var2", "*")}}${"`"},
    method: "GET",
    headers: context.req.headers as HeadersInit,
});
`;

export const widget = svelteProjection(FetchProjection);

export const fetchProjection: Projection = {
  name: "fetch",
  description: "fetch",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
