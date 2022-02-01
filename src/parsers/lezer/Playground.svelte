<script lang="ts">
  import { example } from "../../shared/code";
  import { parser } from "./parser";
  import { arg, block, createPatternMap, pattern, findPatterns } from "./index";
  import { matchToString } from "./inspect";

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
