import ts from "typescript";
import { operationReplace, operationTrim } from "./parse";

export interface OpReplace {
  type: "replace";
  column: string;
  target: string;
  value: string;
}

export interface OpTrim {
  type: "trim";
  column: string;
  direction: string;
}

type Operation = OpReplace | OpTrim;

export interface Block {
  line: number;
  column: number;
  table: string;
  operations: Operation[];
}

function extractOperations(body: ts.ConciseBody) {
  if (!ts.isBlock(body)) {
    return [];
  }
  let operations: Operation[] = [];
  for (const stmt of body.statements) {
    let op = operationReplace(stmt);
    if (op) {
      operations.push({
        type: "replace",
        column: op.columnName || "unknown",
        target: op.target || "unknown",
        value: op.value || "unknown",
      });
      continue;
    }
    op = operationTrim(stmt);
    if (op) {
      operations.push({
        type: "trim",
        column: op.columnName || "unknown",
        direction: op.direction || "unknown",
      });
    }
  }
  return operations;
}

function addBlocksFromNode(
  blocks: Block[],
  sourceFile: ts.SourceFile,
  node: ts.Node
) {
  ts.forEachChild(node, addBlocksFromNode.bind(null, blocks, sourceFile));
  if (ts.isExpressionStatement(node)) {
    const call = node.expression;
    if (ts.isCallExpression(call)) {
      const callee = call.expression;
      if (ts.isPropertyAccessExpression(callee)) {
        const obj = callee.expression;
        const prop = callee.name;
        if (
          ts.isIdentifier(obj) &&
          ts.isIdentifier(prop) &&
          obj.text === "db" &&
          prop.text === "change"
        ) {
          const pos = node.getStart(sourceFile, false);
          const { line, character } = ts.getLineAndCharacterOfPosition(
            sourceFile,
            pos
          );

          let table = "";
          const args = call.arguments;
          if (args.length >= 1 && ts.isStringLiteral(args[0])) {
            table = args[0].text;
          }
          let operations: Operation[] = [];
          if (args.length >= 2 && ts.isArrowFunction(args[1])) {
            // detect operations
            operations = extractOperations(args[1].body);
          }

          blocks.push({
            line,
            column: character,
            table,
            operations,
          });
          return;
        }
      }
    }
  }
}

export function extractBlocksFromSource(sourceFile: ts.SourceFile): Block[] {
  const blocks: Block[] = [];
  addBlocksFromNode(blocks, sourceFile, sourceFile);
  return blocks;
}
