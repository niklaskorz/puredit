export function isString(value: unknown): value is string {
  return value instanceof String || typeof value === "string";
}

let idCounter = 0;

export function nextId(): number {
  return idCounter++;
}

export function assert(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error("Assertion failed");
  }
}
