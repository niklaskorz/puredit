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

  let snippet = `let x = [{"a": 42, b: 100}, {"b": 90, a: "1"}];`;
  snippet = `({"a": 42})`;
  const snippetNode = parser.parse(snippet).topNode;

  const code = example;
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
  const matches = findPatterns(patternMap, codeTree.cursor(), codeText);
  console.timeEnd("findPatterns");
  const matchStrings = matches
    .map((match) => matchToString(match, code))
    .join("\n");
</script>

<pre>{syntaxNodeToString(snippetNode, snippet)}</pre>

<style>
  :global(body) {
    background-color: #111;
    color: #fff;
  }

  pre {
    padding: 10px 50px;
  }
</style>
