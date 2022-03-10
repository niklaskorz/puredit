import type TreeSitterParser from "web-tree-sitter";
import { patternTemplate } from "./define";
import { createParser, Target } from "./parser";
import { parsePattern } from "./pattern";
import type {
  PatternDraft,
  PatternNode,
  TemplateArg,
  TemplateBlock,
  TemplateContextVariable,
  TemplateParam,
} from "./types";

export class Parser {
  static async load(target: Target): Promise<Parser> {
    const tsParser = await createParser(target);
    return new Parser(tsParser, target);
  }

  private constructor(
    private tsParser: TreeSitterParser,
    public target: Target
  ) {}

  parse(
    input: string | TreeSitterParser.Input,
    previousTree?: TreeSitterParser.Tree,
    options?: TreeSitterParser.Options
  ): TreeSitterParser.Tree {
    return this.tsParser.parse(input, previousTree, options);
  }

  parsePattern(
    code: string,
    args: TemplateArg[] = [],
    blocks: TemplateBlock[] = [],
    contextVariables: TemplateContextVariable[] = [],
    isExpression = false
  ): PatternNode {
    return parsePattern(
      code,
      this.tsParser,
      args,
      blocks,
      contextVariables,
      isExpression
    );
  }

  statementPattern(
    template: TemplateStringsArray,
    ...params: (string | TemplateParam)[]
  ): [PatternNode, PatternDraft] {
    return patternTemplate(template, params, this.tsParser, this.target, false);
  }

  expressionPattern(
    template: TemplateStringsArray,
    ...params: (string | TemplateParam)[]
  ): [PatternNode, PatternDraft] {
    return patternTemplate(template, params, this.tsParser, this.target, true);
  }
}

export { arg, block, contextVariable } from "./define";
export { findPatterns } from "./match";
export { Target } from "./parser";
export { createPatternMap } from "./pattern";
export type {
  SyntaxNode,
  PatternNode,
  PatternMap,
  ArgMap,
  TemplateArg,
  TemplateBlock,
  TemplateParam,
  Match,
  Context,
} from "./types";
