import type { Text } from "@codemirror/state";
import type { Context, Match, Parser, PatternNode } from "@puredit/parser";
import type { ProjectionWidgetClass } from "./projection";

export interface ProjectionCompletion {
  label: string;
  info: string;
  draft(context: Context): string;
}

export interface Projection {
  name: string;
  description: string;
  pattern: PatternNode;
  draft(context: Context): string;
  requiredContextVariables: string[];
  widgets: Array<ProjectionWidgetClass>;
  contextProvider?(match: Match, text: Text, context: object): object;
}

export interface ProjectionPluginConfig {
  parser: Parser;
  projections: Projection[];
  globalContextVariables: Context;
  globalContextValues: object;
}
