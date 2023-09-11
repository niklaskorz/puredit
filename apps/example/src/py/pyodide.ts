import type { PyodideInterface } from "pyodide";
import { loadPyodide } from "pyodide";
import { mathDsl } from "./code";

const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/";

let pendingPyodide: Promise<PyodideInterface> | undefined;

export interface PythonResult {
  output: string;
  error?: Error;
}

async function setupPyodide(): Promise<PyodideInterface> {
  const pyodide = await loadPyodide({ indexURL });
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("sympy-latex-parser");
  await pyodide.loadPackage("numpy");
  await pyodide.loadPackagesFromImports(mathDsl);
  pyodide.FS.writeFile("mathdsl.py", mathDsl);
  return pyodide;
}

export async function runPython(source: string): Promise<PythonResult> {
  const output: string[] = [];

  try {
    if (!pendingPyodide) {
      pendingPyodide = setupPyodide();
    }
    const pyodide = await pendingPyodide;

    pyodide.setStderr({
      batched(a) {
        output.push(a);
      },
    });
    pyodide.setStdout({
      batched(a) {
        output.push(a);
      },
    });

    await pyodide.loadPackagesFromImports(source);
    await pyodide.runPythonAsync(source, { locals: pyodide.toPy({}) });
  } catch (error) {
    if (error instanceof Error) {
      return { output: output.join("\n"), error };
    } else {
      throw error;
    }
  }

  return { output: output.join("\n") };
}
