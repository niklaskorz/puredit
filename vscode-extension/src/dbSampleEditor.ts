import * as vscode from "vscode";
import * as path from "path";
import { getNonce } from "./util";
import { ChangePayload, ChangeType, Message } from "@puredit/editor-interface";
import { MessageType } from "@puredit/editor-interface";

export class DbSampleEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new DbSampleEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      DbSampleEditorProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  private static readonly viewType = "pureditcode.dbSampleEditor";

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    webviewPanel.webview.onDidReceiveMessage((message: Message) => {
      if (message.type === MessageType.GET_DOCUMENT) {
        webviewPanel.webview.postMessage({
          type: MessageType.SEND_DOCUMENT,
          payload: document.getText(),
        });
      } else if (message.type === MessageType.UPDATE_DOCUMENT) {
        const workspaceEdit = this.mapToWorkspaceEdit(
          message.payload! as ChangePayload,
          document
        );
        vscode.workspace.applyEdit(workspaceEdit);
      }
    });
  }

  private mapToWorkspaceEdit(
    changePayload: ChangePayload,
    document: vscode.TextDocument
  ): vscode.WorkspaceEdit {
    const workspaceEdit = new vscode.WorkspaceEdit();
    if (changePayload.type === ChangeType.INSERTION) {
      const position = new vscode.Position(
        changePayload.lineFrom,
        changePayload.characterFrom
      );
      workspaceEdit.insert(document.uri, position, changePayload.inserted);
    } else if (changePayload.type === ChangeType.REPLACEMENT) {
      const range = this.buildRange(changePayload);
      workspaceEdit.replace(document.uri, range, changePayload.inserted);
    } else if (changePayload.type === ChangeType.DELETION) {
      const range = this.buildRange(changePayload);
      workspaceEdit.delete(document.uri, range);
    }
    return workspaceEdit;
  }

  private buildRange(changePayload: ChangePayload): vscode.Range {
    const positionFrom = new vscode.Position(
      changePayload.lineFrom,
      changePayload.characterFrom
    );
    const positionTo = new vscode.Position(
      changePayload.lineTo,
      changePayload.characterTo
    );
    return new vscode.Range(positionFrom, positionTo);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "out/editors/db-sample/index.js"
      )
    );

    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "out/editors/db-sample/index.css"
      )
    );

    const baseDir = path.join(__dirname, "out");
    const baseUrl = "https://file+.vscode-resource.vscode-cdn.net" + baseDir;

    const nonce = getNonce();

    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src ${webview.cspSource}; img-src ${webview.cspSource}; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'unsafe-eval' 'nonce-${nonce}' ${webview.cspSource};">
				<base href=${baseUrl}>
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleMainUri}" rel="stylesheet" />

				<title>DB Sample</title>
			</head>
			<body>
				<script nonce="${nonce}">
					const vscode = acquireVsCodeApi();
				</script>
				<script nonce="${nonce}" type="module" src="${scriptUri}"></script>
				<div id="app"></div>
			</body>
			</html>`;
  }
}
