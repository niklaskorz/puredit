import type { EditorState, EditorView } from "@codemirror/basic-setup";
import { arg, Match, pattern } from "../../../parsers/lezer";
import { ProjectionWidget } from "./projection";
import { TextWidget } from "./text";

export const trimOperationPattern = pattern`
  table.column(${arg("column", "string")}).trim(
    ${arg("direction", "string")},
  );
`;

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

  toDOM(view: EditorView): HTMLElement {
    const dom = super.toDOM(view);
    dom.classList.add("inline-flex");
    dom.append(
      "trim column ",
      this.column.toDOM(view),
      " on ",
      this.direction.toDOM(view)
    );
    return dom;
  }
}
