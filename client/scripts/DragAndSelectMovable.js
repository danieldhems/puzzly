import { AbstractMovable } from "./AbstractMovable.js";
import { EVENT_TYPES } from "./constants.js";

export class DragAndSelectMovable extends AbstractMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(EVENT_TYPES.PIECE_PICKUP, this.onPickup.bind(this));
  }

  onPickup(event) {
    const element = event.detail;

    if (this.isDragAndSelectPiece(element)) {
      this.element = element.parentNode;
      this.active = true;
      console.log("DragAndSelectMovable activated with", this.element);

      window.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
  }

  onMouseUp(event) {
    if (this.isOutOfBounds()) {
      this.resetPosition();
    }

    if (this.isOverPockets(event)) {
      const pocket = this.getPocketByCollision(Utils.getEventBox(event));
      this.addToPocket(pocket);
    }
  }

  onDrop() {
    this.element.childNodes.forEach((p) => {
      p.style.left = p.offsetLeft + parseInt(this.element.style.left) + "px";
      p.style.top = p.offsetTop + parseInt(this.element.style.top) + "px";
      this.addToStage(p);
    });
  }
}
