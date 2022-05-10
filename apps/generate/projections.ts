import { Diff } from "mdiff";

export interface ProjectionVariable {
  type: "variable";
  names: string[];
}

export type ProjectionSegment = ProjectionVariable | string;

export function scanProjections(samples: string[][]): ProjectionSegment[] {
  let result: ProjectionSegment[] = samples[0];
  for (let i = 1; i < samples.length; i++) {
    const diff = new Diff(result, samples[i]);
    const nextResult: ProjectionSegment[] = [];
    diff.scanCommon((fromA, toA, fromB, toB) => {
      nextResult.push(...result.slice(fromA, toA));
      if (toA < result.length || toB < samples[i].length) {
        nextResult.push({ type: "variable", names: [] });
      }
    });
    result = nextResult;
  }
  return result;
}
