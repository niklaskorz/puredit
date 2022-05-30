import type { ProjectionPluginConfig } from "@puredit/projections";
import { loadSheetProjection } from "./loadSheetProjection";
import { globalContextValues, globalContextVariables } from "./context";
import { pythonParser } from "./parser";
import { takeProjection } from "./takeProjection";
import { joinProjection } from "./joinProjection";
import { storeSheetProjection } from "./storeSheetProjection";
import { displayProjection } from "./displayProjection";
import { evaluateMathProjection } from "./evaluateMathProjection";
import { compileMathProjection } from "./compileMathProjection";

export const projectionPluginConfig: ProjectionPluginConfig = {
  parser: pythonParser,
  projections: [
    loadSheetProjection,
    takeProjection,
    joinProjection,
    storeSheetProjection,
    displayProjection,
    evaluateMathProjection,
    compileMathProjection,
  ],
  globalContextVariables,
  globalContextValues,
};
