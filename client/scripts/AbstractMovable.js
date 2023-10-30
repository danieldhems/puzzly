import { ELEMENT_IDS, PUZZLE_PIECE_CLASSES } from "./constants";

export class AbstractMovable {
  element;
  lastPosition;
  active = false;

  groupIdPattern = /^group-container-/;

  constructor(element, position) {
    this.#element = element;
    this.#lastPosition = position;
  }

  isSinglePiece(element) {
    const classes = element.classList;
    return (
      PUZZLE_PIECE_CLASSES.some((c) => classes.contains(c)) &&
      !classes.contains("in-pocket")
    );
  }

  isGroupedPiece(element) {
    return this.groupIdPattern.test(element.parentNode.id);
  }

  isDragAndSelectPiece(element) {
    return element.parentNode.id === ELEMENT_IDS.DRAGANDSELECT_CONTAINER;
  }

  isOverPockets() {}
  isOutOfBounds() {}
  resetPosition() {}
  clean() {
    this.active = false;
    this.element = null;
    this.lastPosition = null;
  }
}
