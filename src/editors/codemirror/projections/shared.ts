import type { EditorState } from "@codemirror/basic-setup";
import { distinctProjectionKeywords } from "./config";
import { ProjectionWidget } from "./projection";

export function bold(text: string): HTMLElement {
  const el = document.createElement("b");
  el.textContent = text;
  return el;
}

export function keyword(text: string): HTMLElement {
  if (distinctProjectionKeywords) {
    return bold(text);
  }
  const el = document.createElement("span");
  el.className = "ͼa";
  el.textContent = text;
  return el;
}

export const staticWidget = (initialize: () => HTMLElement) =>
  class extends ProjectionWidget<any> {
    protected initialize(data: any, state: EditorState): HTMLElement {
      return initialize();
    }

    protected update(data: any, state: EditorState): void {}
  };
