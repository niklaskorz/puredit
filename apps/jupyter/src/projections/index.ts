import type { ProjectionPluginConfig } from "@puredit/projections";
import { loadSheetProjection } from "./loadSheetProjection";
import { globalContextValues, globalContextVariables } from "./context";
import { pythonParser } from "./parser";
import { replaceProjection } from "./replaceProjection";
import { trimProjection } from "./trimProjection";

export const projectionPluginConfig: ProjectionPluginConfig = {
  parser: pythonParser,
  projections: [loadSheetProjection, replaceProjection, trimProjection],
  globalContextVariables,
  globalContextValues,
};
