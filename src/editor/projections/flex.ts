import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  Range,
} from "@codemirror/view";
import type { DecorationSet, PluginValue } from "@codemirror/view";
import { projectionState } from "./state";

function lines(view: EditorView) {
  const state = view.state.field(projectionState);
  let preserveMark = Decoration.mark({ class: "preserve" });
  let lineMark = Decoration.line({ class: "flex" });
  let decorations: Array<Range<Decoration>> = [];
  let cursor = state.decorations.iter();
  while (cursor.value) {
    const start = view.state.doc.lineAt(cursor.from);
    const end = view.state.doc.lineAt(cursor.to);
    if (start.text) {
      decorations.push(lineMark.range(start.from, start.from));
      decorations.push(preserveMark.range(start.from, start.to));
    }
    if (start.number !== end.number && end.text) {
      decorations.push(lineMark.range(end.from, end.from));
      decorations.push(preserveMark.range(end.from, end.to));
    }
    cursor.next();
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
