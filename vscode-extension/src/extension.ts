import * as vscode from 'vscode';
import { DbSampleEditorProvider } from './dbSampleEditor';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(DbSampleEditorProvider.register(context));
}
