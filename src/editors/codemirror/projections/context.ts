import type { Context } from "../../../parser";

export const globalContextVariables: Context = {
  db: "db",
};

export const globalContextValues: Record<string, any> = {
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
