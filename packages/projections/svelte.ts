import type { EditorView } from "@codemirror/view";
import { EditorState, EditorSelection } from "@codemirror/state";
import type { Match } from "@puredit/parser";
import { FocusGroup } from "./focus";
import type { FocusGroupHandler } from "./focus";
import { ProjectionWidget } from "./projection";

interface Props {
  isNew: boolean;
  view: EditorView | null;
  match: Match;
  context: unknown;
  state: EditorState;
  focusGroup: FocusGroup;
}

export const svelteProjection = (Component: ComponentClass<Props>) =>
  class extends ProjectionWidget implements FocusGroupHandler {
    component!: SvelteComponent<Props>;
    focusGroup!: FocusGroup;

    protected initialize(
      match: Match,
      context: object,
      state: EditorState
    ): HTMLElement {
      const target = document.createElement("span");
      this.focusGroup = new FocusGroup(this);
      this.component = new Component({
        target,
        props: {
          isNew: this.isNew,
          view: null,
          match,
          context,
          state,
          focusGroup: this.focusGroup,
        },
      });
      return target;
    }

    protected update(match: Match, context: object, state: EditorState): void {
      this.component.$set({ isNew: this.isNew, match, context, state });
    }

    toDOM(view: EditorView): HTMLElement {
      const dom = super.toDOM(view);
      let isFocused = false;
      dom.addEventListener("focusin", () => {
        isFocused = true;
        view.dispatch({
          selection: {
            anchor: this.match.node.startIndex,
          },
        });
      });
      dom.addEventListener("focusout", () => {
        isFocused = false;
      });
      dom.addEventListener("click", () => {
        if (!isFocused) {
          view.dispatch({
            selection: {
              anchor: this.match.node.startIndex,
              head: this.match.node.endIndex,
            },
          });
        }
      });
      this.component.$set({ view });
      return dom;
    }

    destroy(dom: HTMLElement): void {
      this.component.$set({ view: null });
      this.component.$destroy();
      super.destroy(dom);
    }

    enterFromStart(): boolean {
      return this.focusGroup.first();
    }

    enterFromEnd(): boolean {
      return this.focusGroup.last();
    }

    onLeaveStart(): void {
      this.view?.focus();
      this.view?.dispatch({
        selection: EditorSelection.single(this.match.node.startIndex),
      });
    }

    onLeaveEnd(): void {
      let end = this.match.node.endIndex;
      if (this.match.blocks.length) {
        end = this.match.blocks[0].from;
      }
      this.view?.focus();
      this.view?.dispatch({
        selection: EditorSelection.single(end),
      });
    }
  };

interface IComponentOptions<Props> {
  target: Element | ShadowRoot;
  props?: Props;
}

interface ComponentClass<Props> {
  new (options: IComponentOptions<Props>): SvelteComponent<Props>;
}

export interface SvelteComponent<Props> {
  $set(props: Partial<Props>): void;
  $destroy(): void;
  $on(event: string, handler: (e: CustomEvent<unknown>) => unknown): () => void;
}
