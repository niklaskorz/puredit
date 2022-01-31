import type { TreeCursor } from "@lezer/common";
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
  setRoot(root, root);
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

export function expressionPattern(
  template: TemplateStringsArray,
  ...params: string[]
) {
  const raw = String.raw(template, ...params);
  return parsePattern(raw, true);
}

export function debug(pattern: string): string {
  return patternToString(parsePattern(pattern));
}

export function findPattern(
  patternMap: PatternMap,
  cursor: TreeCursor,
  code: string,
  temporaryPatternMap?: PatternMap
): PatternNode | undefined {
  do {
    const childrenPatternMap: PatternMap = {};
    if (temporaryPatternMap && temporaryPatternMap[cursor.name]) {
      const patterns = temporaryPatternMap[cursor.name];
      for (const pattern of patterns) {
        if (pattern.children) {
          for (const child of pattern.children) {
            if (childrenPatternMap[child.type]) {
              childrenPatternMap[child.type].push(child);
            } else {
              childrenPatternMap[child.type] = [child];
            }
          }
        } else if (
          pattern.text &&
          code.slice(cursor.from, cursor.to) === pattern.text
        ) {
          return pattern.root;
        }
      }
    }
    if (patternMap[cursor.name]) {
      const patterns = patternMap[cursor.name];
      for (const pattern of patterns) {
        if (pattern.children) {
          for (const child of pattern.children) {
            if (childrenPatternMap[child.type]) {
              childrenPatternMap[child.type].push(child);
            } else {
              childrenPatternMap[child.type] = [child];
            }
          }
        } else if (
          pattern.text &&
          code.slice(cursor.from, cursor.to) === pattern.text
        ) {
          return pattern.root;
        }
      }
    }
    if (cursor.firstChild()) {
      const pattern = findPattern(patternMap, cursor, code, childrenPatternMap);
      if (pattern) {
        return pattern;
      }
      cursor.parent();
    }
  } while (cursor.nextSibling());
}
