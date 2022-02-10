type TableColumns = Record<string, string>;

interface TableSchema {
  columns: Record<string, string>;
}

class Database {
  constructor(private tables: Record<string, TableSchema>) {}

  change(tableName: string, cb: (table: Table) => void) {
    if (!this.tables.hasOwnProperty(tableName)) {
      throw new TypeError(`No table "${tableName}" found in database`);
    }
    cb(new Table(this, tableName, this.tables[tableName].columns));
  }
}

class Table implements TableSchema {
  constructor(
    private db: Database,
    readonly name: string,
    readonly columns: TableColumns
  ) {}

  column(columnName: string): Column {
    if (!this.columns.hasOwnProperty(columnName)) {
      throw new TypeError(
        `No column "${columnName}" found on table "${this.name}"`
      );
    }
    const columnType = this.columns[columnName];
    return new Column(this, columnName, columnType);
  }
}

class Column {
  constructor(
    private table: Table,
    readonly name: string,
    readonly type: string
  ) {}

  replace(target: string, replacement: string) {}

  trim(direction: "left" | "right" | "both") {}
}

export let db = new Database({
  rooms: {
    columns: {
      name: "TEXT",
      building: "TEXT",
    },
  },
  students: {
    columns: {
      name: "TEXT",
      firstName: "TEXT",
      lastName: "TEXT",
    },
  },
});
