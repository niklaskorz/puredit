import type { TreeCursor, Point, SyntaxNode } from "web-tree-sitter";
import { Parser, Target } from "@puredit/parser";

const parser = await Parser.load(Target.TypeScript);

export function scanCode(samplesRaw: string[]) {
  const samples = samplesRaw.map((s) => parser.parse(s));
  let result = samples[0].walk();
  for (let i = 1; i < samples.length; i++) {
    result = new PatternCursor(compareNodes(result, samples[i].walk())[0]);
  }
  return result.currentNode();
}

interface PatternNode {
  variable?: true;
  wildcard?: true;
  fieldName: string | null;
  type: string;
  children?: PatternNode[];
  text?: string;
}

class PatternCursor implements TreeCursor {
  nodeTypeId = 0;
  nodeId = 0;
  nodeIsNamed = true;
  nodeIsMissing = false;
  startPosition: Point = { row: 0, column: 0 };
  endPosition: Point = { row: 0, column: 0 };
  startIndex = 0;
  endIndex = 0;

  private parents: PatternNode[] = [];
  private childIndex: number[] = [];
  constructor(private node: PatternNode) {}

  get nodeType(): string {
    return this.node.type;
  }
  get nodeText(): string {
    return this.node.text || "";
  }

  reset(node: SyntaxNode) {
    return;
  }
  delete(): void {
    return;
  }
  currentNode(): SyntaxNode {
    return this.node as any;
  }
  currentFieldId(): number {
    return 0;
  }
  currentFieldName(): string {
    return this.node.fieldName || "";
  }
  gotoParent(): boolean {
    if (this.parents.length) {
      this.node = this.parents.pop();
      this.childIndex.pop();
      return true;
    }
    return false;
  }
  gotoFirstChild(): boolean {
    if (this.node.children?.length) {
      this.childIndex.push(0);
      this.parents.push(this.node), (this.node = this.node.children[0]);
      return true;
    }
    return false;
  }
  gotoFirstChildForIndex(index: number): boolean {
    return false;
  }
  gotoNextSibling(): boolean {
    if (this.childIndex.length) {
      const index = this.childIndex[this.childIndex.length - 1] + 1;
      const parent = this.parents[this.parents.length - 1];
      if (index < parent.children.length) {
        this.node = parent.children[index];
        this.childIndex[this.childIndex.length - 1] = index;
        return true;
      }
    }
    return false;
  }
}

function compareNodes(a: TreeCursor, b: TreeCursor): PatternNode[] | null {
  const nodes = [];

  const hasSiblingA = skipKeywords(a);
  const hasSiblingB = skipKeywords(b);
  if (hasSiblingA !== hasSiblingB) {
    // mismatch (parent)
    return null;
  }
  let hasSibling = hasSiblingA && hasSiblingB;

  while (hasSibling) {
    console.log(a.nodeText, b.nodeText);
    const fieldNameA = a.currentFieldName() || null;
    const fieldNameB = b.currentFieldName() || null;
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
      nodes.push({
        variable: true,
        wildcard: true,
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
        const children = compareNodes(a, b);
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
          nodes.push({
            variable: true,
            fieldName: fieldNameA,
            type: a.nodeType,
          });
        }
      } else if (a.nodeText !== b.nodeText) {
        // mismatch (current, same node type)
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
