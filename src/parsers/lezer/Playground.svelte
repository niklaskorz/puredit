<script lang="ts">
  import { example } from "../../shared/code";
  import { parser } from "./parser";
  import { arg, block, createPatternMap, pattern, findPatterns } from "./index";
  import { matchToString } from "./inspect";
  import { Text } from "@codemirror/text";

  const code = example;
  const patternMap = createPatternMap(
    pattern`
      db.change(${arg("table", "string")}, (table) => ${block()});
    `[0],
    pattern`
      table.column(${arg("column", "string")}).replace(
        ${arg("target", "string")},
        ${arg("replacement", "string")}
      );
    `[0],
    pattern`
      table.column(${arg("column", "string")}).trim(
        ${arg("direction", "string")},
      );
    `[0]
  );

  console.time("findPatterns");
  const matches = findPatterns(
    patternMap,
    parser.parse(code).cursor(),
    Text.of(code.split("\n"))
  );
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
