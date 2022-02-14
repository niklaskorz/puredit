import type { Text } from "@codemirror/text";
import type { Match, PatternNode } from "src/parsers/lezer";
import type { ProjectionWidgetClass } from "./projection";

export type ContextColumns = Record<string, "TEXT" | "INTEGER">;

export interface ContextTable {
  columns: ContextColumns;
}

export type ContextTables = Record<string, ContextTable>;

export interface ContextGlobal {
  tables: ContextTables;
}

export interface Projection {
  pattern: PatternNode;
  widgets: Array<ProjectionWidgetClass>;
  contextProvider?(match: Match, text: Text, context: object): object;
}
