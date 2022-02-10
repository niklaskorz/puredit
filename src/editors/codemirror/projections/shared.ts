import type { EditorState, EditorView } from "@codemirror/basic-setup";
import { HighlightStyle, tags } from "@codemirror/highlight";
import type { ChangeSpec } from "@codemirror/state";
import type { Text } from "@codemirror/text";
import type { SyntaxNode } from "@lezer/common";
import { ProjectionWidget } from "./projection";

export function nodeValue(
  node: SyntaxNode,
  text: Text,
  offsetLeftRight: number = 0
): string {
  return text.sliceString(
    node.from + offsetLeftRight,
    node.to - offsetLeftRight
  );
}

export function stringLiteralValue(node: SyntaxNode, text: Text) {
  return (
    nodeValue(node, text, 1)
      .replaceAll("\\\\", "\\")
      .replaceAll('\\"', '"')
      .replaceAll("\\'", "'")
      //.replaceAll(" ", "·")
      .replaceAll("\n", "↵")
  );
}

export function nodeValueChange(
  node: SyntaxNode,
  newValue: string,
  offsetLeftRight: number = 0
): ChangeSpec {
  return {
    from: node.from + offsetLeftRight,
    to: node.to - offsetLeftRight,
    insert: newValue,
  };
}

export function stringLiteralValueChange(
  node: SyntaxNode,
  newValue: string
): ChangeSpec {
  return nodeValueChange(
    node,
    newValue
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"')
      .replaceAll("'", "\\'")
      //.replaceAll("·", " ")
      .replaceAll("↵", "\n"),
    1
  );
}

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

    toDOM(view: EditorView): HTMLElement {
      const dom = super.toDOM(view);
      dom.addEventListener("click", () => {
        view.dispatch({
          selection: {
            anchor: this.data.node.from,
            head: this.data.node.to,
          },
        });
      });
      return dom;
    }
  };
