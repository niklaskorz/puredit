import type { EditorState, EditorView } from "@codemirror/basic-setup";
import type { Match } from "../../../parsers/lezer";
import { ProjectionWidget } from "./projection";

interface Props {
  isNew: boolean;
  view: EditorView | null;
  match: Match;
  state: EditorState;
}

export const svelteProjection = (Component: ComponentClass<Props>) =>
  class extends ProjectionWidget<Match> {
    component!: SvelteComponent<Props>;

    protected initialize(match: Match, state: EditorState): HTMLElement {
      const target = document.createElement("span");
      this.component = new Component({
        target,
        props: { isNew: this.isNew, view: null, match, state },
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
}
