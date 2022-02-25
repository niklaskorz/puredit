import Parser from "web-tree-sitter";

enum Target {
  TypeScript = "ts",
  Python = "py",
}

function parserNameForTarget(target: Target): string {
  switch (target) {
    case Target.TypeScript:
      return "tree-sitter-typescript.wasm";
    case Target.Python:
      return "tree-sitter-python.wasm";
  }
}

async function createParser(type: Target): Promise<Parser> {
  await Parser.init();
  const parser = new Parser();
  const language = await Parser.Language.load(parserNameForTarget(type));
  parser.setLanguage(language);
  return parser;
}

export const parser = await createParser(Target.TypeScript);
