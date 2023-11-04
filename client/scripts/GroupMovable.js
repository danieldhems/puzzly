import BaseMovable from "./BaseMovable.js";
import { EVENT_TYPES } from "./constants.js";

export class GroupMovable extends BaseMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(EVENT_TYPES.PIECE_PICKUP, this.onPickup.bind(this));
  }

  onPickup(event) {
    const { element, position } = event.detail;

    if (this.isGroupedPiece(element)) {
      this.element = element.parentNode;
      this.active = true;
      console.log("GroupMovable activated with", this.element);

      super.onPickup.call(this, event, position);
    }
  }

  onMouseUp() {
    if (this.isOutOfBounds()) {
      this.resetPosition();
    }
  }
}
