import { arg, contextVariable } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import MathProjection from "./MathProjection.svelte";
import { pythonParser } from "./parser";

const dsl = contextVariable("mathdsl");
const latex = arg("latex", "string");

export const [pattern, draft] = pythonParser.expressionPattern`
${dsl}.compile(${latex})
`;

export const widget = svelteProjection(MathProjection);

export const compileMathProjection: Projection = {
  name: "compile math",
  description:
    "Transforms an expression in mathematical notation into a reusable functions, using free symbols as named parameters.",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
