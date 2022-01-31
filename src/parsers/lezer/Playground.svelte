<script lang="ts">
  import type { TreeCursor } from "@lezer/common";
  import { parser } from "./parser";
  import {
    debug,
    expressionPattern,
    findPattern,
    PatternMap,
    patternToString,
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

  const code = `
    function performCalculation(y: number) {
      let x = 1 + 2 / 3 - Math.sqrt(42);
      if (x > 42) {
        console.log("Succ\ness!");
      } else {
        console.log("Fail");
      }
    }
  `;

  const pattern = expressionPattern`
    2 / 3 - 1
  `;

  const patternMap: PatternMap = {
    [pattern.type]: [pattern],
  };

  console.time("find pattern");
  const match = findPattern(patternMap, parser.parse(code).cursor(), code);
  console.timeEnd("find pattern");
  const matchString = match ? patternToString(match) : "no match";
</script>

<pre>{matchString}</pre>

<pre>{debug(code)}</pre>

<style>
  :global(body) {
    background-color: #111;
    color: #fff;
  }

  pre {
    padding: 10px 50px;
  }
</style>
