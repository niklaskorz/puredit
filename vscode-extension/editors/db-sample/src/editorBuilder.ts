import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import {
  Annotation,
  type Extension,
  type Transaction,
} from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { autocompletion } from "@codemirror/autocomplete";
import {
  projectionPlugin,
  completions,
  type ProjectionPluginConfig,
} from "@puredit/projections";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  typescript,
  completionSource as typescriptCompletionSource,
} from "@puredit/codemirror-typescript";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { MessageType, mapChangeSetToChanges } from "@puredit/editor-interface";

export class ProjectionalEditorBuilder {
  private extenstions: Extension[] = [];
  private parent: Element | DocumentFragment;
  readonly isInit = Annotation.define<boolean>();

  constructor() {
    this.addBasicExtensions()
      .addOpticalExtensions()
      .addExtensions(
        typescript({ disableCompletions: true, disableTooltips: true }),
        autocompletion({
          activateOnTyping: true,
          override: [completions, typescriptCompletionSource],
        })
      );
  }

  private addBasicExtensions(): ProjectionalEditorBuilder {
    this.addExtensions(basicSetup, keymap.of([indentWithTab]));
    return this;
  }

  private addOpticalExtensions(): ProjectionalEditorBuilder {
    this.addExtensions(
      oneDark,
      indentationMarkers(),
      EditorView.theme({
        ".cm-scroller": {
          fontFamily: "var(--mono-font, monospace)",
          fontSize: "14px",
        },
        ".cm-tooltip": {
          fontFamily: "var(--system-font, sans-serif)",
        },
      })
    );
    return this;
  }

  private getDispatchFunction() {
    return (transactions: readonly Transaction[], view: EditorView) => {
      transactions.forEach((transaction) => {
        if (
          !transaction.changes.empty &&
          !transaction.annotation(this.isInit)
        ) {
          const changes = mapChangeSetToChanges(transaction.changes);
          changes.forEach((change) => {
            const lineFromBefore = view.state.doc.lineAt(change.fromBefore);
            const lineToBefore = view.state.doc.lineAt(change.toBefore);
            change.setLinesBefore(lineFromBefore, lineToBefore);
          });

          view.update(transactions);

          changes.forEach((change) => {
            const lineFromAfter = view.state.doc.lineAt(change.fromAfter);
            const lineToAfter = view.state.doc.lineAt(change.toAfter);
            change.setLinesAfter(lineFromAfter, lineToAfter);
            change.computeLineInfo();
            vscode.postMessage({
              type: MessageType.UPDATE_DOCUMENT,
              payload: change.toChangePayload(),
            });
          });
        } else {
          view.update(transactions);
        }
      });
    };
  }

  configureProjectionPlugin(
    config: ProjectionPluginConfig
  ): ProjectionalEditorBuilder {
    this.addExtensions(projectionPlugin(config));
    return this;
  }

  addExtensions(...extensions: Extension[]): ProjectionalEditorBuilder {
    this.extenstions.push(...extensions);
    return this;
  }

  setParent(parent: Element | DocumentFragment) {
    this.parent = parent;
    return this;
  }

  build(): EditorView {
    return new EditorView({
      state: EditorState.create({
        extensions: this.extenstions,
      }),
      parent: this.parent,
      dispatchTransactions: this.getDispatchFunction(),
    });
  }
}
