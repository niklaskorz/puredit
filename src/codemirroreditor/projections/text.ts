import { Projection, ProjectionWidget } from "./projection";

interface Data {
  value: string;
  length: number;
}

class TextWidget extends ProjectionWidget<Data> {
  private inputSizer!: HTMLLabelElement;
  private input!: HTMLInputElement;

  protected initialize(): HTMLElement {
    this.inputSizer = document.createElement("label");
    this.input = this.inputSizer.appendChild(document.createElement("input"));
    this.inputSizer.className = "cm-text-widget input-sizer";
    this.input.className = "select string";
    this.input.type = "text";
    this.input.placeholder = "text";
    this.input.size = 1;
    this.input.addEventListener("input", this.onInput.bind(this));
    return this.inputSizer;
  }

  protected update({ value }: Data) {
    value = value
      .slice(1, value.length - 1)
      .replaceAll("\\\\", "\\")
      .replaceAll("\n", "\\n");
    this.inputSizer.dataset.value = value;
    this.input.value = value;
    this.input.size = value.length ? 1 : this.input.placeholder.length;
  }

  protected focus(): void {
    this.input.focus();
  }

  private onInput() {
    if (!this.view) {
      return;
    }
    let pos = this.view.posAtDOM(this.inputSizer);
    this.view.dispatch({
      changes: {
        from: pos + 1,
        to: pos + this.data.length - 1,
        insert: this.input.value
          .replaceAll("\\n", "\n")
          .replaceAll("\\", "\\\\"),
      },
    });
  }
}

export const textProjection: Projection<Data> = {
  Widget: TextWidget,
  extractData(state, type, from, to) {
    let value = state.doc.sliceString(from, to);
    let length = to - from;
    return { value, length };
  },
};
