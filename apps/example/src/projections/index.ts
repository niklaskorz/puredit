import type { ProjectionPluginConfig } from "@puredit/projections";
import { changeProjection } from "./changeProjection";
import { globalContextValues, globalContextVariables } from "./context";
import { fetchProjection } from "./fetchProjection";
import { logProjection } from "./logProjection";
import { tsParser } from "./parser";
import { replaceProjection } from "./replaceProjection";
import { trimProjection } from "./trimProjection";

export const projectionPluginConfig: ProjectionPluginConfig = {
  parser: tsParser,
  projections: [
    changeProjection,
    replaceProjection,
    trimProjection,
    logProjection,
    fetchProjection,
  ],
  globalContextVariables,
  globalContextValues,
};
