import type {
  IntegerConvertible,
  IntegerValue,
  TextConvertible,
  TextValue,
} from "./api";
import { createDatabase } from "./proxy";

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

export const db = createDatabase<Database>({
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
});
