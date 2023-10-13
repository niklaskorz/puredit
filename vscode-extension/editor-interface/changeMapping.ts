import type { ChangeSet, Text, Line } from "@codemirror/state";
import { ChangePayload, ChangeType } from ".";

export function mapChangeSetToChanges(changeSet: ChangeSet): Change[] {
  const changes: Change[] = [];
  changeSet.iterChanges(
    (
      fromBefore: number,
      toBefore: number,
      fromAfter: number,
      toAfter: number,
      inserted: Text
    ) => {
      const change = new Change(
        fromBefore,
        toBefore,
        fromAfter,
        toAfter,
        inserted
      );
      changes.push(change);
    }
  );
  return changes;
}

export class Change {
  readonly lengthBefore: number;
  readonly lengthAfter: number;

  lineFromBefore!: Line;
  lineToBefore!: Line;
  lineFromAfter!: Line;
  lineToAfter!: Line;

  lineFrom!: number;
  characterFrom!: number;
  lineTo!: number;
  characterTo!: number;

  constructor(
    readonly fromBefore: number,
    readonly toBefore: number,
    readonly fromAfter: number,
    readonly toAfter: number,
    readonly inserted: Text
  ) {
    this.lengthBefore = this.toBefore - this.fromBefore;
    this.lengthAfter = this.toAfter - this.fromAfter;
  }

  setLinesBefore(lineFromBefore: Line, lineToBefore: Line) {
    this.lineFromBefore = lineFromBefore;
    this.lineToBefore = lineToBefore;
  }

  setLinesAfter(lineFromAfter: Line, lineToAfter: Line) {
    this.lineFromAfter = lineFromAfter;
    this.lineToAfter = lineToAfter;
  }

  computeLineInfo() {
    if (this.isInsertion()) {
      this.lineFrom = this.lineFromBefore.number - 1;
      this.characterFrom = this.fromBefore - this.lineFromBefore.from;
      this.lineTo = this.lineToBefore.number - 1;
      this.characterTo = this.toAfter - this.lineToAfter.from;
    } else if (this.isReplacement() || this.isDeletion()) {
      this.lineFrom = this.lineFromBefore.number - 1;
      this.characterFrom = this.fromBefore - this.lineFromBefore.from;
      this.lineTo = this.lineToBefore.number - 1;
      this.characterTo = this.toBefore - this.lineToBefore.from;
    } else {
      throw new Error("Change cannot be processed");
    }
  }

  isInsertion(): boolean {
    return this.lengthBefore === 0 && this.lengthAfter > 0;
  }

  isDeletion(): boolean {
    return this.lengthAfter < this.lengthBefore && this.insertsNoText();
  }

  isReplacement(): boolean {
    return this.lengthBefore !== this.lengthAfter && !this.insertsNoText();
  }

  insertsNoText(): boolean {
    return this.inserted.text.length === 1 && this.inserted.text[0] === "";
  }

  toChangePayload(): ChangePayload {
    return {
      type: this.getChangeType(),
      fromBefore: this.fromBefore,
      toBefore: this.toBefore,
      fromAfter: this.fromAfter,
      toAfter: this.toAfter,
      inserted: this.getInsertedText(),
      lineFrom: this.lineFrom,
      characterFrom: this.characterFrom,
      lineTo: this.lineTo,
      characterTo: this.characterTo,
    };
  }

  getChangeType(): ChangeType {
    if (this.isInsertion()) {
      return ChangeType.INSERTION;
    } else if (this.isReplacement()) {
      return ChangeType.REPLACEMENT;
    } else if (this.isDeletion()) {
      return ChangeType.DELETION;
    } else {
      throw new Error("Change cannot be processed");
    }
  }

  getInsertedText(): string {
    return this.inserted.text.join("\n");
  }
}
