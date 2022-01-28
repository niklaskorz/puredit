import type { EditorState } from "@codemirror/basic-setup";
import { EditorView, WidgetType } from "@codemirror/view";
import type { NodeType } from "@lezer/common";

export abstract class ProjectionWidget<T> extends WidgetType {
  private dom: HTMLElement;
  protected view: EditorView | null = null;

  constructor(protected data: T) {
    super();
    this.dom = this.initialize(data);
    this.update(data);
  }

  set(data: T) {
    this.data = data;
    this.update(data);
  }

  protected abstract initialize(data: T): HTMLElement;
  protected abstract update(data: T): void;

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
}

interface ProjectionWidgetClass<T> {
  new (data: T): ProjectionWidget<T>;
}

export interface Projection<T> {
  Widget: ProjectionWidgetClass<T>;
  extractData(state: EditorState, type: NodeType, from: number, to: number): T;
}
