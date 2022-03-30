export function arrayCodeToValue(code: string) {
  return listCodeToValue(code.slice(1, code.length - 1));
}

export function arrayValueToCode(value: string) {
  return "[" + listValueToCode(value) + "]";
}

const LIST_PLACEHOLDER = "__list_placeholder";

export function listCodeToValue(code: string) {
  if (code === LIST_PLACEHOLDER) {
    return "";
  }
  return code;
}

export function listValueToCode(value: string) {
  return (
    value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v)
      .join(", ") || LIST_PLACEHOLDER
  );
}
