import type { Text } from "@codemirror/text";
import {
  arg,
  block,
  statementPattern,
  contextVariable,
  Match,
} from "../../../parser";
import ChangeProjection from "./ChangeProjection.svelte";
import { span, staticWidget, stringLiteralValue } from "./shared";
import { svelteProjection } from "./svelte";
import type { ContextColumns, ContextTables, Projection } from "./types";

const db = contextVariable("db");
const table = arg("table", "string");

export const [pattern, draft] = statementPattern`
((table) => ${block({ table: "table" })})(${db}[${table}]);
`;

export const widget = svelteProjection(ChangeProjection);

export const end = staticWidget(() => span("end change"));

interface OuterContext {
  tables: ContextTables;
}

interface InnerContext {
  columns: ContextColumns;
}

export const changeProjection: Projection = {
  pattern,
  widgets: [widget, end],
  contextProvider(
    match: Match,
    text: Text,
    context: OuterContext
  ): InnerContext {
    const tableName = stringLiteralValue(match.args.table, text);
    return {
      columns: context.tables[tableName]?.columns || {},
    };
  },
};
