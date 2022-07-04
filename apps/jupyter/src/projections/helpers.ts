export function arrayCodeToValue(code: string) {
  if (code === "") {
    return "";
  }
  return listCodeToValue(code.slice(1, code.length - 1));
}

export function arrayValueToCode(value: string) {
  return "[" + listValueToCode(value) + "]";
}

export function listCodeToValue(code: string) {
  return code;
}

export function listValueToCode(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v)
    .join(", ");
}
