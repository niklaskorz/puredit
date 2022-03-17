import { autocompletion } from "@codemirror/autocomplete";
import { basicSetup } from "@codemirror/basic-setup";
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import type { CodeEditor } from "@jupyterlab/codeeditor";
import type { IDisposable } from "@lumino/disposable";
import type { ISignal } from "@lumino/signaling";
import { completions, projectionPlugin } from "@puredit/projections";
import * as uuid from "uuid";
import { projectionPluginConfig } from "./projections";

export class Editor implements CodeEditor.IEditor {
  view: EditorView;

  constructor(private options: CodeEditor.IOptions) {
    this.uuid = options.uuid || uuid.v4();
    this.view = new EditorView({
      parent: options.host,
      state: EditorState.create({
        doc: options.model.value.text,
        extensions: [
          basicSetup,
          indentUnit.of("    "),
          keymap.of([indentWithTab]),
          python(),
          projectionPlugin(projectionPluginConfig),
          autocompletion({
            activateOnTyping: true,
            override: [completions],
          }),
        ],
      }),
    });
  }

  /// IEditor implementation

  get edgeRequested(): ISignal<CodeEditor.IEditor, CodeEditor.EdgeLocation> {
    return {
      connect: () => true,
      disconnect: () => true,
    };
  }

  get selectionStyle(): CodeEditor.ISelectionStyle {
    return {
      className: "",
      displayName: "",
      color: "",
    };
  }

  set selectionStyle(newValue: CodeEditor.ISelectionStyle) {
    return;
  }

  get host(): HTMLElement {
    return this.options.host;
  }

  get model(): CodeEditor.IModel {
    return this.options.model;
  }

  get lineHeight(): number {
    return 14;
  }

  get charWidth(): number {
    return 14;
  }

  get lineCount(): number {
    return 14;
  }

  getOption<K extends keyof CodeEditor.IConfig>(
    option: K
  ): CodeEditor.IConfig[K] {
    return this.options.config?.[option] as any;
  }

  setOption<K extends keyof CodeEditor.IConfig>(
    option: K,
    value: CodeEditor.IConfig[K]
  ): void {
    this.options.config = Object.assign({}, this.options.config, {
      [option]: value,
    });
  }

  setOptions(options: Partial<CodeEditor.IConfig>): void {
    this.options.config = Object.assign({}, this.options.config, options);
  }

  getLine(line: number): string | undefined {
    return undefined;
  }

  getOffsetAt(position: CodeEditor.IPosition): number {
    return 0;
  }

  getPositionAt(offset: number): CodeEditor.IPosition | undefined {
    return undefined;
  }

  undo(): void {
    return;
  }

  redo(): void {
    return;
  }

  clearHistory(): void {
    return;
  }

  focus(): void {
    return;
  }

  hasFocus(): boolean {
    return false;
  }

  blur(): void {
    return;
  }

  refresh(): void {
    return;
  }

  resizeToFit(): void {
    return;
  }

  addKeydownHandler(handler: CodeEditor.KeydownHandler): IDisposable {
    return {
      isDisposed: false,
      dispose(this: { isDisposed: boolean }) {
        this.isDisposed = true;
      },
    };
  }

  setSize(size: CodeEditor.IDimension | null): void {
    return;
  }

  revealPosition(position: CodeEditor.IPosition): void {
    return;
  }

  revealSelection(selection: CodeEditor.IRange): void {
    return;
  }

  getCoordinateForPosition(
    position: CodeEditor.IPosition
  ): CodeEditor.ICoordinate {
    return {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      toJSON: (() => this) as any,
    };
  }

  getPositionForCoordinate(
    coordinate: CodeEditor.ICoordinate
  ): CodeEditor.IPosition | null {
    return null;
  }

  newIndentedLine(): void {
    return;
  }

  getTokenForPosition(position: CodeEditor.IPosition): CodeEditor.IToken {
    return {
      value: "",
      offset: 0,
    };
  }

  getTokens(): CodeEditor.IToken[] {
    return [];
  }

  replaceSelection(text: string) {
    return;
  }

  /// ISelectionOwner implementation

  uuid: string;

  getCursorPosition(): CodeEditor.IPosition {
    return {
      line: 0,
      column: 0,
    };
  }

  setCursorPosition(position: CodeEditor.IPosition): void {
    return;
  }

  getSelection(): CodeEditor.IRange {
    return { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } };
  }

  setSelection(selection: CodeEditor.IRange): void {
    return;
  }

  getSelections(): CodeEditor.IRange[] {
    return [];
  }

  setSelections(selections: CodeEditor.IRange[]): void {
    return;
  }

  /// IDisposable implementation

  isDisposed = false;

  dispose(): void {
    this.isDisposed = true;
    this.view.destroy();
  }
}
