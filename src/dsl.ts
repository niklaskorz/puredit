export {};

function isString(value: unknown): value is string {
  return value instanceof String || typeof value === "string";
}

class Value {}

class StringValue extends Value {
  constructor() {
    super();
  }

  add(valueB: StringValue | string): StringValue {
    if (isString(valueB)) {
      return new StringConcatOperation(this, new StringLiteral(valueB));
    }
    return new StringConcatOperation(this, valueB);
  }
}

class StringLiteral extends StringValue {
  constructor(public value: string) {
    super();
  }
}

class StringConcatOperation extends StringValue {
  constructor(public valueA: StringValue, public valueB: StringValue) {
    super();
  }
}

class StringColumn extends StringValue {
  constructor(public tableName: string, public columnName: string) {
    super();
  }
}

function lit(template: TemplateStringsArray, ...params: StringValue[]) {
  return params.reduce(
    (previousValue: StringValue, currentValue: StringValue, i: number) =>
      previousValue.add(currentValue).add(new StringLiteral(template[i + 1])),
    new StringLiteral(template[0])
  );
}

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
    console.dir(value, { depth: null });
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

type Table = Record<string, StringValue>;
type Database = Record<string, Table>;

let db = new Proxy(
  {
    tables: {
      students: {
        columns: { name: String, firstName: String, secondName: String },
      },
    },
  },
  dbHandler
) as unknown as Database;

db.students.name = lit`${db.students.firstName} ${db.students.secondName}`;
