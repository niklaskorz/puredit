import parseArgv from "yargs/yargs";
import path from "path";
import fs from "fs";
import { Parser, Target } from "@puredit/parser";
import { scanCode } from "./code.js";
import { scanProjections } from "./projections.js";
import { serializePattern } from "./serialize.js";
import { componentTemplate, definitionTemplate } from "./templates.js";
import { connectVariables, setVariableNames } from "./variables.js";
import { capitalize } from "@puredit/utils";

export {};

const argNames = [
  "language",
  "parser-name",
  "parser-module",
  "projection-name",
  "samples",
  "target-dir",
];

const args = parseArgv(process.argv.slice(2))
  .string(argNames)
  .demandOption(argNames).argv;

if (!Object.values(Target).includes(args.language as Target)) {
  console.error("Parameter --language must be one of", Object.values(Target));
  process.exit(1);
}

const parser = await Parser.load(args.language as Target);

// Ensure we are running from the root directory of the monorepo
process.chdir("../..");

let doubleNewline = "\n\n";
if (process.platform === "win32") {
  doubleNewline = "\r\n\r\n";
}

const samplesRaw = fs.readFileSync(args.samples, { encoding: "utf-8" });
const [codeRaw, projectionsRaw] = samplesRaw.split(
  `${doubleNewline}---${doubleNewline}`
);

const code = codeRaw.split(doubleNewline).map((sample) => parser.parse(sample));
const projections = projectionsRaw
  .split(doubleNewline)
  .map((sample) => sample.trim().split(" "));

const projection = scanProjections(projections);

const { pattern, variables } = scanCode(code);

const connections = connectVariables(code, projections, variables, projection);
setVariableNames(projection, connections);

const definitionPath = path.join(
  args.targetDir,
  `${args.projectionName}Projection.ts`
);
fs.writeFileSync(
  definitionPath,
  definitionTemplate({
    parserName: args.parserName,
    parserModule: args.parserModule,
    prefix: args.projectionName,
    codeTemplate: serializePattern(code[0], pattern, variables),
  })
);

const componentPath = path.join(
  args.targetDir,
  `${capitalize(args.projectionName)}Projection.svelte`
);
fs.writeFileSync(componentPath, componentTemplate(projection));
