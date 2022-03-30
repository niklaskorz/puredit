export function arrayCodeToValue(code: string) {
  return code.slice(1, code.length - 1);
}

export function arrayValueToCode(value: string) {
  return "[" + listValueToCode(value) + "]";
}

export function listValueToCode(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v)
    .join(", ");
}
