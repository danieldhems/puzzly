import { AbstractMovable } from "./AbstractMovable";

export class SingleMovable extends AbstractMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(
      EVENT_TYPES.PIECE_PICKUP,
      this.#onPickup.bind(this)
    );
    window.addEventListener(EVENT_TYPES.MOVE_FINISHED, this.clean.bind(this));
  }

  #onPickup(event) {
    const element = event.detail;

    if (this.isSinglePiece(element)) {
      this.active = true;
    }
  }
}
