import ts from "typescript";
import { operationReplace, operationTrim, Value } from "./parse";

export type { Value };

export interface OpReplace {
  type: "replace";
  column: Value;
  target: Value;
  value: Value;
}

export interface OpTrim {
  type: "trim";
  column: Value;
  direction: Value;
}

type Operation = OpReplace | OpTrim;

export interface Block {
  line: number;
  column: number;
  table: Value;
  insertAt: number;
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
        column: op.columnName,
        target: op.target,
        value: op.value,
      });
      continue;
    }
    op = operationTrim(stmt);
    if (op) {
      operations.push({
        type: "trim",
        column: op.columnName,
        direction: op.direction,
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

          const args = call.arguments;
          if (
            args.length >= 2 &&
            ts.isStringLiteral(args[0]) &&
            ts.isArrowFunction(args[1])
          ) {
            let table = {
              value: args[0].text,
              start: args[0].pos,
              end: args[0].end,
            };
            // detect operations
            let operations = extractOperations(args[1].body);
            blocks.push({
              line,
              column: character,
              table,
              insertAt: args[1].end - 2,
              operations,
            });
          }
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
