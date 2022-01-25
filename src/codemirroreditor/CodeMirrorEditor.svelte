<script lang="ts">
    import { EditorState, basicSetup } from "@codemirror/basic-setup";
    import {
        EditorView,
        keymap,
        Decoration,
        WidgetType,
        DecorationSet,
        ViewPlugin,
        PluginValue,
    } from "@codemirror/view";
    import { indentWithTab } from "@codemirror/commands";
    import { autocompletion } from "@codemirror/autocomplete";
    import { javascript } from "@codemirror/lang-javascript";
    import { onMount } from "svelte";
    import { example } from "../code";

    let container: HTMLDivElement;
    let editor: EditorView;

    class CheckboxWidget extends WidgetType {
        constructor(readonly checked: boolean) {
            super();
        }

        eq(other: CheckboxWidget): boolean {
            return other.checked == this.checked;
        }

        toDOM(): HTMLElement {
            let wrap = document.createElement("span");
            wrap.setAttribute("aria-hidden", "true");
            wrap.className = "cm-boolean-toggle";
            let box = wrap.appendChild(document.createElement("input"));
            box.type = "checkbox";
            box.checked = this.checked;
            return wrap;
        }

        ignoreEvent(): boolean {
            return false;
        }
    }

    class CheckboxPlugin implements PluginValue {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            let replacement = Decoration.replace({
                widget: new CheckboxWidget(true),
            });
            this.decorations = Decoration.set([replacement.range(50, 70)]);
        }

        update() {}

        destroy() {}
    }

    const checkboxPlugin = ViewPlugin.fromClass(CheckboxPlugin, {
        decorations: (v) => v.decorations,
    });

    onMount(() => {
        editor = new EditorView({
            state: EditorState.create({
                doc: example,
                extensions: [
                    basicSetup,
                    keymap.of([indentWithTab]),
                    autocompletion(),
                    javascript({ typescript: true }),
                    checkboxPlugin,
                ],
            }),
            parent: container,
        });
    });
</script>

<div bind:this={container} />

<style>
    :global(.cm-content) {
        font-family: "JetBrains Mono", "SF Mono", "Menlo", "Consolas", "Monaco",
            "Courier New", monospace;
        font-size: 16px;
    }
</style>
