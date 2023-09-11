import type { Context } from "@puredit/parser";

export type ContextColumns = Record<string, "TEXT" | "INTEGER">;

export interface ContextTable {
  columns: ContextColumns;
}

export type ContextTables = Record<string, ContextTable>;

export interface ContextGlobal {
  tables: ContextTables;
}

export const globalContextVariables: Context = {
  db: "db",
};

export const globalContextValues: ContextGlobal = {
  tables: {
    students: {
      columns: {
        name: "TEXT",
        firstName: "TEXT",
        secondName: "TEXT",
        age: "INTEGER",
      },
    },
    lectures: {
      columns: {
        name: "TEXT",
        lecturer: "TEXT",
      },
    },
  },
};
