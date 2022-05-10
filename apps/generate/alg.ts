import { Parser, Target } from "@puredit/parser";
import { scanCode } from "./code.js";
import { scanProjections } from "./projections.js";
import { serializePattern, serializeProjection } from "./serialize.js";
import { connectVariables, setVariableNames } from "./variables.js";

export {};

const parser = await Parser.load(Target.TypeScript);

const code = [
  'table["name"] = table["name"].replace("Mister", "Mr.");',
  'table["title"] = table["title"].replace("Doctor", "Dr.");',
  'table["address"] = table["address"].replace("Road", "Rd.");',
].map((s) => parser.parse(s));

const projections = [
  "replace Mister with Mr. in column name",
  "replace Doctor with Dr. in column title",
  "replace Road with Rd. in column address",
].map((s) => s.split(" "));

const projection = scanProjections(projections);

const { pattern, variables } = scanCode(code);

const connections = connectVariables(code, projections, variables, projection);
setVariableNames(projection, connections);

console.log(serializePattern(code[0], pattern, variables));
console.log(serializeProjection(projection));
