import type { ProjectionPluginConfig } from "@puredit/projections";
import { changeProjection } from "./changeProjection";
import { globalContextValues, globalContextVariables } from "./context";
import { pythonParser } from "./parser";
import { replaceProjection } from "./replaceProjection";
import { trimProjection } from "./trimProjection";
import { swapProjection } from "./swapProjection";

export const projectionPluginConfig: ProjectionPluginConfig = {
  parser: pythonParser,
  projections: [
    changeProjection,
    replaceProjection,
    trimProjection,
    swapProjection,
  ],
  globalContextVariables,
  globalContextValues,
};
