import { arg, contextVariable } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import { pythonParser } from "./parser";
import DisplayProjection from "./DisplayProjection.svelte";

const dsl = contextVariable("dsl");
const columns = arg("columns", "dictionary");

export const [pattern, draft] = pythonParser.statementPattern`
${dsl}.display(${columns})
`;

export const widget = svelteProjection(DisplayProjection);

export const displayProjection: Projection = {
  name: "display columns",
  description: "Displays the given columns in Jupyter",
  pattern,
  draft,
  requiredContextVariables: ["dsl"],
  widgets: [widget],
};
