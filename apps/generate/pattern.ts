import type { TreeCursor, Point, SyntaxNode } from "web-tree-sitter";

export interface PatternNode {
  variable?: true;
  variableName?: string;
  wildcard?: true;
  fieldName?: string;
  type: string;
  children?: PatternNode[];
  text?: string;
}

export class PatternCursor implements TreeCursor {
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

  reset() {
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
      this.parents.push(this.node);
      this.node = this.node.children[0];
      return true;
    }
    return false;
  }

  gotoFirstChildForIndex(): boolean {
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
