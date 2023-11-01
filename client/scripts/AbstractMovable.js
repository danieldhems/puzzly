import { ELEMENT_IDS, PUZZLE_PIECE_CLASSES } from "./constants";
import Utils from "./utils";

export class AbstractMovable {
  element;
  lastPosition;
  active = false;

  // Element which contains all pieces in play
  // Not to be confused with the element that shares its ID
  stageElement;
  groupIdPattern = /^group-container-/;

  constructor(element, position) {
    this.element = element;
    this.lastPosition = position;
    this.stageElement = document.querySelector(
      `#${ELEMENT_IDS.PIECES_CONTAINER}`
    );
    this.pockets = document.querySelectorAll(`${ELEMENT_IDS.POCKETS} .pocket`);
  }

  isSinglePiece() {
    const classes = this.element.classList;
    return (
      PUZZLE_PIECE_CLASSES.some((c) => classes.contains(c)) &&
      !classes.contains("in-pocket")
    );
  }

  isGroupedPiece() {
    return this.groupIdPattern.test(this.element.parentNode.id);
  }

  isPocketPiece() {
    return this.element.parentNode.id === ELEMENT_IDS.POCKET_DRAG_CONTAINER;
  }

  isDragAndSelectPiece() {
    return this.element.parentNode.id === ELEMENT_IDS.DRAGANDSELECT_CONTAINER;
  }

  isEventOverPockets(event) {
    if (!event) return;

    const eventBox = Utils.getEventBox(event);
    const pocketsBox = document
      .querySelector(`${ELEMENT_IDS.POCKETS}`)
      .getBoundingClientRect();

    return this.hasCollision(eventBox, pocketsBox);
  }

  getPocketByCollision(box) {
    let i = 0;
    while (i <= this.pockets.length) {
      const pocket = this.pockets[i];
      if (this.hasCollision(box, pocket.getBoundingClientRect())) {
        return pocket;
      }
      i++;
    }
  }

  hasCollision(targetElement) {
    const targetBox = targetElement.getBoundingClientRect();
    const thisBoundingBox = this.element.getBoundingClientRect();

    if (
      [
        source.left,
        source.right,
        source.bottom,
        source.top,
        targetBox.left,
        targetBox.top,
        targetBox.right,
        targetBox.bottom,
      ].includes(NaN)
    )
      throw new Error(
        "Method: hasCollision -> Can't check for collision: non-numeric value provided"
      );

    return !(
      thisBoundingBox.left >= targetBox.right ||
      thisBoundingBox.top >= targetBox.bottom ||
      thisBoundingBox.right <= targetBox.left ||
      thisBoundingBox.bottom <= targetBox.top
    );
  }

  isInside(source, target) {
    return (
      source.top >= target.top &&
      source.right <= target.right &&
      source.bottom <= target.bottom &&
      source.left >= target.left
    );
  }

  // Override
  isOutOfBounds() {}

  // Override
  addToStage() {}

  // Override
  addToPocket() {}

  resetPosition() {
    if (this.active) {
      this.element.style.top = this.lastPosition.top + "px";
      this.element.style.left = this.lastPosition.left + "px";
    }
  }

  clean() {
    this.active = false;
    this.element = null;
    this.lastPosition = null;
  }
}
