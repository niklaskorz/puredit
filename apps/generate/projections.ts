import { Diff } from "mdiff";

export function scanProjections(samplesRaw: string[]): string[] {
  const samples = samplesRaw.map((s) => s.split(" "));
  let result = samples[0];
  for (let i = 1; i < samples.length; i++) {
    const diff = new Diff(result, samples[i]);
    const nextResult = [];
    let variableCount = 0;
    diff.scanCommon((fromA, toA, fromB, toB) => {
      nextResult.push(...result.slice(fromA, toA));
      if (toA < result.length || toB < samples[i].length) {
        nextResult.push(`__var_${variableCount++}`);
      }
    });
    result = nextResult;
  }
  return result;
}
