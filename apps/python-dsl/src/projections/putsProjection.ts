import { arg } from "@puredit/parser";
import { svelteProjection } from "@puredit/projections/svelte";
import type { Projection } from "@puredit/projections/types";
import PutsProjection from "./PutsProjection.svelte";
import { pythonParser } from "./parser";

const anything = arg("anything", "string");

// todo: how to use here the f-strings for variable interpolation?
// like: print(f"VarX is {VarX}").
// Just using 'print(${anything})' does not work.
export const [pattern, draft] = pythonParser.statementPattern`
print(${anything}, end="")
`;

export const widget = svelteProjection(PutsProjection);

export const putsProjection: Projection = {
  name: "puts",
  description: "Prints string to console without newline",
  pattern,
  draft,
  requiredContextVariables: [],
  widgets: [widget],
};
