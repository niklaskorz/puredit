import { IntegerColumn, TextColumn, toTextValue } from "./api";

interface InternalTableBase {
  columns: Record<string, "TEXT" | "INTEGER">;
}

interface InternalDatabase {
  tables: Record<string, InternalTableBase>;
}

interface InternalTable extends InternalTableBase {
  db: InternalDatabase;
  tableName: string;
}

const tableHandler: ProxyHandler<InternalTable> = {
  get(table, property) {
    const columnName = property.toString();
    if (!Object.prototype.hasOwnProperty.call(table.columns, columnName)) {
      throw new TypeError(
        `No column "${columnName}" found on table "${table.tableName}"`
      );
    }
    const columnType = table.columns[columnName];
    if (columnType === "TEXT") {
      return new TextColumn(table.tableName, columnName);
    }
    if (columnType === "INTEGER") {
      return new IntegerColumn(table.tableName, columnName);
    }
    throw new Error(`Column type not implemented: ${columnType}`);
  },
  set(table, property, value) {
    const columnName = property.toString();
    if (!Object.prototype.hasOwnProperty.call(table.columns, columnName)) {
      throw new TypeError(
        `No column "${columnName}" found on table "${table.tableName}"`
      );
    }
    console.log(
      `Setting column "${columnName}" of table "${table.tableName}" to`
    );
    console.dir(toTextValue(value), { depth: null });
    return true;
  },
};

const dbHandler: ProxyHandler<InternalDatabase> = {
  get(db, property) {
    const tableName = property.toString();
    if (!Object.prototype.hasOwnProperty.call(db.tables, tableName)) {
      throw new TypeError(
        `No table "${tableName.toString()}" found in database`
      );
    }
    return new Proxy({ db, tableName, ...db.tables[tableName] }, tableHandler);
  },
  set() {
    return false;
  },
};

export function createDatabase<T>(internal: InternalDatabase): T {
  return new Proxy(internal, dbHandler) as unknown as T;
}
