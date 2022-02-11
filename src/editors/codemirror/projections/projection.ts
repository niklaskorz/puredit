import type { EditorState } from "@codemirror/basic-setup";
import { EditorView, WidgetType } from "@codemirror/view";

export abstract class ProjectionWidget<T> extends WidgetType {
  private dom: HTMLElement;
  protected view: EditorView | null = null;

  constructor(protected isNew: boolean, protected data: T, state: EditorState) {
    super();
    this.dom = this.initialize(data, state);
    this.update(data, state);
  }

  set(data: T, state: EditorState) {
    this.isNew = false;
    this.data = data;
    this.update(data, state);
  }

  protected abstract initialize(data: T, state: EditorState): HTMLElement;
  protected abstract update(data: T, state: EditorState): void;

  get position(): number | undefined {
    return this.view?.posAtDOM(this.dom);
  }

  eq(other: ProjectionWidget<T>): boolean {
    return other.data === this.data;
  }

  toDOM(view: EditorView): HTMLElement {
    this.view = view;
    return this.dom;
  }

  destroy(_dom: HTMLElement): void {
    this.view = null;
  }

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

export interface ProjectionWidgetClass<T> {
  new (isNew: boolean, data: T, state: EditorState): ProjectionWidget<T>;
}
