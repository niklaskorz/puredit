import { parser, createParser, Target } from "./parser";

describe("parser", () => {
  it("loads", () => {
    expect(parser).toBeDefined();
  });
  it("can parse TypeScript code", async () => {
    const parser = await createParser(Target.TypeScript);
    expect(() => parser.parse("let x = 42;")).not.toThrow();
  });
  it("can parse Python code", async () => {
    const parser = await createParser(Target.Python);
    expect(() => parser.parse("import antigravity")).not.toThrow();
  });
});
