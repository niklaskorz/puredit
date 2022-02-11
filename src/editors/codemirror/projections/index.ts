import { getIndentation, syntaxTree } from "@codemirror/language";
import {
  ChangeSpec,
  EditorSelection,
  EditorState,
  StateField,
} from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { zip } from "../../../shared/utils";
import {
  createPatternMap,
  findPatterns,
  Match,
  PatternNode,
  Context,
} from "../../../parsers/lezer";
import { flexPlugin } from "./flex";
import { ProjectionWidget, ProjectionWidgetClass } from "./projection";
import {
  autocompletion,
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import * as changeProjection from "./changeProjection";
import * as replaceProjection from "./replaceProjection";
import * as trimProjection from "./trimProjection";
import { completionSource as typescriptCompletionSource } from "../extensions/typescript";
import type { CodeBlock, ContextRange } from "src/parsers/lezer/types";

const globalContext: Context = {
  db: "db",
};

interface ProjectionState {
  decorations: DecorationSet;
  contextRanges: ContextRange[];
}

const projectionState = StateField.define<ProjectionState>({
  create(state) {
    let tree = syntaxTree(state);
    let { matches, contextRanges } = findPatterns(
      patternMap,
      tree.cursor(),
      state.doc,
      globalContext
    );
    let decorations = updateProjections(Decoration.none, false, state, matches);
    return { decorations, contextRanges };
  },
  update({ decorations }, transaction) {
    decorations = decorations.map(transaction.changes);
    let state = transaction.state;
    let tree = syntaxTree(state);
    let { matches, contextRanges } = findPatterns(
      patternMap,
      tree.cursor(),
      state.doc,
      globalContext
    );
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

    return { decorations, contextRanges };
  },
  provide: (f) => EditorView.decorations.from(f, (state) => state.decorations),
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
                  (block) =>
                    block.node.from <= innerFrom && block.node.to >= innerTo
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
              (block) =>
                block.node.from <= innerFrom && block.node.to >= innerTo
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

const changeFilter = EditorState.transactionFilter.of((tr) => {
  const { decorations } = tr.startState.field(projectionState);
  const changes: ChangeSpec[] = [];
  let modified = false;
  tr.changes.iterChanges((from, to, _fromB, _toB, insert) => {
    let inProjectionRange = false;
    decorations.between(from, to, (fromDec, toDec) => {
      if (toDec > from && fromDec < to) {
        inProjectionRange = true;
        modified = true;
        return false;
      }
    });
    if (!inProjectionRange) {
      changes.push({ from, to, insert });
    }
  }, true);
  let selection = tr.selection;
  if (selection?.ranges.length === 1 && selection.main.empty) {
    let pos = selection.main.anchor;
    let assoc = selection.main.assoc;
    // Find decorations that _contain_ the cursor (hence the +/- 1),
    // not only touch it
    decorations.between(pos + 1, pos - 1, (fromDec, toDec, dec) => {
      let widget = dec.spec.widget;
      if (!(widget instanceof ProjectionWidget)) {
        return;
      }
      // Cursor entering from left
      if (assoc === -1 && pos === fromDec + 1) {
        if (widget.enterFromStart()) {
          selection = undefined;
        } else {
          selection = EditorSelection.single(toDec);
        }
        modified = true;
        return false;
      }
      // Cursor entering from right
      if (assoc === 1 && pos === toDec - 1) {
        if (widget.enterFromEnd()) {
          selection = undefined;
        } else {
          selection = EditorSelection.single(fromDec);
        }
        modified = true;
        return false;
      }
    });
  }
  if (!modified) {
    return tr;
  }
  return {
    changes,
    selection,
    effects: tr.effects,
    scrollIntoView: tr.scrollIntoView,
  };
});

function completions(
  completionContext: CompletionContext
): CompletionResult | null {
  let word = completionContext.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !completionContext.explicit)) {
    return null;
  }

  const indentation = getIndentation(completionContext.state, word.from) || 0;

  const { contextRanges } = completionContext.state.field(projectionState);
  let context: Context = { ...globalContext };
  for (const contextRange of contextRanges) {
    if (contextRange.from <= word.from && contextRange.to >= word.to) {
      Object.assign(context, contextRange.context);
    }
  }

  let options: Completion[] = [];
  if (context.hasOwnProperty("db")) {
    options.push({
      label: "change table",
      type: "projection",
      detail: "projection",
      boost: 1,
      info: "Applies changes to the specified table of the database",
      apply: changeProjection
        .draft(context)
        .split("\n")
        .join("\n" + " ".repeat(indentation)),
    });
  }
  if (context.hasOwnProperty("table")) {
    options.push(
      {
        label: "replace text in column",
        type: "projection",
        detail: "projection",
        boost: 1,
        info: "Replaces all occurences of a text in a column",
        apply: replaceProjection
          .draft(context)
          .split("\n")
          .join("\n" + " ".repeat(indentation)),
      },
      {
        label: "trim column",
        type: "projection",
        detail: "projection",
        boost: 1,
        info: "Remove whitespace on the given sides of a column",
        apply: trimProjection
          .draft(context)
          .split("\n")
          .join("\n" + " ".repeat(indentation)),
      }
    );
  }

  return {
    from: word.from,
    options,
  };
}

export const projectionPlugin = [
  projectionState.extension,
  changeFilter,
  //flexPlugin,
  autocompletion({
    activateOnTyping: true,
    override: [completions, typescriptCompletionSource],
  }),
];
