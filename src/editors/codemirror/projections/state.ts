import { syntaxTree } from "@codemirror/language";
import { EditorState, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { zip } from "../../../shared/utils";
import {
  createPatternMap,
  findPatterns,
  Match,
  PatternNode,
} from "../../../parsers/lezer";
import { pickedCompletion } from "@codemirror/autocomplete";
import type { CodeBlock, ContextRange } from "src/parsers/lezer/types";
import { globalContextValues, globalContextVariables } from "./context";
import type { Projection } from "./types";
import { changeProjection } from "./changeProjection";
import { replaceProjection } from "./replaceProjection";
import { trimProjection } from "./trimProjection";

export interface ProjectionState {
  decorations: DecorationSet;
  contextRanges: ContextRange[];
}

export const projectionState = StateField.define<ProjectionState>({
  create(state) {
    let tree = syntaxTree(state);
    let { matches, contextRanges } = findPatterns(
      patternMap,
      tree.cursor(),
      state.doc,
      globalContextVariables
    );
    let decorations = updateProjections(Decoration.none, false, state, matches);
    return { decorations, contextRanges };
  },
  update({ decorations }, transaction) {
    const isCompletion = Boolean(transaction.annotation(pickedCompletion));
    decorations = decorations.map(transaction.changes);
    let state = transaction.state;
    let tree = syntaxTree(state);
    let { matches, contextRanges } = findPatterns(
      patternMap,
      tree.cursor(),
      state.doc,
      globalContextVariables
    );
    decorations = updateProjections(decorations, isCompletion, state, matches);

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

    return { decorations, contextRanges };
  },
  provide: (f) => EditorView.decorations.from(f, (state) => state.decorations),
});

let patternMap = createPatternMap(
  changeProjection.pattern,
  replaceProjection.pattern,
  trimProjection.pattern
);

let projections = new Map<PatternNode, Projection>([
  [changeProjection.pattern, changeProjection],
  [replaceProjection.pattern, replaceProjection],
  [trimProjection.pattern, trimProjection],
]);

function updateProjections(
  decorations: DecorationSet,
  isCompletion: boolean,
  state: EditorState,
  matches: Match[]
): DecorationSet {
  let newDecorations = Decoration.none;
  let contexts: object[] = [globalContextValues];
  let contextBounds: number[] = [];
  for (const match of matches) {
    if (
      contextBounds.length &&
      match.node.from >= contextBounds[contextBounds.length - 1]
    ) {
      contexts.pop();
      contextBounds.pop();
    }
    const projection = projections.get(match.pattern);
    if (!projection) {
      continue;
    }
    const { widgets, contextProvider } = projection;
    const context = Object.assign({}, ...contexts);
    if (contextProvider) {
      contexts.push(
        contextProvider(match, state.doc, Object.assign({}, context))
      );
      contextBounds.push(match.node.to);
    }
    const ranges = removeBlocksFromRange(
      match.node.from,
      match.node.to,
      match.blocks
    );
    for (const [{ from, to }, Widget] of zip(ranges, widgets)) {
      let found = false;
      decorations.between(from, to, (a, b, dec) => {
        let widget = dec.spec.widget;
        if ((a === from || b === to) && widget instanceof Widget) {
          widget.set(match, context, state);
          found = true;
          newDecorations = newDecorations.update({
            add: [dec.range(from, to)],
          });
          return false;
        }
      });
      if (!found) {
        newDecorations = newDecorations.update({
          add: [
            Decoration.replace({
              widget: new Widget(isCompletion, match, context, state),
            }).range(from, to),
          ],
        });
      }
    }
  }
  return newDecorations;
}

interface Range {
  from: number;
  to: number;
}

/**
 * Splits a range into subranges that do not cover a given list of blocks.
 * @param from Start of the original range.
 * @param to End of the original range.
 * @param blocks A sorted list of blocks to exclude from the range.
 */
function removeBlocksFromRange(
  from: number,
  to: number,
  blocks: CodeBlock[],
  includeBraces: boolean = true
): Range[] {
  const rangeModifier = includeBraces ? 1 : 0;
  let ranges: Range[] = [];
  for (const block of blocks) {
    if (block.node.from !== from) {
      ranges.push({ from, to: block.node.from + rangeModifier });
    }
    from = block.node.to - rangeModifier;
  }
  if (from !== to) {
    ranges.push({ from, to });
  }
  return ranges;
}
