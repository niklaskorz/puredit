import { getIndentation } from "@codemirror/language";
import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import * as changeProjection from "./changeProjection";
import * as replaceProjection from "./replaceProjection";
import * as trimProjection from "./trimProjection";
import { globalContext } from "./context";
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
