<script lang="ts">
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

  let snippet = `
  db.change("students", (table) => {
    // hello
  });
  `;
  const snippetNode = parser.parse(snippet).rootNode;

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
  const { matches } = findPatterns(
    patternMap,
    snippetNode.walk(),
    Text.of(snippet.split("\n"))
  );
  console.timeEnd("findPatterns");
  const matchStrings = matches
    .map((match) => matchToString(match, snippet))
    .join("\n");
</script>

<pre>{syntaxNodeToString(snippetNode, snippet)}</pre>
<pre>{matchStrings}</pre>

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
