import { AbstractMovable } from "./AbstractMovable";

export class DragAndSelectMovable extends AbstractMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(
      EVENT_TYPES.PIECE_PICKUP,
      this.#onPickup.bind(this)
    );
  }

  #onPickup(event) {
    const element = event.detail;

    if (this.isDragAndSelectPiece(element)) {
      this.active = true;
    }
  }
}
