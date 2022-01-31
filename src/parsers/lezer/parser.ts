import { parser as jsParser } from "@lezer/javascript";

export const parser = jsParser.configure({
  dialect: "ts",
});
