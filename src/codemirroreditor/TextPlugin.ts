import { syntaxTree } from "@codemirror/language";
import { StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  Range,
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
    widget.update(value, from);
    return widget;
  }
  let widget = new TextWidget(value, from);
  cachedElements.push(widget);
  return widget;
}

class TextWidget extends WidgetType {
  private view: EditorView | null = null;
  private inputSizer: HTMLLabelElement;
  private input: HTMLInputElement;

  constructor(private value: string, private length: number) {
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
    return other.inputSizer === this.inputSizer;
  }

  toDOM(view: EditorView): HTMLElement {
    this.view = view;
    return this.inputSizer;
  }

  update(value: string, length: number) {
    this.value = value;
    this.length = length;
    this.updateBox();
  }

  updateBox() {
    let value = this.value
      .slice(1, this.value.length - 1)
      .replaceAll("\\\\", "\\")
      .replaceAll("\n", "\\n");
    this.inputSizer.dataset.value = value;
    this.input.value = value;
    this.input.size = value.length ? 1 : this.input.placeholder.length;
  }

  onInput() {
    if (!this.view) {
      return;
    }
    let pos = this.view.posAtDOM(this.inputSizer);
    this.view.dispatch({
      changes: {
        from: pos + 1,
        to: pos + this.length - 1,
        insert: this.input.value
          .replaceAll("\\n", "\n")
          .replaceAll("\\", "\\\\"),
      },
    });
  }

  ignoreEvent(event: Event): boolean {
    return true;
  }

  destroy(_dom: HTMLElement): void {
    this.view = null;
  }
}

class BoxWidget extends WidgetType {
  toDOM(): HTMLElement {
    let element = document.createElement("span");
    element.textContent = "hidden block";
    element.className = "cm-foldPlaceholder";
    return element;
  }
}

let boxWidget = Decoration.replace({ widget: new BoxWidget() });

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
        if (type.name === "ArrowFunction") {
          if (from > last) {
            decorations.push(preserveMark.range(last + 1, from - 1));
          }
          widgets.push(boxWidget.range(from, to));
          last = to;
        } else if (false && type.name === "TemplateString") {
          if (from > last) {
            decorations.push(preserveMark.range(last, from));
          }
          let value = view.state.doc.sliceString(from, to);
          let deco = Decoration.replace({
            widget: upsertTextWidget(i, view, value, from, to),
          }).range(from, to);
          widgets.push(deco);
          decorations.push(deco);
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
  //provide: PluginField.atomicRanges.from((v) => v.widgets),
});

interface ProjectionState {
  decorations: DecorationSet;
  visibleDecorations: DecorationSet;
}

export const projectionState = StateField.define<ProjectionState>({
  create(state) {
    let decorations = Decoration.none;
    syntaxTree(state).iterate({
      enter(type, from, to) {
        if (type.name === "ArrowFunction") {
          decorations = decorations.update({
            add: [boxWidget.range(from, to)],
          });
        }
      },
    });
    return { decorations, visibleDecorations: decorations };
  },
  update({ decorations }, transaction) {
    decorations = decorations.map(transaction.changes);
    let state = transaction.state;
    transaction.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
      syntaxTree(state).iterate({
        from: fromB,
        to: toB,
        enter(type, from, to) {
          if (type.name === "ArrowFunction") {
            decorations = decorations.update({
              add: [boxWidget.range(from, to)],
              filterFrom: from,
              filterTo: to,
              filter: () => false,
            });
          } else if (type.name === "TemplateString") {
            let value = state.doc.sliceString(from, to);
            let length = to - from;
            let found = false;
            decorations.between(from, to, (a, b, dec) => {
              let widget = dec.spec.widget;
              if (a === from && b === to && widget instanceof TextWidget) {
                widget.update(value, length);
                found = true;
                return false;
              }
            });
            if (!found) {
              let deco = Decoration.replace({
                widget: new TextWidget(value, length),
              }).range(from, to);
              decorations = decorations.update({
                add: [deco],
                filterFrom: from,
                filterTo: to,
                filter: () => false,
              });
            }
          }
        },
      });
    });
    let visibleDecorations = decorations;
    if (transaction.selection) {
      let onSelection = false;
      let { head } = transaction.selection.main;
      decorations.between(head, head, (from, to) => {
        if (from < head && to > head) {
          onSelection = true;
        }
      });
      if (onSelection) {
        visibleDecorations = decorations.update({
          filterFrom: head,
          filterTo: head,
          filter: (from, to) => to <= head || from >= head,
        });
      }
    }
    return { decorations, visibleDecorations };
  },
  provide: (f) =>
    EditorView.decorations.from(
      f,
      ({ visibleDecorations }) => visibleDecorations
    ),
});
