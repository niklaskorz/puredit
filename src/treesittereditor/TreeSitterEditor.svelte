<script lang="ts">
  import type { QueryMatch, SyntaxNode } from "web-tree-sitter";
  import { example } from "./code";
  import { parser, language } from "./parser";

  const query = language.query(`
; Operation replace
(expression_statement
  (call_expression
    function: (member_expression
      object: (call_expression
        function: (member_expression
          object: (identifier) @match.table
          property: (property_identifier) @match.column
        )
        arguments: (arguments
          (string (string_fragment) @columnName)
        )
      )
      property: (property_identifier) @match.replace
    )
    arguments: (arguments
      (string (string_fragment) @target)
      (string (string_fragment) @value)
    )
  )
  (#eq? @match.table "table")
  (#eq? @match.column "column")
  (#eq? @match.replace "replace")
) @type.operationReplace

; Operation trim
(expression_statement
  (call_expression
    function: (member_expression
      object: (call_expression
        function: (member_expression
          object: (identifier) @match.table
          property: (property_identifier) @match.column
        )
        arguments: (arguments
          (string (string_fragment) @columnName)
        )
      )
      property: (property_identifier) @match.trim
    )
    arguments: (arguments
      (string (string_fragment) @direction)
    )
  )
  (#eq? @match.table "table")
  (#eq? @match.column "column")
  (#eq? @match.trim "trim")
) @type.operationTrim
`);

  function nodeToObject(node: SyntaxNode): object {
    return {
      type: node.type,
      text: node.text,
      children: node.children.map(nodeToObject),
    };
  }

  function matchToObject(match: QueryMatch): Record<string, string> {
    return match.captures.reduce((prev, curr) => {
      if (curr.name.startsWith("type.")) {
        prev.type = curr.name.slice(5);
      } else if (!curr.name.startsWith("match.")) {
        prev[curr.name] = curr.node.text;
      }
      return prev;
    }, {} as Record<string, string>);
  }

  console.time("tree-sitter");
  const tree = parser.parse(example);
  const node = tree.rootNode;
  //console.log(nodeToObject(node));
  const matches = query.matches(node).map(matchToObject);
  console.timeEnd("tree-sitter");
  console.log("matches:", matches);
  console.log(node);
</script>

<div>tree-sitter</div>

<style></style>
