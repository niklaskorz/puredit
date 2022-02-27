import type { TreeCursor } from "web-tree-sitter";
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
import type { Context } from ".";

function matchPattern(
  pattern: PatternNode,
  cursor: TreeCursor,
  context: Context,
  args: ArgMap,
  blocks: CodeBlock[]
): boolean {
  const fieldName = cursor.currentFieldName() || undefined;
  if (fieldName !== pattern.fieldName) {
    return false;
  }
  if (pattern.arg) {
    args[pattern.arg.name] = cursor.currentNode();
    return true;
  }
  if (pattern.block) {
    blocks.push({
      node: cursor.currentNode(),
      context: pattern.block.context,
    });
    return cursor.nodeType === "statement_block"; // "block" in python
  }
  if (
    pattern.contextVariable &&
    Object.prototype.hasOwnProperty.call(context, pattern.contextVariable.name)
  ) {
    return (
      cursor.nodeType === "identifier" &&
      cursor.nodeText === context[pattern.contextVariable.name]
    );
  }
  if (cursor.nodeType !== pattern.type) {
    return false;
  }
  if (pattern.text) {
    return pattern.text === cursor.nodeText;
  }
  if (!pattern.children || !cursor.gotoFirstChild()) {
    return false;
  }
  const length = pattern.children.length;
  if (!skipKeywords(cursor)) {
    return false;
  }
  for (let i = 0; i < length; ) {
    if (!matchPattern(pattern.children[i], cursor, context, args, blocks)) {
      return false;
    }
    i += 1;
    const hasSibling = cursor.gotoNextSibling() && skipKeywords(cursor);
    if ((i < length && !hasSibling) || (i >= length && hasSibling)) {
      return false;
    }
  }
  cursor.gotoParent();
  return true;
}

export function findPatterns(
  patternMap: PatternMap,
  cursor: TreeCursor,
  context: Context = {},
  to = Infinity
): FindPatternsResult {
  let matches: Match[] = [];
  let contextRanges: ContextRange[] = [];
  do {
    if (patternMap[cursor.nodeType]) {
      const patterns = patternMap[cursor.nodeType];
      let foundPattern = false;
      for (const pattern of patterns) {
        const args: ArgMap = {};
        const blocks: CodeBlock[] = [];
        if (
          matchPattern(
            pattern,
            cursor.currentNode().walk(),
            context,
            args,
            blocks
          )
        ) {
          matches.push({
            pattern,
            node: cursor.currentNode(),
            args,
            blocks,
          });
          for (const block of blocks) {
            contextRanges.push({
              from: block.node.startIndex,
              to: block.node.endIndex,
              context: block.context,
            });
            const result = findPatterns(
              patternMap,
              block.node.walk(),
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
    if (cursor.gotoFirstChild()) {
      const result = findPatterns(patternMap, cursor, context, to);
      matches = matches.concat(result.matches);
      contextRanges = contextRanges.concat(result.contextRanges);
      cursor.gotoParent();
    }
  } while (cursor.gotoNextSibling() && cursor.startIndex < to);
  return { matches, contextRanges };
}
