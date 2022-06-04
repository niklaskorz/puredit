export function isString(value: unknown): value is string {
  return value instanceof String || typeof value === "string";
}

let idCounter = 0;

export function nextId(): number {
  return idCounter++;
}

export function assert(condition: boolean, msg: string): asserts condition {
  if (!condition) {
    throw new Error("Assertion failed: " + msg);
  }
}

export function* zip<A, B>(a: A[], b: B[]): Generator<[A, B], void> {
  if (a.length !== b.length) {
    console.warn("Zipping two differently sized arrays");
  }
  for (let i = 0; i < a.length && i < b.length; i++) {
    yield [a[i], b[i]];
  }
}

export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}
