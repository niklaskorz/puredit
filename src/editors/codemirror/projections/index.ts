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
import {
  arg,
  block,
  createPatternMap,
  findPatterns,
  Match,
  pattern,
  PatternNode,
} from "../../../parsers/lezer";
import { flexPlugin } from "./flex";
import type { ProjectionWidgetClass } from "./projection";
import { replaceOperationPattern, ReplaceOperationWidget } from "./replace";
import { trimOperationPattern, TrimOperationWidget } from "./trim";

interface ProjectionState {
  decorations: DecorationSet;
  visibleDecorations: DecorationSet;
}

const projectionState = StateField.define<ProjectionState>({
  create(state) {
    let tree = syntaxTree(state);
    let matches = findPatterns(patternMap, tree.cursor(), state.doc);
    let decorations = updateProjections(Decoration.none, false, state, matches);
    return { decorations, visibleDecorations: decorations };
  },
  update({ decorations }, transaction) {
    decorations = decorations.map(transaction.changes);
    let state = transaction.state;
    let tree = syntaxTree(state);
    let matches = findPatterns(patternMap, tree.cursor(), state.doc);
    decorations = updateProjections(decorations, false, state, matches);

    // TODO: figure out a way to incrementally match changes, to avoid
    // rematching the whole tree.
    /*transaction.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
      let matches = findPatterns(
        patternMap,
        tree.cursor(fromB),
        state.doc,
        toB
      );
      decorations = updateProjections(decorations, true, state, matches);
    });*/

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

let changeBlockPattern = pattern`
  db.change(${arg("table", "string")}, (table) => ${block()});
`;
let patternMap = createPatternMap(
  changeBlockPattern,
  replaceOperationPattern,
  trimOperationPattern
);

let projections = new Map<PatternNode, ProjectionWidgetClass<Match>>([
  [replaceOperationPattern, ReplaceOperationWidget],
  [trimOperationPattern, TrimOperationWidget],
]);

function updateProjections(
  decorations: DecorationSet,
  isUpdate: boolean,
  state: EditorState,
  matches: Match[]
): DecorationSet {
  for (const match of matches) {
    const Widget = projections.get(match.pattern);
    if (!Widget) {
      //console.warn("No projection found for pattern", match.pattern);
      continue;
    }
    let { from, to } = match.node;
    let found = false;
    decorations.between(from, to, (a, b, dec) => {
      let widget = dec.spec.widget;
      if ((a === from || b === to) && widget instanceof Widget) {
        widget.set(match, state);
        found = true;
        // Adjust range
        if (a !== from || b !== to) {
          decorations = decorations.update({
            add: [dec.range(from, to)],
            filterFrom: a,
            filterTo: b,
            filter: (innerFrom, innerTo) =>
              match.blocks.some(
                (block) => block.from <= innerFrom && block.to >= innerTo
              ),
          });
        }
        return false;
      }
    });
    if (!found) {
      decorations = decorations.update({
        add: [
          Decoration.replace({
            widget: new Widget(isUpdate, match, state),
          }).range(from, to),
        ],
        filterFrom: from,
        filterTo: to,
        filter: (innerFrom, innerTo) =>
          match.blocks.some(
            (block) => block.from <= innerFrom && block.to >= innerTo
          ),
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
