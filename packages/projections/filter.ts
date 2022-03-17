import { ChangeSet, EditorSelection, EditorState } from "@codemirror/state";
import type { ChangeSpec } from "@codemirror/state";
import { ProjectionWidget } from "./projection";
import { projectionState } from "./state";

export const transactionFilter = EditorState.transactionFilter.of((tr) => {
  const { decorations } = tr.startState.field(projectionState);

  // Handle changes to a projection's range.
  // Changes that replace the whole projection are accepted.
  // Changes that remove the start or end of a decoration remove the whole projection range.
  // All other changes in the projection range are rejected.
  const changes: ChangeSpec[] = [];
  let modifyChanges = false;
  tr.changes.iterChanges((from, to, _fromB, _toB, insert) => {
    const change = { from, to, insert };
    let accept = true;
    // Only check decorations for which the change affects
    // its insides. By using the +/- 1 offset, we avoid
    // filtering insertion directly before or after a decoration.
    decorations.between(from + 1, to - 1, (fromDec, toDec, dec) => {
      const widget: ProjectionWidget = dec.spec.widget;
      if (
        (from === fromDec && to === from + 1) ||
        (to === toDec && from === to - 1)
      ) {
        change.from = widget.match.node.startIndex;
        change.to = widget.match.node.endIndex;
        Object.assign(tr, {
          selection: EditorSelection.single(widget.match.node.startIndex),
        });
        modifyChanges = true;
        return false;
      }
      if (from > fromDec || to < toDec) {
        accept = false;
        modifyChanges = true;
        return false;
      }
    });
    if (accept) {
      changes.push(change);
    }
  }, true);
  if (modifyChanges) {
    Object.assign(tr, {
      changes: ChangeSet.of(
        changes,
        tr.changes.length,
        tr.startState.lineBreak
      ),
    });
  }

  // Handle cursor movements into projections
  const { selection } = tr;
  if (
    !modifyChanges &&
    selection?.ranges.length === 1 &&
    selection.main.empty
  ) {
    const pos = selection.main.anchor;
    const assoc = selection.main.assoc;
    // Find decorations that _contain_ the cursor (hence the +/- 1),
    // not only touch it
    decorations.between(pos + 1, pos - 1, (fromDec, toDec, dec) => {
      const widget = dec.spec.widget;
      if (!(widget instanceof ProjectionWidget)) {
        return;
      }
      // Cursor entering from left
      if (assoc === -1 && pos === fromDec + 1) {
        if (!widget.enterFromStart()) {
          Object.assign(tr, { selection: EditorSelection.single(toDec) });
        }
        return false;
      }
      // Cursor entering from right
      if (assoc === 1 && pos === toDec - 1) {
        if (!widget.enterFromEnd()) {
          Object.assign(tr, { selection: EditorSelection.single(fromDec) });
        }
        return false;
      }
    });
  }

  return tr;
});
