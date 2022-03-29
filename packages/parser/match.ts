import type { TreeCursor } from "web-tree-sitter";
import { isErrorToken, Keyword } from "./shared";
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
  blocks: CodeBlock[],
  lastSiblingKeyword?: Keyword
): boolean {
  if (isErrorToken(cursor.nodeType)) {
    return false;
  }
  const fieldName = cursor.currentFieldName() || undefined;
  if (fieldName !== pattern.fieldName) {
    return false;
  }
  if (pattern.arg) {
    args[pattern.arg.name] = cursor.currentNode();
    return true;
  }
  if (pattern.block) {
    let from = cursor.startIndex;
    if (pattern.block.blockType === "py" && lastSiblingKeyword?.type === ":") {
      from = lastSiblingKeyword.pos;
    }
    const rangeModifierStart = 1;
    const rangeModifierEnd = pattern.block.blockType === "ts" ? 1 : 0;
    blocks.push({
      node: cursor.currentNode(),
      context: pattern.block.context,
      from: from + rangeModifierStart,
      to: cursor.endIndex - rangeModifierEnd,
      blockType: pattern.block.blockType,
    });
    switch (pattern.block.blockType) {
      case "ts":
        return cursor.nodeType === "statement_block";
      case "py":
        return cursor.nodeType === "block";
    }
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
  let [hasSibling, lastKeyword] = skipKeywords(cursor);
  if (!hasSibling) {
    return false;
  }
  for (let i = 0; i < length; ) {
    if (
      !matchPattern(
        pattern.children[i],
        cursor,
        context,
        args,
        blocks,
        lastKeyword
      )
    ) {
      return false;
    }
    i += 1;
    hasSibling = cursor.gotoNextSibling();
    if (hasSibling) {
      [hasSibling, lastKeyword] = skipKeywords(cursor);
    }
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
