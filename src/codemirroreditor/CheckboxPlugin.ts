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
} from "@codemirror/view";

class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) {
    super();
  }

  eq(other: CheckboxWidget): boolean {
    return other.checked === this.checked;
  }

  toDOM(): HTMLElement {
    let wrap = document.createElement("label");
    wrap.className = "cm-boolean-toggle";
    let box = wrap.appendChild(document.createElement("input"));
    box.type = "checkbox";
    box.checked = this.checked;
    if (this.checked) {
      wrap.append("on");
    } else {
      wrap.append("off");
    }
    return wrap;
  }

  ignoreEvent(event: Event): boolean {
    return event.type !== "change";
  }
}

function checkboxes(view: EditorView) {
  let widgets: Array<Range<Decoration>> = [];
  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(type, from, to) {
        if (type.name == "BooleanLiteral") {
          let isTrue = view.state.doc.sliceString(from, to) == "true";
          let deco = Decoration.replace({
            widget: new CheckboxWidget(isTrue),
          });
          widgets.push(deco.range(from, to));
        }
      },
    });
  }
  return Decoration.set(widgets);
}

function toggleBoolean(view: EditorView, pos: number) {
  let before = view.state.doc.sliceString(Math.max(0, pos - 5), pos);
  let change;
  if (before == "false") {
    change = { from: pos - 5, to: pos, insert: "true" };
  } else if (before.endsWith("true")) {
    change = { from: pos - 4, to: pos, insert: "false" };
  } else {
    return false;
  }
  view.dispatch({ changes: change });
  return true;
}

class CheckboxPlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = checkboxes(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = checkboxes(update.view);
    }
  }

  destroy() {}
}

export const checkboxPlugin = ViewPlugin.fromClass(CheckboxPlugin, {
  decorations: (v) => v.decorations,
  eventHandlers: {
    change(e, view) {
      let target = e.target as HTMLInputElement;
      if (
        target.nodeName == "INPUT" &&
        target.parentElement?.classList.contains("cm-boolean-toggle")
      ) {
        return toggleBoolean(view, view.posAtDOM(target));
      }
    },
  },
});
