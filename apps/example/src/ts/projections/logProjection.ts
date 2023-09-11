import { arg } from "@puredit/parser";
import type { Projection } from "@puredit/projections/types";
import { simpleProjection } from "@puredit/simple-projection";
import { tsParser } from "./parser";

const message = arg("message", "string");

export const [pattern, draft] = tsParser.statementPattern`
console.log(${message});
`;

export const widget = simpleProjection(["log", message, "to console"]);

export const logProjection: Projection = {
  name: "log message",
  description: "Log a message to the console",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
