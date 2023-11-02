import { AbstractMovable } from "./AbstractMovable.js";
import { EVENT_TYPES } from "./constants.js";

export class PocketMovable extends AbstractMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(EVENT_TYPES.PIECE_PICKUP, this.onPickup.bind(this));
  }

  onPickup(event) {
    const element = event.detail;

    if (this.isPocketPiece(element)) {
      this.element = element.parentNode;
      this.activePocket = this.getPocketByCollision(event);
      this.active = true;
      console.log("PocketMovable activated with", this.element);

      window.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
  }

  addToStage() {
    this.element.childNodes.forEach((el) => {
      console.log("returning to canvas", el);
      const playboundaryRect = this.playBoundary.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const pos = {
        x: elRect.left - playboundaryRect.left,
        y: elRect.top - playboundaryRect.top,
      };

      el.style.top = pos.y + "px";
      el.style.left = pos.x + "px";

      this.playBoundaryPieceContainer.appendChild(el);
      el.classList.remove("in-pocket");
      el.setAttribute("data-pocket-id", null);
      el.style.pointerEvents = "auto";

      Events.notify(EVENT_TYPES.RETURN_TO_CANVAS, el);
    });
  }

  addToPocket(pocket) {
    this.element.childNodes.forEach((node) => pocket.appendChild(node));
  }

  onMouseUp(event) {
    if (this.isInsidePlayArea() && !this.isOverPockets(event)) {
      this.addToStage();
    }

    if (this.isOverPockets(event)) {
      const pocket = this.getPocketByCollision(Utils.getEventBox(event));
      this.addToPocket(pocket);
    }

    if (!this.isInsidePlayArea() && !this.isOverPockets(event)) {
      this.addToPocket(this.activePocket);
    }
  }
}
