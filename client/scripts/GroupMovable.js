import { AbstractMovable } from "./AbstractMovable.js";
import { EVENT_TYPES } from "./constants.js";

export class GroupMovable extends AbstractMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(EVENT_TYPES.PIECE_PICKUP, this.onPickup.bind(this));
  }

  onPickup(event) {
    const element = event.detail;

    if (this.isGroupedPiece(element)) {
      this.element = element.parentNode;
      this.active = true;
      console.log("GroupMovable activated with", this.element);

      window.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
  }

  onMouseUp() {
    if (this.isOutOfBounds()) {
      this.resetPosition();
    }
  }
}
