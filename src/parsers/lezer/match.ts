import type { SyntaxNode, TreeCursor } from "@lezer/common";
import { skipKeywords } from "./shared";
import type { ArgMap, Match, PatternMap, PatternNode } from "./types";

function matchPattern(
  pattern: PatternNode,
  cursor: TreeCursor,
  code: string,
  args: ArgMap,
  blocks: SyntaxNode[]
): boolean {
  if (pattern.type === "TemplateBlock") {
    blocks.push(cursor.node);
    return cursor.name === "Block";
  }
  if (pattern.arg) {
    args[pattern.arg.name] = cursor.node;
    return true;
  }
  if (cursor.name !== pattern.type) {
    return false;
  }
  if (pattern.text) {
    let text = code.slice(cursor.from, cursor.to);
    return pattern.text === text;
  }
  if (!pattern.children || !cursor.firstChild()) {
    return false;
  }
  const length = pattern.children.length;
  if (!skipKeywords(cursor)) {
    return false;
  }
  for (let i = 0; i < length; ) {
    if (!matchPattern(pattern.children[i], cursor, code, args, blocks)) {
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
  code: string
): Match[] {
  let matches: Match[] = [];
  do {
    if (patternMap[cursor.name]) {
      const patterns = patternMap[cursor.name];
      let foundPattern = false;
      for (const pattern of patterns) {
        const args: ArgMap = {};
        const blocks: SyntaxNode[] = [];
        if (matchPattern(pattern, cursor.node.cursor, code, args, blocks)) {
          matches.push({
            pattern,
            node: cursor.node,
            args,
            blocks,
          });
          for (const block of blocks) {
            matches = matches.concat(
              findPatterns(patternMap, block.cursor, code)
            );
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
      matches = matches.concat(findPatterns(patternMap, cursor, code));
      cursor.parent();
    }
  } while (cursor.nextSibling());
  return matches;
}
