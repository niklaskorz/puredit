<script lang="ts">
  import ts from "typescript";
  import type { Node, SourceFile } from "typescript";
  import { nodes } from "./nodes";

  export let sourceFile: SourceFile;
  export let node: Node;
</script>

{#if ts.isIfStatement(node)}
  <div class="block">
    <span class="keyword">if</span>
    <svelte:self {sourceFile} node={node.expression} />:
    <div class="indent">
      <svelte:self {sourceFile} node={node.thenStatement} />
    </div>
  </div>
{:else if ts.isBlock(node)}
  <div class="block">
    {#each node.statements as child}
      <svelte:self {sourceFile} node={child} />
    {/each}
  </div>
{:else if ts.isImportDeclaration(node)}
  <div class="block">
    <span class="keyword">import</span>
    <svelte:self {sourceFile} node={node.importClause} />
    <span class="keyword">from</span>
    <svelte:self {sourceFile} node={node.moduleSpecifier} />
  </div>
{:else if ts.isImportClause(node)}
  <div class="inline">
    {#if node.name}
      <svelte:self {sourceFile} node={node.name} />
    {/if}
    {#if node.namedBindings}
      <svelte:self {sourceFile} node={node.namedBindings} />
    {/if}
  </div>
{:else if ts.isNamedImports(node)}
  <div class="inline">
    <span class="">{"{"}</span>
    {#each node.elements as child}
      <svelte:self {sourceFile} node={child} />
    {/each}
    <span class="">{"}"}</span>
  </div>
{:else if ts.isImportSpecifier(node)}
  <div class="inline">
    {#if node.propertyName}
      <svelte:self {sourceFile} node={node.propertyName} />
      <span class="keyword">as</span>
    {/if}
    <svelte:self {sourceFile} node={node.name} />
  </div>
{:else if ts.isExpressionStatement(node)}
  <div class="block"><svelte:self {sourceFile} node={node.expression} /></div>
{:else if ts.isWhileStatement(node)}
  <div class="block">
    <span class="keyword">while</span>
    <svelte:self {sourceFile} node={node.expression} />:
    <div class="indent">
      <svelte:self {sourceFile} node={node.statement} />
    </div>
  </div>
{:else if ts.isBinaryExpression(node)}
  <div class="inline">
    <svelte:self {sourceFile} node={node.left} />
    <svelte:self {sourceFile} node={node.operatorToken} />
    <svelte:self {sourceFile} node={node.right} />
  </div>
{:else if ts.isIdentifier(node)}
  <div class="inline identifier">{node.escapedText}</div>
{:else if ts.isStringLiteral(node)}
  <div class="inline string-literal">"{node.text}"</div>
{:else if ts.isNumericLiteral(node)}
  <div class="inline literal-value">{node.text}</div>
{:else if node.kind === ts.SyntaxKind.TrueKeyword}
  <div class="inline literal-value">true</div>
{:else if node.kind === ts.SyntaxKind.StringKeyword}
  <div class="inline keyword">string</div>
{:else if node.kind === ts.SyntaxKind.NumberKeyword}
  <div class="inline keyword">number</div>
{:else if node.kind === ts.SyntaxKind.LessThanToken}
  <div class="inline">{"<"}</div>
{:else if ts.isFunctionDeclaration(node)}
  <div class="block">
    <span class="keyword">function</span>
    <svelte:self {sourceFile} node={node.name} />
    ({#each node.parameters as child, i}
      {#if i !== 0}
        ,
      {/if}
      <svelte:self {sourceFile} node={child} />
    {/each}):
    <div class="indent">
      <svelte:self {sourceFile} node={node.body} />
    </div>
  </div>
{:else if ts.isParameter(node)}
  <div class="inline">
    <svelte:self {sourceFile} node={node.name} />: {#if node.type}<svelte:self
        {sourceFile}
        node={node.type}
      />{/if}
  </div>
{:else}
  <div class="block">
    unknown node type {ts.SyntaxKind[node.kind]}
    <div class="indent">
      {#each node.getChildren(sourceFile) as child}
        <svelte:self {sourceFile} node={child} />
      {/each}
    </div>
  </div>
{/if}

<style>
  .block {
    display: block;
  }

  .inline {
    display: inline-block;
  }

  .indent {
    padding-left: 17px;
    border-left: 1px solid #ccc;
  }

  .keyword {
    font-weight: bold;
  }

  .literal-value {
    color: blue;
  }

  .string-literal {
    color: red;
  }

  .identifier {
  }
</style>
