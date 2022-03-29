import { arg, block, contextVariable } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import LoadSheetProjection from "./LoadSheetProjection.svelte";
import { pythonParser } from "./parser";

const dsl = contextVariable("dsl");
const fileName = arg("fileName", "string");
const sheetName = arg("sheetName", "string");

export const [pattern, draft] = pythonParser.statementPattern`
with ${dsl}.load_sheet(${fileName}, ${sheetName}) as sheet:
    ${block({ sheet: "sheet" })}
`;

export const widget = svelteProjection(LoadSheetProjection);

export const loadSheetProjection: Projection = {
  name: "load sheet",
  description: "Loads a sheet from an Excel file",
  pattern,
  draft,
  requiredContextVariables: ["dsl"],
  widgets: [widget],
};
