import type { EditorState, EditorView } from "@codemirror/basic-setup";
import { arg, Match, pattern } from "../../../parsers/lezer";
import { ProjectionWidget } from "./projection";
import { bold } from "./shared";
import { TextWidget } from "./text";

export const [trimOperationPattern, trimOperationDraft] = pattern`table
  .column(${arg("column", "string")})
  .trim(${arg("direction", "string")});`;

export class TrimOperationWidget extends ProjectionWidget<Match> {
  private column!: TextWidget;
  private direction!: TextWidget;

  protected initialize({ args }: Match, state: EditorState): HTMLElement {
    this.column = new TextWidget(this.isNew, args.column, state);
    this.direction = new TextWidget(this.isNew, args.direction, state);
    return document.createElement("span");
  }

  protected update({ args }: Match, state: EditorState): void {
    this.column.set(args.column, state);
    this.direction.set(args.direction, state);
  }

  public focus(): void {
    this.column.focus();
  }

  toDOM(view: EditorView): HTMLElement {
    const dom = super.toDOM(view);
    dom.classList.add("inline-flex");
    dom.append(
      bold("trim column "),
      this.column.toDOM(view),
      bold(" on "),
      this.direction.toDOM(view)
    );
    this.focusIfNew();
    return dom;
  }
}
