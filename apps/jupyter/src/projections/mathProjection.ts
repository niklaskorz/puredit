import { arg, contextVariable } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import MathProjection from "./MathProjection.svelte";
import { pythonParser } from "./parser";

const dsl = contextVariable("mathdsl");
const latex = arg("latex", "string");

export const [pattern, draft] = pythonParser.expressionPattern`
${dsl}.evaluate(${latex})
`;

export const widget = svelteProjection(MathProjection);

export const mathProjection: Projection = {
  name: "evaluate math",
  description: "math",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
