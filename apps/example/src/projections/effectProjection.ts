import { arg, block } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import { tsParser } from "./parser";
import EffectProjection from "./EffectProjection.svelte";

export const [pattern, draft] = tsParser.statementPattern`
React.useEffect(() => ${block()}, ${arg("var1", "array")});
`;

export const widget = svelteProjection(EffectProjection);

export const effectProjection: Projection = {
  name: "effect",
  description: "effect",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
