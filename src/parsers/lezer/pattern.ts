import type { Tree, TreeCursor } from "@lezer/common";
import { parser } from "./parser";

export interface PatternNode {
  type: string;
  children?: PatternNode[];
  text?: string;
  root?: PatternNode;
}

export type PatternMap = Record<string, PatternNode[]>;

export function parsePattern(code: string, isExpression = false): PatternNode {
  const cursor = parser.parse(code).cursor();
  if (isExpression) {
    goToExpression(cursor);
  }
  const root = visitNode(cursor, code)[0];
  return root;
}

function goToExpression(cursor: TreeCursor) {
  do {
    if (cursor.name === "ExpressionStatement") {
      cursor.firstChild();
      return;
    }
  } while (cursor.next());
}

export function patternToString(node: PatternNode, indent = ""): string {
  let out = indent + node.type;
  if (node.children) {
    out +=
      " {\n" +
      node.children
        .map((child) => patternToString(child, indent + "  "))
        .join("") +
      indent +
      "}\n";
  } else if (node.text) {
    out += " " + JSON.stringify(node.text) + "\n";
  }
  return out;
}

function visitNode(cursor: TreeCursor, code: string): PatternNode[] {
  let nodes = [];
  do {
    // Skip keywords
    if (isKeyword(cursor.name)) {
      continue;
    }
    let node: PatternNode = {
      type: cursor.name,
    };
    if (cursor.firstChild()) {
      node.children = visitNode(cursor, code);
      cursor.parent();
    } else {
      node.text = code.slice(cursor.from, cursor.to);
    }
    nodes.push(node);
  } while (cursor.nextSibling());
  return nodes;
}

function setRoot(node: PatternNode, root: PatternNode) {
  node.root = root;
  node.children?.forEach((child) => setRoot(child, root));
}

function isKeyword(name: string): boolean {
  // Keywords start with a lowercase letter or a special character.
  // As the lower case version of a special character is the character itself,
  // we only have to check for lower case.
  const firstLetter = name[0];
  return firstLetter.toLowerCase() === firstLetter;
}

function skipKeywords(cursor: TreeCursor): boolean {
  while (isKeyword(cursor.name)) {
    console.debug("skipping keyword", cursor.name);
    if (!cursor.nextSibling()) {
      return false;
    }
  }
  return true;
}

export function expressionPattern(
  template: TemplateStringsArray,
  ...params: string[]
) {
  const raw = String.raw(template, ...params);
  return parsePattern(raw, true);
}

export function debug(pattern: string, isExpression = false): string {
  return patternToString(parsePattern(pattern, isExpression));
}

function matchPattern(
  pattern: PatternNode,
  cursor: TreeCursor,
  code: string
): boolean {
  if (cursor.name !== pattern.type) {
    console.debug(
      "node type mismatch",
      pattern.type,
      cursor.name,
      code.slice(cursor.from, cursor.to)
    );
    return false;
  }
  if (pattern.text) {
    let text = code.slice(cursor.from, cursor.to);
    let match = pattern.text === text;
    if (!match) {
      console.debug("node text mismatch", pattern.text, text);
    }
    return match;
  }
  if (!pattern.children || !cursor.firstChild()) {
    console.debug("no children at", cursor.name);
    return false;
  }
  const length = pattern.children.length;
  if (!skipKeywords(cursor)) {
    console.debug("no nodes after keywords");
    return false;
  }
  for (let i = 0; i < length; ) {
    if (!matchPattern(pattern.children[i], cursor, code)) {
      return false;
    }
    i += 1;
    const hasSibling = cursor.nextSibling() && skipKeywords(cursor);
    if ((i < length && !hasSibling) || (i >= length && hasSibling)) {
      console.debug(
        "sibling count mismatch",
        i + 1,
        length,
        hasSibling,
        cursor.name
      );
      return false;
    }
  }
  cursor.parent();
  return true;
}

export function findPattern(
  patternMap: PatternMap,
  cursor: TreeCursor,
  code: string
): PatternNode | undefined {
  console.groupCollapsed("findPattern");
  do {
    if (!patternMap[cursor.name]) {
      continue;
    }
    const patterns = patternMap[cursor.name];
    for (const pattern of patterns) {
      console.debug("testing", pattern, code.slice(cursor.from, cursor.to));
      if (matchPattern(pattern, cursor.node.cursor, code)) {
        return pattern;
      } else {
        console.debug("no match");
      }
    }
  } while (cursor.next());
  console.groupEnd();
}
