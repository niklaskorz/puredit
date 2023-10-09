import Parser from "web-tree-sitter";

export enum Target {
  TypeScript = "ts",
  Python = "py",
}

const VSCODE_BASE_PATH = "https://file+.vscode-resource.vscode-cdn.net";

/**
 * Removes the `file://` protocol prefix.
 * Required for using `new URL(url, import.meta.url)` in jest / node.
 */
function stripFileProtocol(href: string): string {
  if (typeof process !== "undefined" && process.platform === "win32") {
    return href.replace(/^file:\/\/\//, "");
  }
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

function parserUrlVscode(target: Target): string {
  switch (target) {
    case Target.TypeScript:
      return "./wasm/tree-sitter-typescript.wasm";
    case Target.Python:
      return "./wasm/tree-sitter-python.wasm";
  }
}

function runningInVsCode(): boolean {
  return import.meta.url.startsWith(VSCODE_BASE_PATH);
}

export async function createParser(type: Target): Promise<Parser> {
  await Parser.init({
    locateFile(path: string, prefix: string) {
      if (path === "tree-sitter.wasm" && !runningInVsCode()) {
        const url = new URL("./wasm/tree-sitter.wasm", import.meta.url);
        return stripFileProtocol(url.href);
      } else if (path === "tree-sitter.wasm" && runningInVsCode()) {
        return "./wasm/tree-sitter.wasm";
      }
      return prefix + path;
    },
  });
  const parser = new Parser();
  let languagePath;
  if (runningInVsCode()) {
    languagePath = parserUrlVscode(type);
  } else {
    languagePath = parserUrl(type).href;
  }
  const language = await Parser.Language.load(stripFileProtocol(languagePath));
  parser.setLanguage(language);
  return parser;
}

export type { Parser };
