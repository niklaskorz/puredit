import type { EditorState } from "@codemirror/basic-setup";
import { HighlightStyle, tags } from "@codemirror/highlight";
import { ProjectionWidget } from "./projection";

export function bold(text: string): HTMLElement {
  const el = document.createElement("b");
  el.textContent = text;
  return el;
}

export function keyword(text: string, state: EditorState): HTMLElement {
  const el = document.createElement("span");
  el.className = HighlightStyle.get(state, tags.keyword) || "";
  el.textContent = text;
  return el;
}

export function span(text: string): HTMLElement {
  const el = document.createElement("span");
  el.textContent = text;
  return el;
}

export const staticWidget = (initialize: (state: EditorState) => HTMLElement) =>
  class extends ProjectionWidget<any> {
    protected initialize(data: any, state: EditorState): HTMLElement {
      return initialize(state);
    }

    protected update(data: any, state: EditorState): void {}
  };
