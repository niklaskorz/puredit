<script lang="ts">
  import { example } from "../../shared/code";
  import { parser, pythonParser } from "./parser";
  import {
    arg,
    block,
    createPatternMap,
    statementPattern,
    findPatterns,
  } from "./index";
  import { matchToString, syntaxNodeToString } from "./inspect";
  import { Text } from "@codemirror/text";

  const snippet = `import dsl, { db as du, da } from "./dsl";
function doThing() {
  let x = 5;
  // Does the thing
  db.column("hello").trim();
}
doThing()
`;
  const snippetNode = parser.parse(snippet).topNode;

  const snippetPy = `from .dsl import db
def doThing():
  # Does the thing
  db.column("hello").trim()
doThing()
`;
  const snippetPyNode = pythonParser.parse(snippetPy).topNode;

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
<pre>{syntaxNodeToString(snippetPyNode, snippetPy)}</pre>

<style>
  pre {
    padding: 10px 50px;
  }
</style>
