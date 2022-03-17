import { EditorState, StateField } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";
import type { DecorationSet } from "@codemirror/view";
import { zip } from "@puredit/utils";
import { createPatternMap, findPatterns } from "@puredit/parser";
import type { PatternNode, Match } from "@puredit/parser";
import { pickedCompletion } from "@codemirror/autocomplete";
import type {
  CodeBlock,
  ContextRange,
  PatternMap,
} from "@puredit/parser/types";
import type { Projection, ProjectionPluginConfig } from "./types";

export interface ProjectionState {
  config: ProjectionPluginConfig;
  patternMap: PatternMap;
  decorations: DecorationSet;
  contextRanges: ContextRange[];
}

export function createProjectionState(
  state: EditorState,
  config: ProjectionPluginConfig
): ProjectionState {
  const patternMap = createPatternMap(config.projections.map((p) => p.pattern));
  const cursor = config.parser.parse(state.sliceDoc(0)).walk();
  const { matches, contextRanges } = findPatterns(
    patternMap,
    cursor,
    config.globalContextVariables
  );
  const decorations = updateProjections(
    config,
    Decoration.none,
    false,
    state,
    matches
  );
  return { config, patternMap, decorations, contextRanges };
}

export const projectionState = StateField.define<ProjectionState>({
  create() {
    throw new Error("projectionState must be created through init()");
  },
  update({ config, patternMap, decorations }, transaction) {
    const isCompletion = Boolean(transaction.annotation(pickedCompletion));
    decorations = decorations.map(transaction.changes);
    const state = transaction.state;
    // TODO: reuse previous tree for incremental parsing
    const cursor = config.parser.parse(state.sliceDoc(0)).walk();
    const { matches, contextRanges } = findPatterns(
      patternMap,
      cursor,
      config.globalContextVariables
    );
    decorations = updateProjections(
      config,
      decorations,
      isCompletion,
      state,
      matches
    );

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

    return { config, patternMap, decorations, contextRanges };
  },
  provide: (f) => EditorView.decorations.from(f, (state) => state.decorations),
});

function updateProjections(
  config: ProjectionPluginConfig,
  decorations: DecorationSet,
  isCompletion: boolean,
  state: EditorState,
  matches: Match[]
): DecorationSet {
  const projectionMap = new Map<PatternNode, Projection>(
    config.projections.map((p) => [p.pattern, p])
  );
  let newDecorations = Decoration.none;
  const contexts: object[] = [config.globalContextValues];
  const contextBounds: number[] = [];
  for (const match of matches) {
    if (
      contextBounds.length &&
      match.node.startIndex >= contextBounds[contextBounds.length - 1]
    ) {
      contexts.pop();
      contextBounds.pop();
    }
    const projection = projectionMap.get(match.pattern);
    if (!projection) {
      continue;
    }
    const { widgets, contextProvider } = projection;
    const context = Object.assign({}, ...contexts);
    if (contextProvider) {
      contexts.push(
        contextProvider(match, state.doc, Object.assign({}, context))
      );
      contextBounds.push(match.node.endIndex);
    }
    const ranges = removeBlocksFromRange(
      match.node.startIndex,
      match.node.endIndex,
      match.blocks
    );
    for (const [{ from, to }, Widget] of zip(ranges, widgets)) {
      let found = false;
      decorations.between(from, to, (a, b, dec) => {
        const widget = dec.spec.widget;
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
  blocks: CodeBlock[]
): Range[] {
  const ranges: Range[] = [];
  for (const block of blocks) {
    if (block.from !== from) {
      ranges.push({ from, to: block.from });
    }
    from = block.to;
  }
  if (from < to) {
    ranges.push({ from, to });
  }
  return ranges;
}
