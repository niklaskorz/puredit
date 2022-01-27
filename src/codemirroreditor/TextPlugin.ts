import { syntaxTree } from "@codemirror/language";
import {
  Decoration,
  DecorationSet,
  EditorView,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  Range,
  PluginField,
} from "@codemirror/view";

let cachedElements: Array<TextWidget> = [];

function upsertTextWidget(
  i: number,
  view: EditorView,
  value: string,
  from: number,
  to: number
) {
  if (cachedElements[i]) {
    let widget = cachedElements[i];
    widget.update(value, from, to);
    return widget;
  }
  let widget = new TextWidget(view, value, from, to);
  cachedElements.push(widget);
  return widget;
}

class TextWidget extends WidgetType {
  private inputSizer: HTMLLabelElement;
  private input: HTMLInputElement;

  constructor(
    private view: EditorView,
    private value: string,
    private from: number,
    private to: number
  ) {
    super();
    this.inputSizer = document.createElement("label");
    this.input = this.inputSizer.appendChild(document.createElement("input"));
    this.inputSizer.className = "cm-text-widget input-sizer";
    this.input.className = "select string";
    this.input.type = "text";
    this.input.placeholder = "text";
    this.input.size = 1;
    this.input.addEventListener("input", this.onInput.bind(this));
    this.updateBox();
  }

  eq(other: TextWidget): boolean {
    return (
      other.value === this.value &&
      other.from === this.from &&
      other.to === this.to
    );
  }

  toDOM(): HTMLElement {
    return this.inputSizer;
  }

  update(value: string, from: number, to: number) {
    this.value = value;
    this.from = from;
    this.to = to;
    this.updateBox();
  }

  updateBox() {
    let value = this.value.slice(1, this.value.length - 1);
    this.inputSizer.dataset.value = value;
    this.input.value = value;
    this.input.size = value.length ? 1 : this.input.placeholder.length;
  }

  onInput() {
    this.view.dispatch({
      changes: {
        from: this.from,
        to: this.to,
        insert: JSON.stringify(this.input.value),
      },
    });
  }

  ignoreEvent(event: Event): boolean {
    return true;
  }
}

function texts(view: EditorView) {
  let preserveMark = Decoration.mark({ class: "preserve" });
  let widgets: Array<Range<Decoration>> = [];
  let decorations: Array<Range<Decoration>> = [];
  let i = 0;
  for (let { from, to } of view.visibleRanges) {
    let last = from;
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(type, from, to) {
        if (type.name == "String") {
          if (from > last) {
            decorations.push(preserveMark.range(last, from));
          }
          let value = view.state.doc.sliceString(from, to);
          let deco = Decoration.replace({
            widget: upsertTextWidget(i, view, value, from, to),
          });
          widgets.push(deco.range(from, to));
          decorations.push(deco.range(from, to));
          i += 1;
          last = to;
        }
      },
    });
    if (to > last) {
      decorations.push(preserveMark.range(last, to));
    }
  }
  cachedElements.splice(i);
  return [Decoration.set(decorations), Decoration.set(widgets)];
}

class TextPlugin implements PluginValue {
  decorations: DecorationSet;
  widgets: DecorationSet;

  constructor(view: EditorView) {
    let [decorations, widgets] = texts(view);
    this.decorations = decorations;
    this.widgets = widgets;
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      let [decorations, widgets] = texts(update.view);
      this.decorations = decorations;
      this.widgets = widgets;
    }
  }

  destroy() {}
}

export const textPlugin = ViewPlugin.fromClass(TextPlugin, {
  decorations: (v) => v.decorations,
  provide: PluginField.atomicRanges.from((v) => v.widgets),
});
