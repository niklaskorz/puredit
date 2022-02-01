export function bold(text: string): HTMLSpanElement {
  const el = document.createElement("b");
  el.textContent = text;
  return el;
}
