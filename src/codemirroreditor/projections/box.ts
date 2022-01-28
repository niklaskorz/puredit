import { Projection, ProjectionWidget } from "./projection";

interface Data {}

class BoxWidget extends ProjectionWidget<Data> {
  protected initialize(data: Data): HTMLElement {
    let element = document.createElement("span");
    element.textContent = "hidden block";
    element.className = "cm-foldPlaceholder";
    return element;
  }

  protected update(data: Data): void {}
}

export const boxProjection: Projection<Data> = {
  Widget: BoxWidget,
  extractData(state, type, from, to) {
    return {};
  },
};
