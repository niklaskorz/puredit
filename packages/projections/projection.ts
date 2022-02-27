import type { EditorState } from "@codemirror/state";
import { EditorView, WidgetType } from "@codemirror/view";
import type { Match } from "@puredit/parser";

export abstract class ProjectionWidget extends WidgetType {
  private dom: HTMLElement;
  protected view: EditorView | null = null;

  constructor(
    protected isNew: boolean,
    public match: Match,
    context: object,
    state: EditorState
  ) {
    super();
    this.dom = this.initialize(match, context, state);
    this.update(match, context, state);
  }

  set(match: Match, context: object, state: EditorState) {
    this.isNew = false;
    this.match = match;
    this.update(match, context, state);
  }

  protected abstract initialize(
    match: Match,
    context: object,
    state: EditorState
  ): HTMLElement;

  protected abstract update(
    match: Match,
    context: object,
    state: EditorState
  ): void;

  get position(): number | undefined {
    return this.view?.posAtDOM(this.dom);
  }

  eq(other: ProjectionWidget): boolean {
    return other.match === this.match;
  }

  toDOM(view: EditorView): HTMLElement {
    this.view = view;
    return this.dom;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  destroy(_dom: HTMLElement): void {
    this.view = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ignoreEvent(_event: Event): boolean {
    return true;
  }

  enterFromStart(): boolean {
    return false;
  }

  enterFromEnd(): boolean {
    return false;
  }
}

export interface ProjectionWidgetClass {
  new (
    isNew: boolean,
    match: Match,
    context: unknown,
    state: EditorState
  ): ProjectionWidget;
}
