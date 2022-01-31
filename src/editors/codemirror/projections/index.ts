import { syntaxTree } from "@codemirror/language";
import { EditorState, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  PluginField,
  PluginValue,
  ViewPlugin,
} from "@codemirror/view";
import type { NodeType } from "@lezer/common";
import { boxProjection } from "./box";
import { checkboxProjection } from "./checkbox";
import { flexPlugin } from "./flex";
import type { Projection } from "./projection";
import { textProjection } from "./text";

interface ProjectionState {
  decorations: DecorationSet;
  visibleDecorations: DecorationSet;
}

const projectionState = StateField.define<ProjectionState>({
  create(state) {
    let decorations = Decoration.none;
    syntaxTree(state).iterate({
      enter(type, from, to) {
        decorations = detectProjections(
          decorations,
          false,
          state,
          type,
          from,
          to
        );
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
          decorations = detectProjections(
            decorations,
            true,
            state,
            type,
            from,
            to
          );
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

let projections: Record<string, Projection<any>> = {
  ArrowFunction: boxProjection,
  String: textProjection,
  BooleanLiteral: checkboxProjection,
};

function detectProjections(
  decorations: DecorationSet,
  isUpdate: boolean,
  state: EditorState,
  type: NodeType,
  from: number,
  to: number
): DecorationSet {
  if (projections.hasOwnProperty(type.name)) {
    let projection = projections[type.name];
    let data = projection.extractData(state, type, from, to);
    let found = false;
    decorations.between(from, to, (a, b, dec) => {
      let widget = dec.spec.widget;
      if ((a === from || b === to) && widget instanceof projection.Widget) {
        widget.set(data);
        found = true;
        // Adjust range
        if (a !== from || b !== to) {
          decorations = decorations.update({
            add: [dec.range(from, to)],
            filterFrom: a,
            filterTo: b,
            filter: (_from, _to, decoration) => dec !== decoration,
          });
        }
        return false;
      }
    });
    if (!found) {
      decorations = decorations.update({
        add: [
          Decoration.replace({
            widget: new projection.Widget(isUpdate, data),
          }).range(from, to),
        ],
      });
    }
  }
  return decorations;
}

interface ProjectionRangeValue extends PluginValue {
  decorations: DecorationSet;
}

/**
 * Marks projections as atomic ranges. This has the effect that the cursor
 * will skip the projections instead of stepping into their text.
 * Furthermore, backspace will remove the projections as a unit
 * instead of removing single characters from a projection's inner code.
 */
const projectionRangePlugin = ViewPlugin.define<ProjectionRangeValue>(
  (view) => {
    return {
      decorations: view.state.field(projectionState).visibleDecorations,
      update(update) {
        this.decorations =
          update.state.field(projectionState).visibleDecorations;
      },
    };
  },
  {
    provide: PluginField.atomicRanges.from((v) => v.decorations),
  }
);

export const projectionPlugin = [
  projectionState.extension,
  projectionRangePlugin,
  flexPlugin,
];