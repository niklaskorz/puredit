import Parser from "web-tree-sitter";

enum Target {
  TypeScript = "ts",
  Python = "py",
}

/**
 * Removes the `file://` protocol prefix.
 * Required for using `new URL(url, import.meta.url)` in jest / node.
 */
function stripFileProtocol(href: string): string {
  return href.replace(/^file:\/\//, "");
}

function parserUrl(target: Target): URL {
  switch (target) {
    case Target.TypeScript:
      return new URL("./wasm/tree-sitter-typescript.wasm", import.meta.url);
    case Target.Python:
      return new URL("./wasm/tree-sitter-python.wasm", import.meta.url);
  }
}

async function createParser(type: Target): Promise<Parser> {
  await Parser.init({
    locateFile(path: string, prefix: string) {
      if (path === "tree-sitter.wasm") {
        const url = new URL("./wasm/tree-sitter.wasm", import.meta.url);
        return stripFileProtocol(url.href);
      }
      return prefix + path;
    },
  });
  const parser = new Parser();
  const language = await Parser.Language.load(
    stripFileProtocol(parserUrl(type).href)
  );
  parser.setLanguage(language);
  return parser;
}

export const parser = await createParser(Target.TypeScript);
