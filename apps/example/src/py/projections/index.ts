import type { ProjectionPluginConfig } from "@puredit/projections";
import { pythonParser } from "./parser";
import { evaluateMathProjection } from "./evaluateMathProjection";
import { compileMathProjection } from "./compileMathProjection";
import { globalContextValues, globalContextVariables } from "./context";
import { swapProjection } from "./swapProjection";

export const projectionPluginConfig: ProjectionPluginConfig = {
  parser: pythonParser,
  projections: [evaluateMathProjection, compileMathProjection, swapProjection],
  globalContextVariables,
  globalContextValues,
};
