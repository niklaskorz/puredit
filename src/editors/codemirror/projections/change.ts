import type { EditorState, EditorView } from "@codemirror/basic-setup";
import { arg, block, pattern, Match } from "../../../parsers/lezer";
import { ProjectionWidget } from "./projection";
import { bold } from "./shared";
import { TextWidget } from "./text";

export const changeBlockPattern = pattern`
  db.change(${arg("table", "string")}, (table) => ${block()});
`;

export class ChangeBlockWidget extends ProjectionWidget<Match> {
  private table!: TextWidget;

  protected initialize({ args }: Match, state: EditorState): HTMLElement {
    this.table = new TextWidget(this.isNew, args.table, state);
    return document.createElement("span");
  }

  protected update({ args }: Match, state: EditorState): void {
    this.table.set(args.table, state);
  }

  toDOM(view: EditorView): HTMLElement {
    const dom = super.toDOM(view);
    dom.classList.add("inline-flex");
    dom.append(bold("change table "), this.table.toDOM(view));
    return dom;
  }
}

export class ChangeBlockEndWidget extends ProjectionWidget<Match> {
  protected initialize({ args }: Match, state: EditorState): HTMLElement {
    return document.createElement("span");
  }

  protected update({ args }: Match, state: EditorState): void {}

  toDOM(view: EditorView): HTMLElement {
    const dom = super.toDOM(view);
    dom.append(bold("end change"));
    return dom;
  }
}
