import type { Tree, TreeCursor } from "web-tree-sitter";
import { PatternCursor, PatternNode } from "./pattern";

export function scanCode(samples: Tree[]) {
  let variables: number[][] = [];
  let result = samples[0].walk();
  for (let i = 1; i < samples.length; i++) {
    variables = [];
    result = new PatternCursor(
      compareNodes(result, samples[i].walk(), variables)[0]
    );
  }
  return { pattern: result.currentNode(), variables };
}

function compareNodes(
  a: TreeCursor,
  b: TreeCursor,
  variables: number[][],
  path: number[] = []
): PatternNode[] | null {
  const nodes: PatternNode[] = [];

  const hasSiblingA = skipKeywords(a);
  const hasSiblingB = skipKeywords(b);
  if (hasSiblingA !== hasSiblingB) {
    // mismatch (parent)
    return null;
  }
  let hasSibling = hasSiblingA && hasSiblingB;

  for (let index = 0; hasSibling; index++) {
    const fieldNameA = a.currentFieldName() || undefined;
    const fieldNameB = b.currentFieldName() || undefined;
    if (fieldNameA !== fieldNameB) {
      // mismatch (parent)
      return null;
    }
    if (a.nodeType !== b.nodeType) {
      if (!a.nodeIsNamed || !b.nodeIsNamed) {
        // keywords cannot be variable
        // mismatch (parent)
        return null;
      }
      // mismatch (current, wildcard)
      variables.push(path.concat(index));
      nodes.push({
        variable: true,
        type: "*",
        fieldName: fieldNameA,
      });
    } else {
      const hasChildrenA = gotoFirstChild(a);
      const hasChildrenB = gotoFirstChild(b);
      if (hasChildrenA !== hasChildrenB) {
        // mismatch (current, same node type)
        if (hasChildrenA) {
          a.gotoParent();
        }
        if (hasChildrenB) {
          b.gotoParent();
        }
        nodes.push({
          variable: true,
          fieldName: fieldNameA,
          type: a.nodeType,
        });
      } else if (hasChildrenA && hasChildrenB) {
        const children = compareNodes(a, b, variables, path.concat(index));
        a.gotoParent();
        b.gotoParent();
        if (children) {
          nodes.push({
            fieldName: fieldNameA,
            type: a.nodeType,
            children,
          });
        } else {
          // mismatch (current, same node type)
          variables.push(path.concat(index));
          nodes.push({
            variable: true,
            fieldName: fieldNameA,
            type: a.nodeType,
          });
        }
      } else if (a.nodeText !== b.nodeText) {
        // mismatch (current, same node type)
        variables.push(path.concat(index));
        nodes.push({
          variable: true,
          fieldName: fieldNameA,
          type: a.nodeType,
        });
      } else {
        nodes.push({
          fieldName: fieldNameA,
          type: a.nodeType,
          text: a.nodeText,
        });
      }
    }

    const hasSiblingA = a.gotoNextSibling() && skipKeywords(a);
    const hasSiblingB = b.gotoNextSibling() && skipKeywords(b);
    if (hasSiblingA !== hasSiblingB) {
      // mismatch (parent)
      return null;
    }
    hasSibling = hasSiblingA && hasSiblingB;
  }
  return nodes;
}

function gotoFirstChild(cursor: TreeCursor): boolean {
  if (cursor.nodeType === "string") {
    return false;
  }
  return cursor.gotoFirstChild();
}

function skipKeywords(cursor: TreeCursor): boolean {
  return true;

  while (!cursor.nodeIsNamed) {
    if (!cursor.gotoNextSibling()) {
      return false;
    }
  }
  return true;
}
