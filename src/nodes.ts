import { SyntaxKind } from "typescript";

interface Node {}

export const nodes: Record<SyntaxKind, Node> = {
  [SyntaxKind.IfStatement]: {},
};
