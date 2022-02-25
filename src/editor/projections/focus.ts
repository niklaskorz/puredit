export interface FocusGroupHandler {
  onLeaveStart(): void;
  onLeaveEnd(): void;
}

function focusOnNextFrame(target: HTMLElement) {
  requestAnimationFrame(() => {
    target.focus();
  });
}

function setCursorOnNextFrame(
  target: HTMLInputElement,
  cursorPosition: number
) {
  requestAnimationFrame(() => {
    target.selectionStart = target.selectionEnd = cursorPosition;
  });
}

export class FocusGroup {
  elements: HTMLElement[] = [];

  constructor(private handler: FocusGroupHandler) {}

  registerElement(el: HTMLElement): void {
    try {
      for (let i = 0; i < this.elements.length; i++) {
        // check if the new element comes before the current
        // element in the document tree
        if (
          this.elements[i].compareDocumentPosition(el) &
          Node.DOCUMENT_POSITION_PRECEDING
        ) {
          // insert new element before the current element
          this.elements.splice(i, 0, el);
          return;
        }
      }
      this.elements.push(el);
    } catch (e) {
      console.error(e);
    }
  }

  unregisterElement(el: HTMLElement): void {
    const index = this.elements.indexOf(el);
    if (index >= 0) {
      this.elements.splice(index, 1);
    }
  }

  first(): boolean {
    const target = this.elements[0];
    if (target) {
      focusOnNextFrame(target);
      if (target instanceof HTMLInputElement) {
        setCursorOnNextFrame(target, 0);
      }
      return true;
    }
    return false;
  }

  last(): boolean {
    const target = this.elements[this.elements.length - 1];
    if (target) {
      focusOnNextFrame(target);
      if (target instanceof HTMLInputElement) {
        setCursorOnNextFrame(target, target.value.length);
      }
      return true;
    }
    return false;
  }

  previous(el: HTMLElement): void {
    const index = this.elements.indexOf(el);
    const target = this.elements[index - 1];
    if (target) {
      focusOnNextFrame(target);
      if (target instanceof HTMLInputElement) {
        setCursorOnNextFrame(target, target.value.length);
      }
    } else {
      this.handler.onLeaveStart();
    }
  }

  next(el: HTMLElement): void {
    const index = this.elements.indexOf(el);
    const target = this.elements[index + 1];
    if (target) {
      focusOnNextFrame(target);
      if (target instanceof HTMLInputElement) {
        setCursorOnNextFrame(target, 0);
      }
    } else {
      this.handler.onLeaveEnd();
    }
  }
}
