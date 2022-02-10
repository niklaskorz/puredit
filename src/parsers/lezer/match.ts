import type { SyntaxNode, TreeCursor } from "@lezer/common";
import { skipKeywords } from "./shared";
import type {
  ArgMap,
  CodeBlock,
  ContextRange,
  FindPatternsResult,
  Match,
  PatternMap,
  PatternNode,
} from "./types";
import type { Text } from "@codemirror/text";
import type { Context } from ".";

function matchPattern(
  pattern: PatternNode,
  cursor: TreeCursor,
  text: Text,
  context: Context,
  args: ArgMap,
  blocks: CodeBlock[]
): boolean {
  if (pattern.arg) {
    args[pattern.arg.name] = cursor.node;
    return true;
  }
  if (pattern.block) {
    blocks.push({
      node: cursor.node,
      context: pattern.block.context,
    });
    return cursor.name === "Block";
  }
  if (
    pattern.contextVariable &&
    context.hasOwnProperty(pattern.contextVariable.name)
  ) {
    let textSlice = text.sliceString(cursor.from, cursor.to);
    return (
      cursor.name === "VariableName" &&
      textSlice === context[pattern.contextVariable.name]
    );
  }
  if (cursor.name !== pattern.type) {
    return false;
  }
  if (pattern.text) {
    let textSlice = text.sliceString(cursor.from, cursor.to);
    return pattern.text === textSlice;
  }
  if (!pattern.children || !cursor.firstChild()) {
    return false;
  }
  const length = pattern.children.length;
  if (!skipKeywords(cursor)) {
    return false;
  }
  for (let i = 0; i < length; ) {
    if (
      !matchPattern(pattern.children[i], cursor, text, context, args, blocks)
    ) {
      return false;
    }
    i += 1;
    const hasSibling = cursor.nextSibling() && skipKeywords(cursor);
    if ((i < length && !hasSibling) || (i >= length && hasSibling)) {
      return false;
    }
  }
  cursor.parent();
  return true;
}

export function findPatterns(
  patternMap: PatternMap,
  cursor: TreeCursor,
  text: Text,
  context: Context = {},
  to: number = Infinity
): FindPatternsResult {
  let matches: Match[] = [];
  let contextRanges: ContextRange[] = [];
  do {
    if (patternMap[cursor.name]) {
      const patterns = patternMap[cursor.name];
      let foundPattern = false;
      for (const pattern of patterns) {
        const args: ArgMap = {};
        const blocks: CodeBlock[] = [];
        if (
          matchPattern(pattern, cursor.node.cursor, text, context, args, blocks)
        ) {
          matches.push({
            pattern,
            node: cursor.node,
            args,
            blocks,
          });
          for (const block of blocks) {
            contextRanges.push({
              from: block.node.from,
              to: block.node.to,
              context: block.context,
            });
            const result = findPatterns(
              patternMap,
              block.node.cursor,
              text,
              Object.assign({}, context, block.context),
              to
            );
            matches = matches.concat(result.matches);
            contextRanges = contextRanges.concat(result.contextRanges);
          }
          foundPattern = true;
          break;
        }
      }
      if (foundPattern) {
        continue;
      }
    }
    if (cursor.firstChild()) {
      const result = findPatterns(patternMap, cursor, text, context, to);
      matches = matches.concat(result.matches);
      contextRanges = contextRanges.concat(result.contextRanges);
      cursor.parent();
    }
  } while (cursor.nextSibling() && cursor.from < to);
  return { matches, contextRanges };
}
