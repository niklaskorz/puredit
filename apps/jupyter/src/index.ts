import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from "@jupyterlab/application";
import { ICommandPalette, MainAreaWidget } from "@jupyterlab/apputils";
import { CodeCell } from "@jupyterlab/cells";
import { IEditorServices } from "@jupyterlab/codeeditor";
import { editorServices } from "@jupyterlab/codemirror";
import { IEditorTracker } from "@jupyterlab/fileeditor";
import { NotebookPanel, StaticNotebook } from "@jupyterlab/notebook";
import { Widget } from "@lumino/widgets";

/**
 * Initialization data for the puredit extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "puredit:plugin",
  autoStart: true,
  requires: [ICommandPalette, IEditorTracker],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    editorTracker: IEditorTracker
  ) => {
    console.log("JupyterLab extension puredit is activated!");

    // Create a blank content widget inside of a MainAreaWidget
    const content = new Widget();
    const widget = new MainAreaWidget({ content });
    widget.id = "puredit-jupyterlab";
    widget.title.label = "Puredit";
    widget.title.closable = true;

    // Add an application command
    const command = "puredit:open";
    app.commands.addCommand(command, {
      label: "Puredit Editor",
      execute: () => {
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, "main");
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      },
    });

    // Add the command to the palette.
    palette.addItem({ command, category: "Puredit" });
  },
};

plugin;

class ContentFactory extends NotebookPanel.ContentFactory {
  createCodeCell(options: CodeCell.IOptions, parent: StaticNotebook): CodeCell {
    const cell = super.createCodeCell(options, parent);
    cell.addClass("my-class");
    console.log("Creating code cell:", cell);
    return cell;
  }
}

const factory: JupyterFrontEndPlugin<NotebookPanel.IContentFactory> = {
  id: "puredit:factory",
  provides: NotebookPanel.IContentFactory,
  requires: [IEditorServices],
  autoStart: true,
  activate: (app: JupyterFrontEnd, editorServices: IEditorServices) => {
    console.log("JupyterLab extension puredit is activated!");

    return new ContentFactory({
      editorFactory(options) {
        console.log("editorFactory", options);
        return editorServices.factoryService.newInlineEditor(options);
      },
    });
  },
};

factory;

const services: JupyterFrontEndPlugin<IEditorServices> = {
  id: "puredit:services",
  provides: IEditorServices,
  activate(app: JupyterFrontEnd): IEditorServices {
    return {
      factoryService: editorServices.factoryService,
      mimeTypeService: editorServices.mimeTypeService,
    };
  },
};

services;

export default factory;
