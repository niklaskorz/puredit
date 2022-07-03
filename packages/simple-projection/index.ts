import { EditorSelection, EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { HighlightStyle, tags } from "@codemirror/highlight";
import type { Match, TemplateArg } from "@puredit/parser";
import { FocusGroup } from "@puredit/projections/focus";
import type { FocusGroupHandler } from "@puredit/projections/focus";
import { ProjectionWidget } from "@puredit/projections/projection";
import TextInput from "@puredit/projections/TextInput.svelte";
import { isString } from "@puredit/utils";
import type { SvelteComponent } from "@puredit/projections/svelte";

export const simpleProjection = (
  template: Array<string | TemplateArg | TemplateArg[]>
) =>
  class extends ProjectionWidget implements FocusGroupHandler {
    focusGroup!: FocusGroup;
    inputs: Array<[TemplateArg[], SvelteComponent<any>]>;

    protected initialize(
      match: Match,
      _context: object,
      state: EditorState
    ): HTMLElement {
      this.focusGroup = new FocusGroup(this);
      this.inputs = [];
      const target = document.createElement("span");
      target.className = "inline-flex";
      for (const part of template) {
        const element = document.createElement("span");
        target.appendChild(element);
        if (isString(part)) {
          element.textContent = part;
        } else {
          const args = part instanceof Array ? part : [part];
          const component = new TextInput({
            target: element,
            props: {
              className: HighlightStyle.get(state, tags.string),
              node: match.args[args[0].name],
              targetNodes:
                args.length > 1
                  ? args.map((arg) => match.args[arg.name])
                  : undefined,
              placeholder: args[0].name,
              state,
              view: null,
              focusGroup: this.focusGroup,
            },
          });
          this.inputs.push([args, component]);
        }
      }
      return target;
    }

    protected update(match: Match, context: object, state: EditorState): void {
      for (const [args, component] of this.inputs) {
        component.$set({
          node: match.args[args[0].name],
          targetNodes:
            args.length > 1
              ? args.map((arg) => match.args[arg.name])
              : undefined,
          context,
          state,
        });
      }
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
      for (const [, component] of this.inputs) {
        component.$set({ view });
      }
      if (this.isNew) {
        requestAnimationFrame(() => {
          this.focusGroup.first();
        });
      }
      return dom;
    }

    destroy(dom: HTMLElement): void {
      for (const [, component] of this.inputs) {
        component.$set({ view: null });
        component.$destroy();
      }
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
