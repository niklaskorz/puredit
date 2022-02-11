import type { EditorState, EditorView } from "@codemirror/basic-setup";
import { EditorSelection } from "@codemirror/state";
import type { Match } from "../../../parsers/lezer";
import { FocusGroup, FocusGroupHandler } from "./focus";
import { ProjectionWidget } from "./projection";

interface Props {
  isNew: boolean;
  view: EditorView | null;
  match: Match;
  state: EditorState;
  focusGroup: FocusGroup;
}

export const svelteProjection = (Component: ComponentClass<Props>) =>
  class extends ProjectionWidget<Match> implements FocusGroupHandler {
    component!: SvelteComponent<Props>;
    focusGroup!: FocusGroup;

    protected initialize(match: Match, state: EditorState): HTMLElement {
      const target = document.createElement("span");
      this.focusGroup = new FocusGroup(this);
      this.component = new Component({
        target,
        props: {
          isNew: this.isNew,
          view: null,
          match,
          state,
          focusGroup: this.focusGroup,
        },
      });
      return target;
    }

    protected update(match: Match, state: EditorState): void {
      this.component.$set({ isNew: this.isNew, match, state });
    }

    toDOM(view: EditorView): HTMLElement {
      const dom = super.toDOM(view);
      let isFocused = false;
      dom.addEventListener("focusin", () => {
        isFocused = true;
        view.dispatch({
          selection: {
            anchor: this.data.node.from,
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
              anchor: this.data.node.from,
              head: this.data.node.to,
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
        selection: EditorSelection.single(this.data.node.from),
      });
    }

    onLeaveEnd(): void {
      // TODO: pass range of decoration to widget, as a match can
      // consist of multiple decorations if it contains blocks.
      let end = this.data.node.to;
      if (this.data.blocks.length) {
        end = this.data.blocks[0].node.from + 1;
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
  $on(event: string, handler: (e: CustomEvent<any>) => any): () => void;
}
