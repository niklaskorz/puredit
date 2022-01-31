<script lang="ts">
  import type { TreeCursor } from "@lezer/common";
  import { example } from "../../shared/code";
  import { parser } from "./parser";
  import {
    arg,
    argMapToString,
    block,
    createPatternMap,
    pattern,
    findPatterns,
    syntaxNodeToString,
    matchToString,
  } from "./pattern";

  function visitNode(cursor: TreeCursor, code: string, indent = "") {
    let expr = "";
    do {
      expr += indent;
      expr +=
        "(" +
        cursor.name +
        " " +
        JSON.stringify(code.slice(cursor.from, cursor.to));
      if (cursor.firstChild()) {
        expr += "\n";
        expr += visitNode(cursor, code, indent + "  ");
        cursor.parent();
        expr += indent + ")\n";
      } else {
        expr += ")\n";
      }
    } while (cursor.nextSibling());
    return expr;
  }

  const code = example;
  const patternMap = createPatternMap(
    pattern`
      db.change(${arg("table", "string")}, (table) => ${block()});
    `,
    pattern`
      table.column(${arg("column", "string")}).replace(
        ${arg("target", "string")},
        ${arg("replacement", "string")}
      );
    `,
    pattern`
      table.column(${arg("column", "string")}).trim(
        ${arg("direction", "string")},
      );
    `
  );

  console.time("findPatterns");
  const matches = findPatterns(patternMap, parser.parse(code).cursor(), code);
  console.timeEnd("findPatterns");
  const matchStrings = matches
    .map((match) => matchToString(match, code))
    .join("\n");
</script>

<pre>{matchStrings}</pre>

<style>
  :global(body) {
    background-color: #111;
    color: #fff;
  }

  pre {
    padding: 10px 50px;
  }
</style>
