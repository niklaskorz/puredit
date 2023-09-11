export interface FocusGroupHandler {
  onLeaveStart(): void;
  onLeaveEnd(): void;
}

export interface CursorPositionHandler {
  focusGroupSetCursorPosition(cursorPosition: "start" | "end"): void;
}

function focusOnNextFrame(target: HTMLElement) {
  requestAnimationFrame(() => {
    target.focus();
  });
}

function setInputCursorOnNextFrame(
  target: HTMLInputElement,
  cursorPosition: number
) {
  requestAnimationFrame(() => {
    target.selectionStart = target.selectionEnd = cursorPosition;
  });
}

function setCursorOnNextFrame(
  target: CursorPositionHandler,
  cursorPosition: "start" | "end"
) {
  requestAnimationFrame(() => {
    target.focusGroupSetCursorPosition(cursorPosition);
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
        setInputCursorOnNextFrame(target, 0);
      } else if ("focusGroupSetCursorPosition" in target) {
        setCursorOnNextFrame(target as CursorPositionHandler, "start");
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
        setInputCursorOnNextFrame(target, target.value.length);
      } else if ("focusGroupSetCursorPosition" in target) {
        setCursorOnNextFrame(target as CursorPositionHandler, "end");
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
        setInputCursorOnNextFrame(target, target.value.length);
      } else if ("focusGroupSetCursorPosition" in target) {
        setCursorOnNextFrame(target as CursorPositionHandler, "end");
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
        setInputCursorOnNextFrame(target, 0);
      } else if ("focusGroupSetCursorPosition" in target) {
        setCursorOnNextFrame(target as CursorPositionHandler, "start");
      }
    } else {
      this.handler.onLeaveEnd();
    }
  }
}
