import { arg } from "@puredit/parser";
import type { Projection } from "@puredit/projections/types";
import { pythonParser } from "./parser";
import { simpleProjection } from "@puredit/simple-projection";

const anything = arg("anything", "string");

// todo: how to use here the f-strings for variable interpolation?
// like: print(f"VarX is {VarX}").
// Just using 'print(${anything})' does not work.
export const [pattern, draft] = pythonParser.statementPattern`
print(${anything}, end="")
`;

export const widget = simpleProjection(["puts ", anything]);

// alternative projection def: explicit and long projection definion
// import { svelteProjection } from "@puredit/projections/svelte";
// import PutsProjection from "./PutsProjection.svelte";
// export const widget = svelteProjection(PutsProjection);

export const putsProjection: Projection = {
  name: "puts",
  description: "Prints string to console without newline",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
