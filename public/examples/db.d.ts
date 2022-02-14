import type {
  IntegerConvertible,
  IntegerValue,
  TextConvertible,
  TextValue,
} from "dsl";

declare global {
  interface StudentsTable {
    get name(): TextValue;
    set name(value: TextConvertible);
    get firstName(): TextValue;
    set firstName(value: TextConvertible);
    get secondName(): TextValue;
    set secondName(value: TextConvertible);
    get age(): IntegerValue;
    set age(value: IntegerConvertible);
  }

  interface LecturesTable {
    get name(): TextValue;
    set name(value: TextConvertible);
    get lecturer(): TextValue;
    set lecturer(value: TextConvertible);
  }

  interface Database {
    readonly students: StudentsTable;
    readonly lectures: LecturesTable;
  }

  const db: Database;
}
