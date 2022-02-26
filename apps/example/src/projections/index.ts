import type { ProjectionPluginConfig } from "@puredit/projections";
import { changeProjection } from "./changeProjection";
import { globalContextValues, globalContextVariables } from "./context";
import { replaceProjection } from "./replaceProjection";
import { trimProjection } from "./trimProjection";

export const projectionPluginConfig: ProjectionPluginConfig = {
  projections: [changeProjection, replaceProjection, trimProjection],
  globalContextVariables,
  globalContextValues,
};
