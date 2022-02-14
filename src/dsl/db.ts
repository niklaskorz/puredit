import {
  IntegerColumn,
  IntegerConvertible,
  IntegerValue,
  TextColumn,
  TextConvertible,
  TextValue,
  toTextValue,
} from "./api";

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

let tableHandler: ProxyHandler<InternalTable> = {
  get(table, property) {
    const columnName = property.toString();
    if (!table.columns.hasOwnProperty(columnName)) {
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
    if (!table.columns.hasOwnProperty(columnName)) {
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

let dbHandler: ProxyHandler<InternalDatabase> = {
  get(db, property) {
    const tableName = property.toString();
    if (!db.tables.hasOwnProperty(tableName)) {
      throw new TypeError(
        `No table "${tableName.toString()}" found in database`
      );
    }
    return new Proxy({ db, tableName, ...db.tables[tableName] }, tableHandler);
  },
  set(target, property, value) {
    return false;
  },
};

//export type Table = Record<string, StringValue>;
//export type Database = Readonly<Record<string, Table>>;

export interface StudentsTable {
  get name(): TextValue;
  set name(value: TextConvertible);
  get firstName(): TextValue;
  set firstName(value: TextConvertible);
  get secondName(): TextValue;
  set secondName(value: TextConvertible);
  get age(): IntegerValue;
  set age(value: IntegerConvertible);
}

export interface LecturesTable {
  get name(): TextValue;
  set name(value: TextConvertible);
  get lecturer(): TextValue;
  set lecturer(value: TextConvertible);
}

export interface Database {
  readonly students: StudentsTable;
  readonly lectures: LecturesTable;
}

export let db = new Proxy(
  {
    tables: {
      students: {
        columns: {
          name: "TEXT",
          firstName: "TEXT",
          secondName: "TEXT",
          age: "INTEGER",
        },
      },
      lecturers: {
        columns: {
          name: "TEXT",
          lecturer: "TEXT",
        },
      },
    },
  },
  dbHandler
) as unknown as Database;
