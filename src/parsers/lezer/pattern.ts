import type { TreeCursor } from "@lezer/common";
import { parser } from "./parser";
import { isKeyword } from "./shared";
import type { PatternMap, PatternNode, TemplateArg } from "./types";

export function createPatternMap(...patterns: PatternNode[]): PatternMap {
  const patternMap: PatternMap = {};
  for (const pattern of patterns) {
    if (patternMap[pattern.type]) {
      patternMap[pattern.type].push(pattern);
    } else {
      patternMap[pattern.type] = [pattern];
    }
  }
  return patternMap;
}

export function parsePattern(
  code: string,
  args: TemplateArg[] = [],
  isExpression = false
): PatternNode {
  const cursor = parser.parse(code).cursor();
  if (isExpression) {
    goToExpression(cursor);
  }
  const root = visitNode(cursor, code, args)[0];
  if (root.type === "Script" && root.children) {
    return root.children[0];
  }
  return root;
}

function goToExpression(cursor: TreeCursor) {
  do {
    if (cursor.type.is("Expression")) {
      cursor.firstChild();
      return;
    }
  } while (cursor.next());
}

export function visitNode(
  cursor: TreeCursor,
  code: string,
  args: TemplateArg[] = []
): PatternNode[] {
  let nodes = [];
  do {
    if (cursor.type.isError) {
      //throw new Error(`error in pattern ast at position ${cursor.from}`);
    }
    let node: PatternNode = {
      type: cursor.name,
      isKeyword: isKeyword(cursor.name),
    };
    if (cursor.firstChild()) {
      node.children = visitNode(cursor, code, args);
      cursor.parent();
    } else if (!node.isKeyword) {
      node.text = code.slice(cursor.from, cursor.to);
      if (node.text.startsWith("__template_arg_")) {
        let argIndex = parseInt(node.text.slice("__template_arg_".length));
        node.arg = args[argIndex];
        node.type = "TemplateArg";
        node.text = `${node.arg.name}: ${node.arg.type}`;
      } else if (node.text.startsWith("__template_block")) {
        node.type = "TemplateBlock";
      }
    }
    nodes.push(node);
  } while (cursor.nextSibling());
  return nodes;
}
