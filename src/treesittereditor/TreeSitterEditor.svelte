<script lang="ts">
  import type { QueryMatch, SyntaxNode } from "web-tree-sitter";
  import { example } from "./code";
  import { fancyExample } from "./define";
  import { parser, language } from "./parser";

  function nodeToObject(node: SyntaxNode): object {
    return {
      type: node.type,
      text: node.text,
      children: node.children.map(nodeToObject),
    };
  }

  function matchToObject(match: QueryMatch): Record<string, string> {
    return match.captures.reduce((prev, curr) => {
      curr.node.endPosition;
      if (curr.name.startsWith("type.")) {
        prev.type = curr.name.slice(5);
      } else if (!curr.name.startsWith("match.")) {
        prev[curr.name] = curr.node.text;
      }
      return prev;
    }, {} as Record<string, string>);
  }

  function ts(template: TemplateStringsArray, ...params: string[]) {
    const raw = String.raw(template, ...params);
    return parser.parse(raw);
  }

  let args: any = [];
  let argCounter = 0;
  function arg(name: string, type: string): string {
    args.push({ name, type });
    return `__template_arg_${argCounter++}`;
  }

  let symbols: any = [];
  let symbolCounter = 0;
  function symbol(name: string): string {
    symbols.push(name);
    return `__template_symbol_${symbolCounter++}`;
  }

  const tree = ts`
    $symbol(table)
      .column($arg<string>(column))
      .replace(
        $arg<Test>(target),
        $arg<string>(replacement)
      );
    let x: $symbol = 'hello world';
    $repeat: {
      $oneOf: {
        let x = 1;
        let y = 2;
      }
    }
  `;
  const cursor = tree.walk();

  const printNodeValues = false;
  let expr = "";
  let eqCounter = 0;
  function visitNode(indent = "") {
    do {
      if (!cursor.nodeIsNamed) {
        continue;
      }
      expr += indent;
      if (cursor.currentFieldName()) {
        expr += cursor.currentFieldName() + ": ";
      }
      if (
        cursor.nodeType === "identifier" &&
        cursor.nodeText.startsWith("__template_")
      ) {
        if (cursor.nodeText.startsWith("__template_arg_")) {
          expr += "(_) @" + cursor.nodeText + "\n";
        } else if (cursor.nodeText.startsWith("__template_symbol_")) {
          expr += "(identifier) @" + cursor.nodeText + "\n";
        }
        continue;
      }
      expr += "(" + cursor.nodeType;
      if (cursor.gotoFirstChild()) {
        expr += "\n";
        visitNode(indent + "  ");
        cursor.gotoParent();
        expr += indent + ")\n";
      } else if (printNodeValues) {
        expr += ' "' + cursor.nodeText + '")\n';
      } else {
        let text = cursor.nodeText;
        if (cursor.nodeType === "escape_sequence") {
          text = text.replaceAll("\\", "\\\\");
        }
        text = text.replaceAll('"', '\\"');
        const eqKey = "@eq" + eqCounter++;
        expr += `) ${eqKey} (#eq? ${eqKey} "${text}")\n`;
      }
    } while (cursor.gotoNextSibling());
  }
  function visitProgram() {
    expr += "(\n";
    if (cursor.gotoFirstChild()) {
      visitNode("  ");
    }
    expr += ") @expr";
  }
  visitProgram();

  try {
    const query = language.query(expr);
    const matches = query.matches(tree.rootNode); //.map(matchToObject);
    const captures = query.captures(tree.rootNode);
    console.log("matches:", matches);
    console.log("captures:", captures);
  } catch (ex) {
    console.log(ex);
  }
</script>

<pre>{expr}</pre>

<pre>{fancyExample}</pre>

<pre>{JSON.stringify({ args }, null, 2)}</pre>

<style></style>
