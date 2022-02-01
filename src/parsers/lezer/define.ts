import { isString } from "../../shared/utils";
import { parsePattern } from "./pattern";
import type {
  PatternNode,
  TemplateArg,
  TemplateBlock,
  TemplateParam,
} from "./types";

export function arg(name: string, type: string): TemplateArg {
  return {
    kind: "arg",
    name,
    type,
  };
}

export function block(): TemplateBlock {
  return {
    kind: "block",
  };
}

function patternTemplate(
  template: TemplateStringsArray,
  params: (string | TemplateParam)[],
  isExpression: boolean
): [PatternNode, string] {
  const args: TemplateArg[] = [];
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
        return "__template_block";
      }
    })
  );
  const draft = String.raw(
    template,
    ...params.map((param) => {
      if (isString(param)) {
        return param;
      }
      if (param.kind === "arg") {
        switch (param.type) {
          case "string":
            return '"' + param.name + '"';
          case "number":
            return "1";
          default:
            return param.name;
        }
      }
      if (param.kind === "block") {
        return "{\n  // instructions go here\n}";
      }
    })
  );
  return [parsePattern(raw, args, isExpression), draft];
}

export function pattern(
  template: TemplateStringsArray,
  ...params: (string | TemplateParam)[]
): [PatternNode, string] {
  return patternTemplate(template, params, false);
}

export function expressionPattern(
  template: TemplateStringsArray,
  ...params: (string | TemplateParam)[]
): [PatternNode, string] {
  return patternTemplate(template, params, true);
}
