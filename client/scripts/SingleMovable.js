import { AbstractMovable } from "./AbstractMovable.js";
import { EVENT_TYPES } from "./constants.js";
import Utils from "./utils.js";

export class SingleMovable extends AbstractMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(EVENT_TYPES.PIECE_PICKUP, this.onPickup.bind(this));
  }

  onPickup(event) {
    const { element, position } = event.detail;

    if (this.isSinglePiece(element)) {
      this.element = element;
      this.active = true;

      super.onPickup(position);
    }
  }

  addToStage() {
    this.stageElement.prepend(this.element);
  }

  addToPocket(pocket) {
    const innerElement = pocket.querySelector(".pocket-inner");
    innerElement.prepend(this.element);
  }

  isOutOfBounds(event) {
    return !this.isInsidePlayArea() && !this.isOverPockets(event);
  }

  onMouseUp(event) {
    if (this.isOutOfBounds(event)) {
      this.resetPosition();
    }

    if (this.isOverPockets(event)) {
      const pocket = this.getPocketByCollision(Utils.getEventBox(event));
      this.addToPocket(pocket);
    }

    this.clean();
  }

  clean() {
    if (this.active) {
      super.clean();
    }
  }
}
