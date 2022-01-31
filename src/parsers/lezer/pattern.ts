import type { SyntaxNode, TreeCursor } from "@lezer/common";
import { isString } from "../../shared/utils";
import { parser } from "./parser";

export interface PatternNode {
  type: string;
  children?: PatternNode[];
  text?: string;
  arg?: TemplateArg;
}

export type PatternMap = Record<string, PatternNode[]>;

export type ArgMap = Record<string, SyntaxNode>;

export function createPatternMap(...patterns: PatternNode[]): PatternMap {
  const patternMap: PatternMap = {};
  for (const pattern of patterns) {
    if (patternMap[pattern.type]) {
      patternMap[pattern.type].push(pattern);
    } else {
      patternMap[pattern.type] = [pattern];
    }
  }
  return patternMap;
}

export function parsePattern(
  code: string,
  args: TemplateArg[] = [],
  isExpression = false
): PatternNode {
  const cursor = parser.parse(code).cursor();
  if (isExpression) {
    goToExpression(cursor);
  }
  const root = visitNode(cursor, code, args)[0];
  if (root.type === "Script" && root.children) {
    return root.children[0];
  }
  return root;
}

function goToExpression(cursor: TreeCursor) {
  do {
    if (cursor.name === "ExpressionStatement") {
      cursor.firstChild();
      return;
    }
  } while (cursor.next());
}

export function patternToString(node: PatternNode, indent = ""): string {
  let out = indent + node.type;
  if (node.children) {
    out +=
      " {\n" +
      node.children
        .map((child) => patternToString(child, indent + "  "))
        .join("") +
      indent +
      "}\n";
  } else if (node.text) {
    out += " " + JSON.stringify(node.text) + "\n";
  }
  return out;
}

export function syntaxNodeToString(
  node: SyntaxNode,
  text: string,
  indent = ""
): string {
  return patternToString(visitNode(node.cursor, text)[0], indent);
}

export function argMapToString(
  args: ArgMap,
  text: string,
  indent = ""
): string {
  let out = "{\n";
  for (const key of Object.keys(args)) {
    out +=
      indent +
      `  ${key} = {\n${
        syntaxNodeToString(args[key], text, indent + "    ") + indent
      }  }\n`;
  }
  return out + indent + "}";
}

function visitNode(
  cursor: TreeCursor,
  code: string,
  args: TemplateArg[] = []
): PatternNode[] {
  let nodes = [];
  do {
    // Skip keywords
    if (isKeyword(cursor.name)) {
      continue;
    }
    let node: PatternNode = {
      type: cursor.name,
    };
    if (cursor.firstChild()) {
      node.children = visitNode(cursor, code, args);
      cursor.parent();
    } else {
      node.text = code.slice(cursor.from, cursor.to);
      if (node.text.startsWith("__template_arg_")) {
        let argIndex = parseInt(node.text.slice("__template_arg_".length));
        node.arg = args[argIndex];
        node.type = "TemplateArg";
        node.text = `${node.arg.name}: ${node.arg.type}`;
      } else if (node.text.startsWith("__template_block")) {
        node.type = "TemplateBlock";
      }
    }
    nodes.push(node);
  } while (cursor.nextSibling());
  return nodes;
}

function isKeyword(name: string): boolean {
  // Keywords start with a lowercase letter or a special character.
  // As the lower case version of a special character is the character itself,
  // we only have to check for lower case.
  const firstLetter = name[0];
  return firstLetter.toLowerCase() === firstLetter;
}

function skipKeywords(cursor: TreeCursor): boolean {
  while (isKeyword(cursor.name)) {
    if (!cursor.nextSibling()) {
      return false;
    }
  }
  return true;
}

interface TemplateArg {
  kind: "arg";
  name: string;
  type: string;
}

interface TemplateBlock {
  kind: "block";
}

type TemplateParam = TemplateArg | TemplateBlock;

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
): PatternNode {
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
  return parsePattern(raw, args, isExpression);
}

export function pattern(
  template: TemplateStringsArray,
  ...params: (string | TemplateParam)[]
): PatternNode {
  return patternTemplate(template, params, false);
}

export function expressionPattern(
  template: TemplateStringsArray,
  ...params: (string | TemplateParam)[]
): PatternNode {
  return patternTemplate(template, params, true);
}

function matchPattern(
  pattern: PatternNode,
  cursor: TreeCursor,
  code: string,
  args: ArgMap,
  blocks: SyntaxNode[]
): boolean {
  if (pattern.type === "TemplateBlock") {
    blocks.push(cursor.node);
    return cursor.name === "Block";
  }
  if (pattern.arg) {
    args[pattern.arg.name] = cursor.node;
    return true;
  }
  if (cursor.name !== pattern.type) {
    return false;
  }
  if (pattern.text) {
    let text = code.slice(cursor.from, cursor.to);
    return pattern.text === text;
  }
  if (!pattern.children || !cursor.firstChild()) {
    return false;
  }
  const length = pattern.children.length;
  if (!skipKeywords(cursor)) {
    return false;
  }
  for (let i = 0; i < length; ) {
    if (!matchPattern(pattern.children[i], cursor, code, args, blocks)) {
      return false;
    }
    i += 1;
    const hasSibling = cursor.nextSibling() && skipKeywords(cursor);
    if ((i < length && !hasSibling) || (i >= length && hasSibling)) {
      return false;
    }
  }
  cursor.parent();
  return true;
}

interface Match {
  pattern: PatternNode;
  node: SyntaxNode;
  args: ArgMap;
  blocks: SyntaxNode[];
}

export function findPatterns(
  patternMap: PatternMap,
  cursor: TreeCursor,
  code: string
): Match[] {
  let matches: Match[] = [];
  do {
    if (patternMap[cursor.name]) {
      const patterns = patternMap[cursor.name];
      let foundPattern = false;
      for (const pattern of patterns) {
        const args: ArgMap = {};
        const blocks: SyntaxNode[] = [];
        if (matchPattern(pattern, cursor.node.cursor, code, args, blocks)) {
          matches.push({
            pattern,
            node: cursor.node,
            args,
            blocks,
          });
          for (const block of blocks) {
            matches = matches.concat(
              findPatterns(patternMap, block.cursor, code)
            );
          }
          foundPattern = true;
          break;
        }
      }
      if (foundPattern) {
        continue;
      }
    }
    if (cursor.firstChild()) {
      matches = matches.concat(findPatterns(patternMap, cursor, code));
      cursor.parent();
    }
  } while (cursor.nextSibling());
  return matches;
}

export function matchToString(match: Match, text: string): string {
  return `Match {
  args = ${argMapToString(match.args, text, "  ")}
}`;
}
