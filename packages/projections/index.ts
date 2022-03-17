import { flexPlugin } from "./flex";
import { createProjectionState, projectionState } from "./state";
import { transactionFilter } from "./filter";
import { completions } from "./completions";
import type { ProjectionPluginConfig } from "./types";
import { style } from "./style";

export type { ProjectionPluginConfig };

export const projectionPlugin = (config: ProjectionPluginConfig) => [
  style,
  projectionState.init((state) => createProjectionState(state, config)),
  transactionFilter,
  flexPlugin,
];

export { completions };
