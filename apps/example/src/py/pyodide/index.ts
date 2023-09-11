import type * as py from "./pyodide";

declare global {
  const loadPyodide: typeof py.loadPyodide;
}

const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.19.1/full/";

let pendingPyodide: ReturnType<typeof loadPyodide> | undefined;

export async function runPython(source: string) {
  if (!pendingPyodide) {
    pendingPyodide = loadPyodide({ indexURL });
  }
  const pyodide = await pendingPyodide;
  await pyodide.loadPackagesFromImports(source);
  await pyodide.runPythonAsync(source, pyodide.toPy({}));
}
