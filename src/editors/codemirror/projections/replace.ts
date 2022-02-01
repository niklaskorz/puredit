import type { EditorState, EditorView } from "@codemirror/basic-setup";
import { arg, Match, pattern } from "../../../parsers/lezer";
import { ProjectionWidget } from "./projection";
import { bold } from "./shared";
import { TextWidget } from "./text";

export const [replaceOperationPattern, replaceOperationDraft] = pattern`table
  .column(${arg("column", "string")})
  .replace(
    ${arg("target", "string")},
    ${arg("replacement", "string")}
  );`;

export class ReplaceOperationWidget extends ProjectionWidget<Match> {
  private column!: TextWidget;
  private target!: TextWidget;
  private replacement!: TextWidget;

  protected initialize({ args }: Match, state: EditorState): HTMLElement {
    this.column = new TextWidget(this.isNew, args.column, state);
    this.target = new TextWidget(this.isNew, args.target, state);
    this.replacement = new TextWidget(this.isNew, args.replacement, state);
    return document.createElement("span");
  }

  protected update({ args }: Match, state: EditorState): void {
    this.column.set(args.column, state);
    this.target.set(args.target, state);
    this.replacement.set(args.replacement, state);
  }

  public focus(): void {
    this.column.focus();
  }

  toDOM(view: EditorView): HTMLElement {
    const dom = super.toDOM(view);
    dom.classList.add("inline-flex");
    dom.append(
      bold("replace "),
      this.target.toDOM(view),
      bold(" in column "),
      this.column.toDOM(view),
      bold(" with "),
      this.replacement.toDOM(view)
    );
    this.focusIfNew();
    return dom;
  }
}
