import type Parser from "web-tree-sitter";
import { isString } from "@puredit/utils";
import { parsePattern } from "./pattern";
import type {
  Context,
  PatternDraft,
  PatternNode,
  TemplateArg,
  TemplateBlock,
  TemplateContextVariable,
  TemplateParam,
} from "./types";
import { Target } from "./parser";

export function arg(name: string, type: string): TemplateArg {
  return {
    kind: "arg",
    name,
    type,
  };
}

export function block(context: Context = {}): TemplateBlock {
  return {
    kind: "block",
    context,
    blockType: Target.TypeScript,
  };
}

export function contextVariable(name: string): TemplateContextVariable {
  return {
    kind: "contextVariable",
    name,
  };
}

export function patternTemplate(
  template: TemplateStringsArray,
  params: (string | TemplateParam)[],
  parser: Parser,
  target: Target,
  isExpression: boolean
): [PatternNode, PatternDraft] {
  const args: TemplateArg[] = [];
  const blocks: TemplateBlock[] = [];
  const contextVariables: TemplateContextVariable[] = [];
  const raw = String.raw(
    template,
    ...params.map((param) => {
      if (isString(param)) {
        return param;
      }
      if (param.kind === "arg") {
        return "__template_arg_" + (args.push(param) - 1).toString();
      }
      if (param.kind === "block") {
        param.blockType = target;
        return "__template_block_" + (blocks.push(param) - 1).toString();
      }
      if (param.kind === "contextVariable") {
        return (
          "__template_context_variable_" +
          (contextVariables.push(param) - 1).toString()
        );
      }
    })
  );
  const draft = (context: Context) =>
    String.raw(
      template,
      ...params.map((param) => {
        if (isString(param)) {
          return param;
        }
        if (param.kind === "arg") {
          switch (param.type) {
            case "string":
              return '""';
            case "number":
              return "1";
            case "list":
              return "[]";
            default:
              return `__empty_${param.type}`;
          }
        }
        if (param.kind === "block") {
          switch (param.blockType) {
            case "ts":
              return "{\n  // instructions go here\n}";
            case "py":
              return "pass # instructions go here";
          }
        }
        if (param.kind === "contextVariable") {
          return Object.prototype.hasOwnProperty.call(context, param.name)
            ? context[param.name]
            : param.name;
        }
      })
    ).trim();
  return [
    parsePattern(raw, parser, args, blocks, contextVariables, isExpression),
    draft,
  ];
}
