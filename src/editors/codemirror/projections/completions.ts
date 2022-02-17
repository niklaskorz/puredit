import { getIndentation } from "@codemirror/language";
import {
  Completion,
  CompletionContext,
  CompletionResult,
  pickedCompletion,
} from "@codemirror/autocomplete";
import * as changeProjection from "./changeProjection";
import * as replaceProjection from "./replaceProjection";
import * as trimProjection from "./trimProjection";
import { globalContextVariables } from "./context";
import type { Context } from "src/parsers/lezer";
import { projectionState } from "./state";

export function completions(
  completionContext: CompletionContext
): CompletionResult | null {
  let word = completionContext.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !completionContext.explicit)) {
    return null;
  }

  const indentation = getIndentation(completionContext.state, word.from) || 0;

  const { contextRanges } = completionContext.state.field(projectionState);
  let context: Context = { ...globalContextVariables };
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
      apply: (view, completion, from, to) => {
        view.dispatch({
          changes: {
            from,
            to,
            insert: changeProjection
              .draft(context)
              .split("\n")
              .join("\n" + " ".repeat(indentation)),
          },
          annotations: pickedCompletion.of(completion),
        });
      },
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
        apply: (view, completion, from, to) => {
          view.dispatch({
            changes: {
              from,
              to,
              insert: replaceProjection
                .draft(context)
                .split("\n")
                .join("\n" + " ".repeat(indentation)),
            },
            annotations: pickedCompletion.of(completion),
          });
        },
      },
      {
        label: "trim column",
        type: "projection",
        detail: "projection",
        boost: 1,
        info: "Remove whitespace on the given sides of a column",
        apply: (view, completion, from, to) => {
          view.dispatch({
            changes: {
              from,
              to,
              insert: trimProjection
                .draft(context)
                .split("\n")
                .join("\n" + " ".repeat(indentation)),
            },
            annotations: pickedCompletion.of(completion),
          });
        },
      }
    );
  }

  return {
    from: word.from,
    options,
  };
}
