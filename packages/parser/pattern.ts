import type Parser from "web-tree-sitter";
import type { TreeCursor } from "web-tree-sitter";
import type { TemplateBlock } from ".";
import {
  isErrorToken,
  isKeyword,
  isTopNode,
  shouldTreatAsAtomicNode,
} from "./shared";
import type {
  PatternMap,
  PatternNode,
  TemplateArg,
  TemplateContextVariable,
} from "./types";

export function createPatternMap(patterns: PatternNode[]): PatternMap {
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
  parser: Parser,
  args: TemplateArg[] = [],
  blocks: TemplateBlock[] = [],
  contextVariables: TemplateContextVariable[] = [],
  isExpression = false
): PatternNode {
  const cursor = parser.parse(code).walk();
  if (isExpression) {
    goToExpression(cursor);
  }
  const root = visitNode(cursor, code, args, blocks, contextVariables)[0];
  if (isTopNode(root) && root.children) {
    return root.children[0];
  }
  return root;
}

function goToExpression(cursor: TreeCursor) {
  do {
    if (cursor.nodeType === "expression_statement") {
      cursor.gotoFirstChild();
      return;
    }
  } while (goToNextNode(cursor));
}

function goToNextNode(cursor: TreeCursor): boolean {
  return (
    cursor.gotoFirstChild() ||
    cursor.gotoNextSibling() ||
    (cursor.gotoParent() && cursor.gotoNextSibling())
  );
}

export function visitNode(
  cursor: TreeCursor,
  code: string,
  args: TemplateArg[],
  blocks: TemplateBlock[],
  contextVariables: TemplateContextVariable[]
): PatternNode[] {
  const nodes = [];
  do {
    if (isErrorToken(cursor.nodeType)) {
      throw new Error(
        `error in pattern ast at position ${cursor.startIndex}: ${cursor.nodeText}`
      );
    }
    // Skip keywords
    if (isKeyword(cursor)) {
      continue;
    }
    let node: PatternNode = {
      type: cursor.nodeType,
      fieldName: cursor.currentFieldName() || undefined,
    };
    if (!shouldTreatAsAtomicNode(cursor) && cursor.gotoFirstChild()) {
      node.children = visitNode(cursor, code, args, blocks, contextVariables);
      if (
        (node.type === "block" || node.type === "expression_statement") &&
        node.children[0].type === "TemplateBlock"
      ) {
        const fieldName = node.fieldName;
        node = node.children[0];
        node.fieldName = fieldName;
      }
      cursor.gotoParent();
    } else {
      node.text = cursor.nodeText;
      if (node.text.startsWith("__template_arg_")) {
        const index = parseInt(node.text.slice("__template_arg_".length));
        node.arg = args[index];
        node.type = "TemplateArg";
      } else if (node.text.startsWith("__template_block_")) {
        const index = parseInt(node.text.slice("__template_block_".length));
        node.block = blocks[index];
        node.type = "TemplateBlock";
      } else if (node.text.startsWith("__template_context_variable_")) {
        const index = parseInt(
          node.text.slice("__template_context_variable_".length)
        );
        node.contextVariable = contextVariables[index];
        node.type = "TemplateContextVariable";
      }
    }
    nodes.push(node);
  } while (cursor.gotoNextSibling());
  return nodes;
}
