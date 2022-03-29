import { arg, contextVariable } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import { pythonParser } from "./parser";
import StoreSheetProjection from "./StoreSheetProjection.svelte";

const dsl = contextVariable("dsl");
const fileName = arg("fileName", "string");
const sheetName = arg("sheetName", "string");
const columns = arg("columns", "identifier list");

export const [pattern, draft] = pythonParser.statementPattern`
${dsl}.store_sheet(${fileName}, ${sheetName}, ${columns})
`;

export const widget = svelteProjection(StoreSheetProjection);

export const storeSheetProjection: Projection = {
  name: "store sheet",
  description: "Stores the given columns as an Excel file",
  pattern,
  draft,
  requiredContextVariables: ["dsl"],
  widgets: [widget],
};
