import App from "./App.svelte";

(window as any).MonacoEnvironment = {
  getWorkerUrl(_moduleId: string, label: string) {
    if (label === "json") {
      return "/monaco-editor/esm/vs/language/json/json.worker.js";
    }
    if (label === "css" || label === "scss" || label === "less") {
      return "/monaco-editor/esm/vs/language/css/css.worker.js";
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return "/monaco-editor/esm/vs/language/html/html.worker.js";
    }
    if (label === "typescript" || label === "javascript") {
      return "/monaco-editor/esm/vs/language/typescript/ts.worker.js";
    }
    return "/monaco-editor/esm/vs/editor/editor.worker.js";
  },
};

var app = new App({
  target: document.body,
});

export default app;

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}
