import { isString } from "../utils";

export function isEmptyString(value: StringValue): boolean {
  return value instanceof StringLiteral && value.value === "";
}

export function toStringValue(value: StringConvertible): StringValue {
  return isString(value) ? new StringLiteral(value) : value;
}

export type StringConvertible = StringValue | string;

export type TrimDirection = "both" | "left" | "right";

type Pair<A, B> = [A, B];

export class Value {}

export class StringValue extends Value {
  constructor() {
    super();
  }

  add(valueB: StringConvertible) {
    return new ConcatOperation(this, toStringValue(valueB));
  }

  trim(direction: TrimDirection = "both") {
    return new TrimOperation(this, direction);
  }

  slice(start: number, end: number) {
    return new SliceOperation(this, start, end);
  }

  replace(target: StringConvertible, replacement: StringConvertible) {
    return new ReplaceOperation(
      this,
      toStringValue(target),
      toStringValue(replacement)
    );
  }

  replaceAll(...replacements: Pair<StringConvertible, StringConvertible>[]) {
    return new ReplaceAllOperation(
      this,
      replacements.map((pair) => [
        toStringValue(pair[0]),
        toStringValue(pair[1]),
      ])
    );
  }

  remove(target: StringConvertible) {
    return new RemoveOperation(this, toStringValue(target));
  }

  toLower() {
    return new ToLowerOperation(this);
  }

  toUpper() {
    return new ToUpperOperation(this);
  }

  extractOne(pattern: StringConvertible) {
    return new ExtractOneOperation(this, toStringValue(pattern));
  }

  patternReplace(pattern: StringConvertible, replacement: StringConvertible) {
    return new PatternReplaceOperation(
      this,
      toStringValue(pattern),
      toStringValue(replacement)
    );
  }

  patternReplaceAll(
    ...replacements: Pair<StringConvertible, StringConvertible>[]
  ) {
    return new PatternReplaceAllOperation(
      this,
      replacements.map((pair) => [
        toStringValue(pair[0]),
        toStringValue(pair[1]),
      ])
    );
  }
}

export class StringLiteral extends StringValue {
  constructor(public value: string) {
    super();
  }
}

export class StringColumn extends StringValue {
  constructor(public tableName: string, public columnName: string) {
    super();
  }
}

export class ConcatOperation extends StringValue {
  constructor(public valueA: StringValue, public valueB: StringValue) {
    super();
  }
}

export class TrimOperation extends StringValue {
  constructor(public value: StringValue, public direction: TrimDirection) {
    super();
  }
}

export class SliceOperation extends StringValue {
  constructor(
    public value: StringValue,
    public start: number,
    public end: number
  ) {
    super();
  }
}

export class ReplaceOperation extends StringValue {
  constructor(
    public value: StringValue,
    public target: StringValue,
    public replacement: StringValue
  ) {
    super();
  }
}

export class ReplaceAllOperation extends StringValue {
  constructor(
    public value: StringValue,
    public replacements: Pair<StringValue, StringValue>[]
  ) {
    super();
  }
}

export class RemoveOperation extends StringValue {
  constructor(public value: StringValue, public target: StringValue) {
    super();
  }
}

export class ToLowerOperation extends StringValue {
  constructor(public value: StringValue) {
    super();
  }
}

export class ToUpperOperation extends StringValue {
  constructor(public value: StringValue) {
    super();
  }
}

export class ExtractOneOperation extends StringValue {
  constructor(public value: StringValue, public pattern: StringValue) {
    super();
  }
}

export class PatternReplaceOperation extends StringValue {
  constructor(
    public value: StringValue,
    public pattern: StringValue,
    public replacement: StringValue
  ) {
    super();
  }
}

export class PatternReplaceAllOperation extends StringValue {
  constructor(
    public value: StringValue,
    public replacements: Pair<StringValue, StringValue>[]
  ) {
    super();
  }
}

export function text(value: string): StringLiteral;
export function text(
  template: TemplateStringsArray,
  ...params: StringValue[]
): ConcatOperation;
export function text(
  template: TemplateStringsArray | string,
  ...params: StringValue[]
): StringValue {
  if (isString(template)) {
    return new StringLiteral(template);
  }
  return params.reduce(
    (previousValue: StringValue, currentValue: StringValue, i: number) => {
      let newValue = previousValue;
      if (isEmptyString(newValue)) {
        newValue = currentValue;
      } else {
        newValue = newValue.add(currentValue);
      }
      if (template[i + 1] !== "") {
        newValue = newValue.add(new StringLiteral(template[i + 1]));
      }
      return newValue;
    },
    new StringLiteral(template[0])
  );
}
