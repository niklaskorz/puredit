import type { EditorState } from "@codemirror/basic-setup";
import type { SyntaxNode } from "@lezer/common";
import { ProjectionWidget } from "./projection";

export class TextWidget extends ProjectionWidget<SyntaxNode> {
  private inputSizer!: HTMLLabelElement;
  private input!: HTMLInputElement;

  protected initialize(): HTMLElement {
    this.inputSizer = document.createElement("label");
    this.input = this.inputSizer.appendChild(document.createElement("input"));
    this.inputSizer.className = "cm-text-widget input-sizer";
    this.input.className = "select";
    this.input.type = "text";
    this.input.placeholder = "text";
    this.input.size = 1;
    this.input.addEventListener("input", this.onInput.bind(this));
    return this.inputSizer;
  }

  protected update(node: SyntaxNode, state: EditorState) {
    let value = state.doc
      .sliceString(node.from + 1, node.to - 1)
      .replaceAll("\\\\", "\\")
      .replaceAll('\\"', '"')
      .replaceAll("\\'", "'")
      //.replaceAll(" ", "·")
      .replaceAll("\n", "↵");
    this.inputSizer.dataset.value = value;
    this.input.value = value;
    this.input.size = value.length ? 1 : this.input.placeholder.length;
  }

  public focus(): void {
    this.input.focus();
    this.input.select();
  }

  private onInput() {
    if (!this.view) {
      return;
    }
    this.view.dispatch({
      changes: {
        from: this.data.from + 1,
        to: this.data.to - 1,
        insert: this.input.value
          .replaceAll("\\", "\\\\")
          .replaceAll('"', '\\"')
          .replaceAll("'", "\\'")
          //.replaceAll("·", " ")
          .replaceAll("↵", "\n"),
      },
    });
  }
}
