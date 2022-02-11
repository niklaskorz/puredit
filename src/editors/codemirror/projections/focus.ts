export interface FocusGroupHandler {
  onLeaveStart(): void;
  onLeaveEnd(): void;
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
    this.elements.push(el);
  }

  first(): boolean {
    const target = this.elements[0];
    console.log(target, this.elements);
    if (target) {
      target.focus();
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
      target.focus();
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
      target.focus();
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
      target.focus();
      if (target instanceof HTMLInputElement) {
        setCursorOnNextFrame(target, 0);
      }
    } else {
      this.handler.onLeaveEnd();
    }
  }
}
