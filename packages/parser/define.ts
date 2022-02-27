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
  };
}

export function contextVariable(name: string): TemplateContextVariable {
  return {
    kind: "contextVariable",
    name,
  };
}

function patternTemplate(
  template: TemplateStringsArray,
  params: (string | TemplateParam)[],
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
            default:
              return param.name;
          }
        }
        if (param.kind === "block") {
          return "{\n  // instructions go here\n}";
        }
        if (param.kind === "contextVariable") {
          return Object.prototype.hasOwnProperty.call(context, param.name)
            ? context[param.name]
            : param.name;
        }
      })
    ).trim();
  return [
    parsePattern(raw, args, blocks, contextVariables, isExpression),
    draft,
  ];
}

export function statementPattern(
  template: TemplateStringsArray,
  ...params: (string | TemplateParam)[]
): [PatternNode, PatternDraft] {
  return patternTemplate(template, params, false);
}

export function expressionPattern(
  template: TemplateStringsArray,
  ...params: (string | TemplateParam)[]
): [PatternNode, PatternDraft] {
  return patternTemplate(template, params, true);
}
