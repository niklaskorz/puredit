import type { TreeCursor } from "web-tree-sitter";
import type { PatternNode } from "./types";

export interface Keyword {
  type: string;
  pos: number;
}

export function skipKeywords(
  cursor: TreeCursor
): [boolean, Keyword | undefined] {
  let lastKeyword: Keyword | undefined;
  while (isKeyword(cursor)) {
    lastKeyword = {
      type: cursor.nodeType,
      pos: cursor.startIndex,
    };
    if (!cursor.gotoNextSibling()) {
      return [false, lastKeyword];
    }
  }
  return [true, lastKeyword];
}

export function isKeyword(cursor: TreeCursor): boolean {
  return !cursor.nodeIsNamed;
}

export function isErrorToken(name: string): boolean {
  return name === "ERROR";
}

export function isTopNode(node: PatternNode): boolean {
  return node.type === "program" || node.type === "module";
}

export function shouldTreatAsAtomicNode(cursor: TreeCursor): boolean {
  // String literals may have children, in particular escape sequences.
  // To keep it simple, we treat string literals as atomic nodes.
  return cursor.nodeType === "string";
}
