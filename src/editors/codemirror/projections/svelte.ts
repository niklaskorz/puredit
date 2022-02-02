import type { EditorState, EditorView } from "@codemirror/basic-setup";
import type { Match } from "../../../parsers/lezer";
import { ProjectionWidget } from "./projection";

interface Props {
  isNew: boolean;
  view: EditorView | null;
  match: Match;
  state: EditorState;
}

type Parameters = Svelte2TsxComponentConstructorParameters<Props>;

export const svelteProjection = <Component extends Svelte2TsxComponent<Props>>(
  Component: SvelteComponentConstructor<Component, Parameters>
) =>
  class extends ProjectionWidget<Match> {
    component!: Component;

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
      this.component.$set({ view });
      return dom;
    }

    destroy(dom: HTMLElement): void {
      this.component.$set({ view: null });
      this.component.$destroy();
      super.destroy(dom);
    }
  };
