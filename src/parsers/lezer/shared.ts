import type { TreeCursor } from "@lezer/common";

export function skipKeywords(cursor: TreeCursor): boolean {
  while (isKeyword(cursor.name)) {
    if (!cursor.nextSibling()) {
      return false;
    }
  }
  return true;
}

export function isKeyword(name: string): boolean {
  // Keywords start with a lowercase letter or a special character.
  // As the lower case version of a special character is the character itself,
  // we only have to check for lower case.
  const firstLetter = name[0];
  return firstLetter.toLowerCase() === firstLetter;
}
