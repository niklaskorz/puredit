import { getIndentation, syntaxTree } from "@codemirror/language";
import { EditorState, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  PluginField,
  PluginValue,
  ViewPlugin,
} from "@codemirror/view";
import { zip } from "../../../shared/utils";
import {
  createPatternMap,
  findPatterns,
  Match,
  PatternNode,
  SyntaxNode,
} from "../../../parsers/lezer";
import { flexPlugin } from "./flex";
import type { ProjectionWidgetClass } from "./projection";
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import * as changeProjection from "./changeProjection";
import * as replaceProjection from "./replaceProjection";
import * as trimProjection from "./trimProjection";
import { svelteProjection } from "./svelte";

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
    decorations = updateProjections(decorations, true, state, matches);

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

let patternMap = createPatternMap(
  changeProjection.pattern,
  replaceProjection.pattern,
  trimProjection.pattern
);
let projections = new Map<PatternNode, Array<ProjectionWidgetClass<Match>>>([
  [changeProjection.pattern, [changeProjection.widget, changeProjection.end]],
  [replaceProjection.pattern, [replaceProjection.widget]],
  [trimProjection.pattern, [trimProjection.widget]],
]);

function updateProjections(
  decorations: DecorationSet,
  isUpdate: boolean,
  state: EditorState,
  matches: Match[]
): DecorationSet {
  for (const match of matches) {
    const widgets = projections.get(match.pattern);
    if (!widgets) {
      //console.warn("No projection found for pattern", match.pattern);
      continue;
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
  }
  return decorations;
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
  blocks: SyntaxNode[],
  includeBraces: boolean = true
): Range[] {
  const rangeModifier = includeBraces ? 1 : 0;
  let ranges: Range[] = [];
  for (const block of blocks) {
    if (block.from !== from) {
      ranges.push({ from, to: block.from + rangeModifier });
    }
    from = block.to - rangeModifier;
  }
  if (from !== to) {
    ranges.push({ from, to });
  }
  return ranges;
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

function completions(context: CompletionContext): CompletionResult | null {
  let word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }
  const indentation = getIndentation(context.state, word.from) || 0;
  return {
    from: word.from,
    options: [
      {
        label: "change table",
        type: "function",
        apply: changeProjection.draft
          .split("\n")
          .join("\n" + " ".repeat(indentation)),
      },
      {
        label: "replace string in column",
        type: "function",
        apply: replaceProjection.draft
          .split("\n")
          .join("\n" + " ".repeat(indentation)),
      },
      {
        label: "trim column",
        type: "function",
        apply: trimProjection.draft
          .split("\n")
          .join("\n" + " ".repeat(indentation)),
      },
    ],
  };
}

export const projectionPlugin = [
  projectionState.extension,
  projectionRangePlugin,
  flexPlugin,
  autocompletion({ override: [completions] }),
];
