import type { TreeCursor } from "web-tree-sitter";

export function selectDeepChild(cursor: TreeCursor, path: number[]): boolean {
  let first = true;
  for (const index of path) {
    if (!first && !cursor.gotoFirstChild()) {
      return false;
    }
    for (let i = 0; i < index; i++) {
      if (!cursor.gotoNextSibling()) {
        return false;
      }
    }
    first = false;
  }
  return true;
}
