import { isString } from "@puredit/utils";

export function isEmptyText(value: TextValue): boolean {
  return value instanceof TextLiteral && value.value === "";
}

export function toTextValue(value: TextConvertible): TextValue {
  return value instanceof TextValue ? value : new TextLiteral(value);
}

export type TextConvertible = TextValue | string;

export type TrimDirection = "both" | "left" | "right";

type Pair<A, B> = [A, B];

export class Value {}

export class TextValue extends Value {
  constructor() {
    super();
  }

  add(valueB: TextConvertible) {
    return new ConcatOperation(this, toTextValue(valueB));
  }

  trim(direction: TrimDirection = "both") {
    return new TrimOperation(this, direction);
  }

  slice(start: number, end: number) {
    return new SliceOperation(this, start, end);
  }

  replace(target: TextConvertible, replacement: TextConvertible) {
    return new ReplaceOperation(
      this,
      toTextValue(target),
      toTextValue(replacement)
    );
  }

  replaceAll(...replacements: Pair<TextConvertible, TextConvertible>[]) {
    return new ReplaceAllOperation(
      this,
      replacements.map((pair) => [toTextValue(pair[0]), toTextValue(pair[1])])
    );
  }

  remove(target: TextConvertible) {
    return new RemoveOperation(this, toTextValue(target));
  }

  toLower() {
    return new ToLowerOperation(this);
  }

  toUpper() {
    return new ToUpperOperation(this);
  }

  extractOne(pattern: TextConvertible) {
    return new ExtractOneOperation(this, toTextValue(pattern));
  }

  patternReplace(pattern: TextConvertible, replacement: TextConvertible) {
    return new PatternReplaceOperation(
      this,
      toTextValue(pattern),
      toTextValue(replacement)
    );
  }

  patternReplaceAll(...replacements: Pair<TextConvertible, TextConvertible>[]) {
    return new PatternReplaceAllOperation(
      this,
      replacements.map((pair) => [toTextValue(pair[0]), toTextValue(pair[1])])
    );
  }
}

export class TextLiteral extends TextValue {
  constructor(public value: string) {
    super();
  }
}

export class TextColumn extends TextValue {
  constructor(public tableName: string, public columnName: string) {
    super();
  }
}

export class ConcatOperation extends TextValue {
  constructor(public valueA: TextValue, public valueB: TextValue) {
    super();
  }
}

export class TrimOperation extends TextValue {
  constructor(public value: TextValue, public direction: TrimDirection) {
    super();
  }
}

export class SliceOperation extends TextValue {
  constructor(
    public value: TextValue,
    public start: number,
    public end: number
  ) {
    super();
  }
}

export class ReplaceOperation extends TextValue {
  constructor(
    public value: TextValue,
    public target: TextValue,
    public replacement: TextValue
  ) {
    super();
  }
}

export class ReplaceAllOperation extends TextValue {
  constructor(
    public value: TextValue,
    public replacements: Pair<TextValue, TextValue>[]
  ) {
    super();
  }
}

export class RemoveOperation extends TextValue {
  constructor(public value: TextValue, public target: TextValue) {
    super();
  }
}

export class ToLowerOperation extends TextValue {
  constructor(public value: TextValue) {
    super();
  }
}

export class ToUpperOperation extends TextValue {
  constructor(public value: TextValue) {
    super();
  }
}

export class ExtractOneOperation extends TextValue {
  constructor(public value: TextValue, public pattern: TextValue) {
    super();
  }
}

export class PatternReplaceOperation extends TextValue {
  constructor(
    public value: TextValue,
    public pattern: TextValue,
    public replacement: TextValue
  ) {
    super();
  }
}

export class PatternReplaceAllOperation extends TextValue {
  constructor(
    public value: TextValue,
    public replacements: Pair<TextValue, TextValue>[]
  ) {
    super();
  }
}

export function text(value: string): TextLiteral;
export function text(
  template: TemplateStringsArray,
  ...params: TextValue[]
): ConcatOperation;
export function text(
  template: TemplateStringsArray | string,
  ...params: TextValue[]
): TextValue {
  if (isString(template)) {
    return new TextLiteral(template);
  }
  return params.reduce(
    (previousValue: TextValue, currentValue: TextValue, i: number) => {
      let newValue = previousValue;
      if (isEmptyText(newValue)) {
        newValue = currentValue;
      } else {
        newValue = newValue.add(currentValue);
      }
      if (template[i + 1] !== "") {
        newValue = newValue.add(new TextLiteral(template[i + 1]));
      }
      return newValue;
    },
    new TextLiteral(template[0])
  );
}

export function toIntegerValue(value: IntegerConvertible): IntegerValue {
  return value instanceof IntegerValue ? value : new IntegerLiteral(value);
}

export type IntegerConvertible = IntegerValue | number;

export class IntegerValue extends Value {
  constructor() {
    super();
  }
}

export class IntegerLiteral extends IntegerValue {
  constructor(public value: number) {
    super();
  }
}

export class IntegerColumn extends IntegerValue {
  constructor(public tableName: string, public columnName: string) {
    super();
  }
}
