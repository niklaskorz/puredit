import type { SyntaxNode } from "web-tree-sitter";
import type { Target } from "./parser";

export type { SyntaxNode };

export interface PatternNode {
  type: string;
  fieldName?: string;
  children?: PatternNode[];
  text?: string;
  arg?: TemplateArg;
  block?: TemplateBlock;
  contextVariable?: TemplateContextVariable;
  matchIf?(args: ArgMap): boolean;
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
  context: Context;
  blockType: Target;
}

export interface TemplateContextVariable {
  kind: "contextVariable";
  name: string;
}

export type TemplateParam =
  | TemplateArg
  | TemplateBlock
  | TemplateContextVariable;

export interface Match {
  pattern: PatternNode;
  node: SyntaxNode;
  args: ArgMap;
  blocks: CodeBlock[];
}

export type Context = Record<string, string>;

export interface ContextRange {
  from: number;
  to: number;
  context: Context;
}

export type PatternDraft = (context: Context) => string;

export interface CodeBlock {
  node: SyntaxNode;
  context: Context;
  from: number;
  to: number;
  blockType: Target;
}

export interface FindPatternsResult {
  matches: Match[];
  contextRanges: ContextRange[];
}
