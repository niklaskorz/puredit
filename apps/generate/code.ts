import type { Tree, TreeCursor } from "web-tree-sitter";
import { PatternCursor, PatternNode } from "./pattern";

type Path = number[];
type Variables = Path[];

export function scanCode(samples: Tree[]) {
  let variables: Variables = [];
  let nodes: PatternNode[] = [];
  let cursor = samples[0].walk();
  for (let i = 1; i < samples.length; i++) {
    [nodes, variables] = compareNodes(cursor, samples[i].walk());
    cursor = new PatternCursor(nodes[0]);
  }
  return { pattern: nodes[0], variables };
}

function compareNodes(
  a: TreeCursor,
  b: TreeCursor,
  path: Path = []
): [PatternNode[], Variables] | null {
  const nodes: PatternNode[] = [];
  let variables: Variables = [];

  let hasSibling = true;
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
        variables.push(path.concat(index));
        nodes.push({
          variable: true,
          fieldName: fieldNameA,
          type: a.nodeType,
        });
      } else if (hasChildrenA && hasChildrenB) {
        const result = compareNodes(a, b, path.concat(index));
        a.gotoParent();
        b.gotoParent();
        if (result) {
          const [children, childVariables] = result;
          variables = variables.concat(childVariables);
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

    const hasSiblingA = a.gotoNextSibling();
    const hasSiblingB = b.gotoNextSibling();
    if (hasSiblingA !== hasSiblingB) {
      // mismatch (parent)
      return null;
    }
    hasSibling = hasSiblingA && hasSiblingB;
  }
  return [nodes, variables];
}

function gotoFirstChild(cursor: TreeCursor): boolean {
  if (cursor.nodeType === "string") {
    return false;
  }
  return cursor.gotoFirstChild();
}
