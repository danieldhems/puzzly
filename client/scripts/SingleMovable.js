import BaseMovable from "./BaseMovable.js";
import { checkConnections } from "./checkConnections.js";
import Utils from "./utils.js";

export class SingleMovable extends BaseMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener("mousedown", this.onMouseDown.bind(this));
  }

  addToPocket(pocket) {
    const innerElement = pocket.querySelector(".pocket-inner");
    innerElement.prepend(this.element);
  }

  isOutOfBounds(event) {
    return !this.isInsidePlayArea() && !this.isOverPockets(event);
  }

  onMouseDown(event) {
    if (event.which === 1) {
      const mousePosition = {
        top: event.clientY,
        left: event.clientX,
      };

      const element = Utils.getPuzzlePieceElementFromEvent(event);
      if (this.isPuzzlePiece(element) && this.isSinglePiece(element)) {
        this.element = element;
        this.active = true;

        super.onPickup(mousePosition);
      }
    }
  }

  onMouseUp(event) {
    if (this.isOutOfBounds(event)) {
      this.resetPosition();
    } else if (this.isOverPockets(event)) {
      const pocket = this.getPocketByCollision(Utils.getEventBox(event));
      this.addToPocket(pocket);
    } else {
      this.connection = checkConnections.call(this, this.element);
      super.onMouseUp();
    }

    this.clean();
  }

  clean() {
    if (this.active) {
      super.clean();
    }
  }
}
