import { ELEMENT_IDS, EVENT_TYPES, PUZZLE_PIECE_CLASSES } from "./constants.js";
import Utils from "./utils.js";

export class AbstractMovable {
  element;
  lastPosition;
  active = false;

  // Element which contains all pieces in-play
  piecesContainer;
  groupIdPattern = /^group-container-/;

  // Used by PocketMovable to know which pocket the movable originated from, and which the movable's child nodes will be returned to if out of bounds.
  activePocket = null;

  diffX = null;
  diffY = null;

  zoomLevel = 1;

  constructor() {
    this.piecesContainer = document.querySelector(
      `#${ELEMENT_IDS.PIECES_CONTAINER}`
    );
    this.pocketsContainer = document.querySelector(`#${ELEMENT_IDS.POCKETS}`);
    this.pockets = this.pocketsContainer.querySelectorAll(`.pocket`);

    window.addEventListener(
      EVENT_TYPES.CHANGE_SCALE,
      this.onChangeScale.bind(this)
    );
  }

  onChangeScale(event) {
    this.zoomLevel = event.detail;
  }

  isSinglePiece(element) {
    const classes = element.classList;
    return (
      PUZZLE_PIECE_CLASSES.some((c) => classes.contains(c)) &&
      !classes.contains("in-pocket") &&
      !classes.contains("grouped")
    );
  }

  isGroupedPiece(element) {
    return this.groupIdPattern.test(element.parentNode.id);
  }

  isPocketPiece(element) {
    return element.parentNode.id === ELEMENT_IDS.POCKET_DRAG_CONTAINER;
  }

  isDragAndSelectPiece(element) {
    return element.parentNode.id === ELEMENT_IDS.DRAGANDSELECT_CONTAINER;
  }

  isEventOverPockets(event) {
    if (!event) return;

    const eventBox = Utils.getEventBox(event);
    const pocketsBox = this.pocketsContainer.getBoundingClientRect();

    return this.hasCollision(eventBox, pocketsBox);
  }

  getPocketByCollision() {
    let i = 0;
    while (i <= this.pockets.length) {
      const pocket = this.pockets[i];
      if (this.hasCollision(pocket)) {
        return pocket;
      }
      i++;
    }
  }

  hasCollision(targetElement, source = null) {
    const targetBox = targetElement.getBoundingClientRect();
    const thisBoundingBox = source || this.element.getBoundingClientRect();

    if (
      [
        thisBoundingBox.left,
        thisBoundingBox.right,
        thisBoundingBox.bottom,
        thisBoundingBox.top,
        targetBox.left,
        targetBox.top,
        targetBox.right,
        targetBox.bottom,
      ].includes(NaN)
    )
      throw new Error(
        "Method: hasCollision -> Can't check for collision: non-numeric value(s) provided"
      );

    return !(
      thisBoundingBox.left >= targetBox.right ||
      thisBoundingBox.top >= targetBox.bottom ||
      thisBoundingBox.right <= targetBox.left ||
      thisBoundingBox.bottom <= targetBox.top
    );
  }

  isInsidePlayArea() {
    return Utils.isInside(
      this.element.getBoundingClientRect(),
      this.piecesContainer.getBoundingClientRect()
    );
  }

  // Override
  isOutOfBounds() {}

  isOverPockets(event) {
    return this.hasCollision(this.pocketsContainer, Utils.getEventBox(event));
  }

  addToStage(element = undefined) {
    const elementToAdd = element || this.element;
    this.piecesContainer.prepend(elementToAdd);
  }

  // Override
  addToPocket() {}

  // Lifecycle method called when a movable is picked up i.e. the user has begun interacting with it
  onPickup(position) {
    this.diffX = position.left - this.element.offsetLeft * this.zoomLevel;
    this.diffY = position.top - this.element.offsetTop * this.zoomLevel;

    // Store a reference to our event handlers so we can remove them later
    // (They don't get removed if we don't use these)
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
  }

  // Lifecycle method called when a movable is put down up i.e. the user has finished interacting with it
  // Actually not sure about this one...
  onDrop() {
    this.clean();
  }

  onMouseMove(event) {
    const newPosTop =
      event.clientY / this.zoomLevel - this.diffY / this.zoomLevel;
    const newPosLeft =
      event.clientX / this.zoomLevel - this.diffX / this.zoomLevel;

    this.element.style.top = newPosTop + "px";
    this.element.style.left = newPosLeft + "px";
  }

  onMouseUp() {
    this.clean();
  }

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

    if (typeof this.onMouseMove === "function") {
      window.removeEventListener("mousemove", this.onMouseMove);
    }
    if (typeof this.onMouseUp === "function") {
      window.removeEventListener("mouseup", this.onMouseUp);
    }
  }
}