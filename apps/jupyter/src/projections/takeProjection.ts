import { arg, contextVariable } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import { pythonParser } from "./parser";
import TakeProjection from "./TakeProjection.svelte";

const sheet = contextVariable("sheet");
const sheetRange = arg("sheetRange", "string");
const columns = arg("columns", "identifier list");
const expression = arg("expression", "string");

export const [pattern, draft] = pythonParser.statementPattern`
${columns} = ${sheet}.take(${sheetRange}, ${expression})
`;

export const widget = svelteProjection(TakeProjection);

export const takeProjection: Projection = {
  name: "take columns from sheet range",
  description:
    "Extracts all columns from a sheet range that match the criteria",
  pattern,
  draft,
  requiredContextVariables: ["sheet"],
  widgets: [widget],
};
