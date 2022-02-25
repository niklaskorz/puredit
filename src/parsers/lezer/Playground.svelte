<script lang="ts">
  import { example } from "../../shared/code";
  import { parser } from "./parser";
  import {
    arg,
    block,
    createPatternMap,
    statementPattern,
    findPatterns,
  } from "./index";
  import { matchToString, syntaxNodeToString } from "./inspect";
  import { Text } from "@codemirror/text";

  let snippet = `import antigravity

with x as y: __template_body_0

with db.change("students") as table:
    table["name"] = table["name"].trim("right")`;
  const snippetNode = parser.parse(snippet).topNode;

  /*const code = example;
  const codeTree = parser.parse(code);
  const codeText = Text.of(code.split("\n"));
  const patternMap = createPatternMap(
    statementPattern`
      db.change(${arg("table", "string")}, (table) => ${block()});
    `[0],
    statementPattern`
      table.column(${arg("column", "string")}).replace(
        ${arg("target", "string")},
        ${arg("replacement", "string")}
      );
    `[0],
    statementPattern`
      table.column(${arg("column", "string")}).trim(
        ${arg("direction", "string")},
      );
    `[0]
  );

  console.time("findPatterns");
  const { matches } = findPatterns(patternMap, codeTree.cursor(), codeText);
  console.timeEnd("findPatterns");
  const matchStrings = matches
    .map((match) => matchToString(match, code))
    .join("\n");*/
</script>

<pre>{syntaxNodeToString(snippetNode, snippet)}</pre>

<style>
  pre {
    margin: 0;
    padding: 10px 50px;
    width: 100%;
    height: 100%;
    overflow: auto;

    background-color: #111;
    color: #fff;
  }
</style>
