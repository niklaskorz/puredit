import { arg } from "@puredit/parser";
import type { Projection } from "@puredit/projections/types";
import { simpleProjection } from "@puredit/simple-projection";
import { pythonParser } from "./parser";

const x = arg("x", "identifier");
const y = arg("y", "identifier");
const xRight = arg("xRight", "identifier");
const yRight = arg("yRight", "identifier");

export const [pattern, draft] = pythonParser.statementPattern`
${x}, ${y} = ${yRight}, ${xRight}
`;

pattern.matchIf = (args) => {
  return args.x.text === args.xRight.text && args.y.text === args.yRight.text;
};

export const widget = simpleProjection([
  "swap",
  [x, xRight],
  "and",
  [y, yRight],
]);

export const swapProjection: Projection = {
  name: "swap variables",
  description: "Swaps two variables",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
