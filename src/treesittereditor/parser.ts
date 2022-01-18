import Parser from "web-tree-sitter";

await Parser.init();
const parser = new Parser();
const language = await Parser.Language.load("tree-sitter-python.wasm");
parser.setLanguage(language);

export { parser, language };
