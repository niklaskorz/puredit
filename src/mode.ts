export enum EditorMode {
  ProjectionReplacesCode = "projection-replaces-code",
  CodeOnly = "code-only",
  Hybrid = "hybrid",
}

let mode = EditorMode.ProjectionReplacesCode;
let modeParam = new URLSearchParams(location.search).get("mode");
switch (modeParam) {
  case "projection-replaces-code":
    mode = EditorMode.ProjectionReplacesCode;
    break;
  case "code-only":
    mode = EditorMode.CodeOnly;
    break;
  case "hybrid":
    mode = EditorMode.Hybrid;
    break;
}
console.log("mode:", mode);

export { mode };
