import type { Tree } from "web-tree-sitter";
import { Diff } from "mdiff";
import { assert, zip } from "@puredit/utils";
import { selectDeepChild } from "./path";
import { ProjectionSegment, ProjectionVariable } from "./projections";

export function connectVariables(
  codeSamples: Tree[],
  projectionSamples: string[][],
  variables: number[][],
  projection: ProjectionSegment[]
): number[] {
  const solutions: number[][] = [];

  for (const [codeSample, projectionSample] of zip(
    codeSamples,
    projectionSamples
  )) {
    const diff = new Diff(projectionSample, projection);
    const projectionVariables: string[] = [];
    const projectionVariableIndices: number[] = [];
    diff.scanDiff((fromA, toA, fromB, toB) => {
      assert(fromB === toB - 1, "invalid projection");
      assert(
        (projection[fromB] as any).type === "variable",
        "unknown projection segment"
      );
      projectionVariables.push(projectionSample.slice(fromA, toA).join(" "));
      projectionVariableIndices.push(fromB);
    });

    for (let i = 0; i < variables.length; i++) {
      const cursor = codeSample.walk();
      assert(
        selectDeepChild(cursor, variables[i]),
        "wrong combination of code samples and variable path"
      );
      let value = cursor.nodeText;
      if (cursor.nodeType === "string") {
        value = value.slice(1, value.length - 1);
      }
      const candidates: number[] = [];
      for (let j = 0; j < projectionVariables.length; j++) {
        if (projectionVariables[j] === value) {
          candidates.push(projectionVariableIndices[j]);
        }
      }
      if (solutions.length > i) {
        solutions[i] = union(solutions[i], candidates);
      } else {
        solutions.push(candidates);
      }
    }
  }

  const result: number[] = [];
  for (let i = 0; i < variables.length; i++) {
    assert(
      solutions[i].length <= 1,
      `no unique solution for variable at index ${i}, please provide more/better samples`
    );
    if (solutions[i].length) {
      result.push(solutions[i][0]);
    } else {
      result.push(-1);
    }
  }
  return result;
}

function union(a: number[], b: number[]): number[] {
  return a.filter((x) => b.includes(x));
}

export function setVariableNames(
  projection: ProjectionSegment[],
  connections: number[]
) {
  let i = 0;
  for (const connection of connections) {
    const name = `var${i++}`;
    if (connection >= 0) {
      const segment = projection[connection] as ProjectionVariable;
      assert(
        segment.type === "variable",
        "projection segment is not a variable"
      );
      segment.names.push(name);
    }
  }
}
