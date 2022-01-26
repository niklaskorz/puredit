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

class TextWidget extends WidgetType {
  constructor(
    readonly value: string,
    readonly from: number,
    readonly to: number
  ) {
    super();
  }

  eq(other: TextWidget): boolean {
    return (
      other.value === this.value &&
      other.from === this.from &&
      other.to === this.to
    );
  }

  toDOM(): HTMLElement {
    console.log("creating", this.value);
    let wrap = document.createElement("span");
    let box = wrap.appendChild(document.createElement("input"));
    this.update(wrap, box);
    return wrap;
  }

  updateDOM(wrap: HTMLElement): boolean {
    let box = wrap.firstChild;
    if (!(wrap instanceof HTMLSpanElement && box instanceof HTMLInputElement)) {
      console.log("no update");
      return false;
    }
    console.log("yes update");
    this.update(wrap, box);
    return true;
  }

  update(wrap: HTMLSpanElement, box: HTMLInputElement) {
    wrap.className = "cm-text-widget";
    box.type = "text";
    box.value = this.value.slice(1, this.value.length - 1);
    box.dataset.from = this.from.toString();
    box.dataset.to = this.to.toString();
  }

  ignoreEvent(event: Event): boolean {
    return event.type !== "input";
  }
}

function texts(view: EditorView) {
  let widgets: Array<Range<Decoration>> = [];
  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(type, from, to) {
        if (type.name == "String") {
          let value = view.state.doc.sliceString(from, to);
          let deco = Decoration.replace({
            widget: new TextWidget(value, from, to),
          });
          widgets.push(deco.range(from, to));
        }
      },
    });
  }
  return Decoration.set(widgets);
}

function updateText(view: EditorView, value: string, from: number, to: number) {
  console.log(value);
  view.dispatch({
    changes: {
      from,
      to,
      insert: JSON.stringify(value),
    },
  });
  return true;
}

class TextPlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = texts(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      console.log(update.view.state.doc);
      this.decorations = texts(update.view);
    }
  }

  destroy() {}
}

export const textPlugin = ViewPlugin.fromClass(TextPlugin, {
  decorations: (v) => v.decorations,
  provide: PluginField.atomicRanges.from((v) => v.decorations),
  eventHandlers: {
    input(e, view) {
      let target = e.target as HTMLInputElement;
      if (
        target.nodeName == "INPUT" &&
        target.parentElement?.classList.contains("cm-text-widget")
      ) {
        return updateText(
          view,
          target.value,
          parseInt(target.dataset.from!),
          parseInt(target.dataset.to!)
        );
      }
    },
  },
});
