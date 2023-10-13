import "@codemirror/state";

declare module "@codemirror/state" {
  declare abstract class Text implements Iterable<string> {
    text: string[];
  }
}
