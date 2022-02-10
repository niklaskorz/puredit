import type { TreeCursor } from "@lezer/common";
import type { TemplateBlock } from ".";
import { parser } from "./parser";
import { isErrorToken, isKeyword } from "./shared";
import type {
  PatternMap,
  PatternNode,
  TemplateArg,
  TemplateContextVariable,
} from "./types";

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
  blocks: TemplateBlock[] = [],
  contextVariables: TemplateContextVariable[] = [],
  isExpression = false
): PatternNode {
  const cursor = parser.parse(code).cursor();
  if (isExpression) {
    goToExpression(cursor);
  }
  const root = visitNode(cursor, code, args, blocks, contextVariables)[0];
  if (root.type === "Script" && root.children) {
    return root.children[0];
  }
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

export function visitNode(
  cursor: TreeCursor,
  code: string,
  args: TemplateArg[],
  blocks: TemplateBlock[],
  contextVariables: TemplateContextVariable[]
): PatternNode[] {
  let nodes = [];
  do {
    if (isErrorToken(cursor.name)) {
      throw new Error(`error in pattern ast at position ${cursor.from}`);
    }
    // Skip keywords
    if (isKeyword(cursor.name)) {
      continue;
    }
    let node: PatternNode = {
      type: cursor.name,
    };
    if (cursor.firstChild()) {
      node.children = visitNode(cursor, code, args, blocks, contextVariables);
      if (
        node.type === "ExpressionStatement" &&
        node.children[0].type === "TemplateBlock"
      ) {
        node = node.children[0];
      }
      cursor.parent();
    } else {
      node.text = code.slice(cursor.from, cursor.to);
      if (node.text.startsWith("__template_arg_")) {
        let index = parseInt(node.text.slice("__template_arg_".length));
        node.arg = args[index];
        node.type = "TemplateArg";
      } else if (node.text.startsWith("__template_block_")) {
        let index = parseInt(node.text.slice("__template_block_".length));
        node.block = blocks[index];
        node.type = "TemplateBlock";
      } else if (node.text.startsWith("__template_context_variable_")) {
        let index = parseInt(
          node.text.slice("__template_context_variable_".length)
        );
        node.contextVariable = contextVariables[index];
        node.type = "TemplateContextVariable";
      }
    }
    nodes.push(node);
  } while (cursor.nextSibling());
  return nodes;
}
