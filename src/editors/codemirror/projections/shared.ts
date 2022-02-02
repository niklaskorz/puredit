import type { EditorState } from "@codemirror/basic-setup";
import { ProjectionWidget } from "./projection";

export function bold(text: string): HTMLSpanElement {
  const el = document.createElement("b");
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
