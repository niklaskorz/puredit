import { Projection, ProjectionWidget } from "./projection";

interface Data {
  checked: boolean;
}

class CheckboxWidget extends ProjectionWidget<Data> {
  private box!: HTMLInputElement;
  private text!: HTMLSpanElement;

  protected initialize(data: Data): HTMLElement {
    let wrap = document.createElement("label");
    wrap.className = "cm-boolean-toggle";
    this.box = wrap.appendChild(document.createElement("input"));
    this.box.type = "checkbox";
    this.box.addEventListener("change", this.onChange.bind(this));
    this.text = wrap.appendChild(document.createElement("span"));
    return wrap;
  }

  protected update(data: Data): void {
    this.box.checked = data.checked;
    this.text.textContent = data.checked ? "on" : "off";
  }

  private onChange() {
    let pos = this.position;
    if (this.view && pos != null) {
      const checked = this.box.checked;
      this.view.dispatch({
        changes: {
          from: pos,
          to: pos + (!checked).toString().length,
          insert: this.box.checked.toString(),
        },
      });
    }
  }
}

export const checkboxProjection: Projection<Data> = {
  Widget: CheckboxWidget,
  extractData(state, type, from, to) {
    let checked = state.doc.sliceString(from, to) === "true";
    return { checked };
  },
};
