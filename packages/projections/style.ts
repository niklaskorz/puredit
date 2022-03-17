import { EditorView } from "@codemirror/view";

export const style = EditorView.theme({
  ".cm-line.flex": {
    display: "flex",
    alignItems: "center",
  },
  ".inline-flex": {
    display: "inline-flex",
    alignItems: "center",
  },
  ".flex > *, .inline-flex > *": {
    flex: "0 0 auto",
  },
  ".cm-gutterElement": {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  ".cm-completionIcon": {
    boxSizing: "content-box",
  },
  ".cm-completionIcon-projection::after": {
    content: '"✨"',
  },
});
