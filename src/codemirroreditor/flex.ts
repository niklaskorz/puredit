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
  let preserveMark = Decoration.mark({ class: "preserve" });
  let lineMark = Decoration.line({ class: "flex" });
  let decorations: Array<Range<Decoration>> = [];
  for (let i = 1; i <= view.state.doc.lines; i++) {
    let line = view.state.doc.line(i);
    if (line.text) {
      decorations.push(lineMark.range(line.from, line.from));
      decorations.push(preserveMark.range(line.from, line.to));
    }
  }
  return Decoration.set(decorations);
}

class FlexPlugin implements PluginValue {
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

/**
 * View plugin that applies flexbox-based centering to the lines
 * of an editor. The plugin depends on the fact that view plugins
 * have low precedence in CodeMirror, while state fields by default
 * have higher precedence. Thus, ranges that are not affected by the
 * projection state will get the preserve class, which ensures
 * the text inside is correctly handling whitespace.
 * The flex class applied to the line then centers all its direct
 * children vertically.
 */
export const flexPlugin = ViewPlugin.fromClass(FlexPlugin, {
  decorations: (v) => v.decorations,
});
