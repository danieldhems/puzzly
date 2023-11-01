import { AbstractMovable } from "./AbstractMovable";
import Utils from "./utils";

export class SingleMovable extends AbstractMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(
      EVENT_TYPES.PIECE_PICKUP,
      this.#onPickup.bind(this)
    );
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener(EVENT_TYPES.MOVE_FINISHED, this.clean.bind(this));
  }

  #onPickup(event) {
    const element = event.detail;

    if (this.isSinglePiece(element)) {
      this.active = true;
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
    return (
      !this.isInside(elBox, cnvBox) &&
      !this.isOverPockets(Utils.getEventBox(event))
    );
  }

  onMouseUp(event) {
    if (this.isOutOfBounds(event)) {
      this.resetPosition();
    }

    if (this.isOverPockets(event)) {
      const pocket = this.getPocketByCollision(Utils.getEventBox(event));
      this.addToPocket(pocket);
    }
  }
}
