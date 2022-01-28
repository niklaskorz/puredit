import {
  Decoration,
  DecorationSet,
  EditorView,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
  Range,
} from "@codemirror/view";

function lines(view: EditorView) {
  let lineMark = Decoration.line({ class: "flex" });
  let decorations: Array<Range<Decoration>> = [];
  for (let i = 1; i <= view.state.doc.lines; i++) {
    let line = view.state.doc.line(i);
    if (line.text) {
      decorations.push(lineMark.range(line.from, line.from));
    }
  }
  return Decoration.set(decorations);
}

class LinePlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = lines(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged) {
      this.decorations = lines(update.view);
    }
  }

  destroy() {}
}

export const linePlugin = ViewPlugin.fromClass(LinePlugin, {
  decorations: (v) => v.decorations,
});
