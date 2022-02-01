import type { SyntaxNode } from "@lezer/common";

export type { SyntaxNode };

export interface PatternNode {
  type: string;
  children?: PatternNode[];
  text?: string;
  arg?: TemplateArg;
}

export type PatternMap = Record<string, PatternNode[]>;

export type ArgMap = Record<string, SyntaxNode>;

export interface TemplateArg {
  kind: "arg";
  name: string;
  type: string;
}

export interface TemplateBlock {
  kind: "block";
}

export type TemplateParam = TemplateArg | TemplateBlock;

export interface Match {
  pattern: PatternNode;
  node: SyntaxNode;
  args: ArgMap;
  blocks: SyntaxNode[];
}
