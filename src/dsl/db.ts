import {
  StringColumn,
  StringConvertible,
  StringValue,
  toStringValue,
} from "./api";

interface InternalTableBase {
  columns: Record<string, object>;
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
    if (columnType === String) {
      return new StringColumn(table.tableName, columnName);
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
    console.dir(toStringValue(value), { depth: null });
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
  get name(): StringValue;
  set name(value: StringConvertible);
  get firstName(): StringValue;
  set firstName(value: StringConvertible);
  get secondName(): StringValue;
  set secondName(value: StringConvertible);
}

export interface LecturesTable {
  get name(): StringValue;
  set name(value: StringConvertible);
  get lecturer(): StringValue;
  set lecturer(value: StringConvertible);
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
          name: String,
          firstName: String,
          secondName: String,
        },
      },
      lecturers: {
        columns: {
          name: String,
          lecturer: String,
        },
      },
    },
  },
  dbHandler
) as unknown as Database;
