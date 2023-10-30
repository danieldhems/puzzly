import { AbstractMovable } from "./AbstractMovable";

export class GroupMovable extends AbstractMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(
      EVENT_TYPES.PIECE_PICKUP,
      this.#onPickup.bind(this)
    );
  }

  #onPickup(event) {
    const element = event.detail;

    if (this.isGroupedPiece(element)) {
      this.active = true;
    }
  }
}
