import type { LRParser } from "@lezer/lr";
import { parser as jsParser } from "@lezer/javascript";
import { parser as pyParser } from "@lezer/python";

function selectParser(type: string): LRParser {
  switch (type) {
    case "ts":
      return jsParser.configure({
        dialect: "ts",
      });
    case "py":
      return pyParser;
  }
  throw new Error("unknown parser " + type);
}

export const parser = selectParser("py");
