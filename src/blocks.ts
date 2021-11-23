import ts from "typescript";

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
          obj.escapedText === "db" &&
          prop.escapedText === "change"
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
          if (args.length >= 2) {
            // detect operations
          }

          blocks.push({
            line,
            column: character,
            table,
            operations: [
              {
                type: "replace",
                column: "firstName",
                target: "name",
                value: "Mr.",
              },
              {
                type: "trim",
                column: "lastName",
                direction: "right",
              },
            ],
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
