import type { TreeCursor } from "web-tree-sitter";

export function skipKeywords(cursor: TreeCursor): boolean {
  while (isKeyword(cursor)) {
    if (!cursor.gotoNextSibling()) {
      return false;
    }
  }
  return true;
}

export function isKeyword(cursor: TreeCursor): boolean {
  return !cursor.nodeIsNamed;
}

export function isErrorToken(name: string): boolean {
  return name === "ERROR";
}
