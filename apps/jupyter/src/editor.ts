import { autocompletion } from "@codemirror/autocomplete";
import { basicSetup } from "@codemirror/basic-setup";
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import {
  indentUnit,
  getIndentation,
  indentString,
  syntaxTree,
} from "@codemirror/language";
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import type { CodeEditor } from "@jupyterlab/codeeditor";
import type { IDisposable } from "@lumino/disposable";
import type { ISignal } from "@lumino/signaling";
import { completions, projectionPlugin } from "@puredit/projections";
import * as uuid from "uuid";
import debounce from "lodash-es/debounce";
import { projectionPluginConfig } from "./projections";
import { redo, undo } from "@codemirror/history";

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
          indentationMarkers(),
          EditorView.theme({
            ".cm-scroller": {
              fontFamily: "var(--mono-font, monospace)",
              fontSize: "14px",
              cursor: "text",
            },
            ".cm-tooltip": {
              fontFamily: "var(--system-font, sans-serif)",
            },
          }),
          python(),
          projectionPlugin(projectionPluginConfig),
          autocompletion({
            activateOnTyping: true,
            override: [completions],
          }),
          EditorState.readOnly.of(options.config?.readOnly || false),
        ],
      }),
      dispatch: (tr) => {
        this.view.update([tr]);
        if (!tr.changes.empty) {
          this.updateModelText();
        }
      },
    });
    this.updateModelText = debounce(this.updateModelText.bind(this), 10);
  }

  updateModelText() {
    this.options.model.value.text = this.view.state.sliceDoc(0);
  }

  /// IEditor implementation

  get edgeRequested(): ISignal<CodeEditor.IEditor, CodeEditor.EdgeLocation> {
    console.warn("NOT IMPLEMENTED: get Editor.edgeRequested");
    return {
      connect: () => true,
      disconnect: () => true,
    };
  }

  get selectionStyle(): CodeEditor.ISelectionStyle {
    console.warn("NOT IMPLEMENTED: get Editor.selectionStyle");
    return {
      className: "",
      displayName: "",
      color: "",
    };
  }

  set selectionStyle(newValue: CodeEditor.ISelectionStyle) {
    console.log("NOT IMPLEMENTED: set Editor.selectionStyle", newValue);
  }

  get host(): HTMLElement {
    return this.options.host;
  }

  get model(): CodeEditor.IModel {
    return this.options.model;
  }

  get lineHeight(): number {
    return this.view.defaultLineHeight;
  }

  get charWidth(): number {
    return this.view.defaultCharacterWidth;
  }

  get lineCount(): number {
    return this.view.state.doc.lines;
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
    console.log("NOT IMPLEMENTED: set config value", option, "to", value);
    this.options.config = Object.assign({}, this.options.config, {
      [option]: value,
    });
  }

  setOptions(options: Partial<CodeEditor.IConfig>): void {
    console.log("NOT IMPLEMENTED: set config to", options);
    this.options.config = Object.assign({}, this.options.config, options);
  }

  getLine(line: number): string | undefined {
    return this.view.state.doc.line(line).text;
  }

  getOffsetAt(position: CodeEditor.IPosition): number {
    const line = this.view.state.doc.line(position.line);
    return line.from + position.column;
  }

  getPositionAt(offset: number): CodeEditor.IPosition {
    const line = this.view.state.doc.lineAt(offset);
    const column = offset - line.from;
    return { line: line.number, column };
  }

  undo(): void {
    undo(this.view);
  }

  redo(): void {
    redo(this.view);
  }

  clearHistory(): void {
    console.warn("NOT IMPLEMENTED: Editor.clearHistory");
  }

  focus(): void {
    console.log("focus editor");
    this.view.focus();
  }

  hasFocus(): boolean {
    // EditorView.hasFocus cannot be used here as it
    // does not consider the projection fields, although they are
    // children of the editor element.
    return this.view.contentDOM.contains(document.activeElement);
  }

  blur(): void {
    console.log("blur editor");
    this.view.contentDOM.blur();
  }

  refresh(): void {
    this.view.requestMeasure();
  }

  resizeToFit(): void {
    this.view.requestMeasure();
  }

  addKeydownHandler(handler: CodeEditor.KeydownHandler): IDisposable {
    console.warn("NOT IMPLEMENTED: Editor.addKeyDownHandler", handler);
    return {
      isDisposed: false,
      dispose(this: { isDisposed: boolean }) {
        this.isDisposed = true;
      },
    };
  }

  setSize(size: CodeEditor.IDimension | null): void {
    console.warn("NOT IMPLEMENTED: Editor.setSize", size);
  }

  revealPosition(position: CodeEditor.IPosition): void {
    this.view.scrollPosIntoView(this.getOffsetAt(position));
  }

  revealSelection(selection: CodeEditor.IRange): void {
    this.view.scrollPosIntoView(this.getOffsetAt(selection.start));
  }

  getCoordinateForPosition(
    position: CodeEditor.IPosition
  ): CodeEditor.ICoordinate {
    const pos = this.getOffsetAt(position);
    const rect = this.view.coordsAtPos(pos);
    return {
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      x: rect.left,
      y: rect.top,
      width: rect.left - rect.right,
      height: rect.top - rect.bottom,
      toJSON: (() => this) as any,
    };
  }

  getPositionForCoordinate(
    coordinate: CodeEditor.ICoordinate
  ): CodeEditor.IPosition | null {
    const pos = this.view.posAtCoords(coordinate);
    return this.getPositionAt(pos);
  }

  newIndentedLine(): void {
    const from = this.view.state.selection.main.anchor;
    const indentation = getIndentation(this.view.state, from);
    this.view.dispatch({
      changes: {
        from,
        insert: "\n" + indentString(this.view.state, indentation),
      },
    });
  }

  getTokenForPosition(position: CodeEditor.IPosition): CodeEditor.IToken {
    const tree = syntaxTree(this.view.state);
    const cursor = tree.cursor(this.getOffsetAt(position));
    return {
      value: this.view.state.sliceDoc(cursor.from, cursor.to),
      offset: cursor.from,
    };
  }

  getTokens(): CodeEditor.IToken[] {
    console.warn("NOT IMPLEMENTED: Editor.getTokens");
    return [];
  }

  replaceSelection(text: string) {
    this.view.state.replaceSelection(text);
  }

  /// ISelectionOwner implementation

  uuid: string;

  getCursorPosition(): CodeEditor.IPosition {
    const range = this.view.state.selection.main;
    return this.getPositionAt(range.anchor);
  }

  setCursorPosition(position: CodeEditor.IPosition): void {
    this.view.dispatch({
      selection: EditorSelection.cursor(this.getOffsetAt(position)),
    });
  }

  getSelection(): CodeEditor.IRange {
    const range = this.view.state.selection.main;
    const start = this.getPositionAt(range.from);
    const end = this.getPositionAt(range.to);
    return { start, end };
  }

  setSelection(selection: CodeEditor.IRange): void {
    this.view.dispatch({
      selection: EditorSelection.single(
        this.getOffsetAt(selection.start),
        this.getOffsetAt(selection.end)
      ),
    });
  }

  getSelections(): CodeEditor.IRange[] {
    return this.view.state.selection.ranges.map((range) => ({
      start: this.getPositionAt(range.from),
      end: this.getPositionAt(range.to),
    }));
  }

  setSelections(selections: CodeEditor.IRange[]): void {
    this.view.dispatch({
      selection: EditorSelection.create(
        selections.map((selection) =>
          EditorSelection.range(
            this.getOffsetAt(selection.start),
            this.getOffsetAt(selection.end)
          )
        )
      ),
    });
  }

  /// IDisposable implementation

  isDisposed = false;

  dispose(): void {
    this.isDisposed = true;
    this.view.destroy();
  }
}
