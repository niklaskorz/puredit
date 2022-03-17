import type { JupyterFrontEndPlugin } from "@jupyterlab/application";
import { NotebookPanel } from "@jupyterlab/notebook";
import { Editor } from "./editor";

/**
 * Initialization data for the puredit extension.
 */

const plugin: JupyterFrontEndPlugin<NotebookPanel.IContentFactory> = {
  id: "puredit:plugin",
  provides: NotebookPanel.IContentFactory,
  requires: [],
  autoStart: true,
  activate() {
    console.log("JupyterLab extension puredit is activated!");
    return new NotebookPanel.ContentFactory({
      editorFactory(options) {
        console.log("editorFactory", options);
        return new Editor(options);
      },
    });
  },
};

export default plugin;
