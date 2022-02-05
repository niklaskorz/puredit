import { parser as jsParser } from "@lezer/javascript";
import { parser as pythonParser } from "@lezer/python";

export const parser = jsParser.configure({
  dialect: "ts",
});

export { pythonParser };
