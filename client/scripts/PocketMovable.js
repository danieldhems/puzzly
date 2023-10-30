import { AbstractMovable } from "./AbstractMovable";

export class PocketMovable extends AbstractMovable {
  constructor(...args) {
    super(...args);

    window.addEventListener(
      EVENT_TYPES.PIECE_PICKUP,
      this.#onPickup.bind(this)
    );
  }

  #onPickup(event) {}
}
