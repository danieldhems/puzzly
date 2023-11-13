import { ELEMENT_IDS, EVENT_TYPES, PUZZLE_PIECE_CLASSES } from "./constants.js";
import Utils from "./utils.js";
import Events from "./events.js";
import GroupOperations from "./GroupOperations.js";

export default class BaseMovable {
  element;
  lastPosition;
  active = false;

  connection;
  elementsToSaveIfNoConnection;

  puzzleImage;
  groupIdPattern = /^group-container-/;

  // Element containing all pieces in-play
  piecesContainer;

  // Used by PocketMovable to know which pocket the movable originated from, and which the movable's child nodes will be returned to if out-of-bounds.
  activePocket = null;

  boardWidth = null;
  boardHeight = null;

  diffX = null;
  diffY = null;

  zoomLevel = 1;

  connectorTolerance = null;
  shadowOffset = null;

  constructor(puzzly) {
    console.log("puzzzly", puzzly);
    this.puzzleImage = puzzly.puzzleImage;

    this.piecesContainer = document.querySelector(
      `#${ELEMENT_IDS.PIECES_CONTAINER}`
    );
    this.solvingArea = document.getElementById(ELEMENT_IDS.SOLVED_PUZZLE_AREA);
    this.pocketsContainer = document.querySelector(`#${ELEMENT_IDS.POCKETS}`);
    this.pockets = this.pocketsContainer.querySelectorAll(`.pocket`);

    // Needed for collision detection
    this.connectorTolerance = puzzly.connectorTolerance;
    this.connectorDistanceFromCorner = puzzly.connectorDistanceFromCorner;
    this.connectorSize = puzzly.connectorSize;
    this.shadowOffset = puzzly.shadowOffset;

    this.boardWidth = puzzly.boardWidth;
    this.boardHeight = puzzly.boardHeight;

    this.groupOperations = new GroupOperations(puzzly);

    window.addEventListener(
      EVENT_TYPES.CHANGE_SCALE,
      this.onChangeScale.bind(this)
    );
  }

  onChangeScale(event) {
    this.zoomLevel = event.detail;
  }

  isPuzzlePiece(target) {
    const classes = target?.classList;
    if (!classes) return;
    return (
      PUZZLE_PIECE_CLASSES.some((c) => classes.contains(c)) &&
      !classes.contains("in-pocket")
    );
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
    const targetBoundingBox = targetElement.getBoundingClientRect();
    const thisBoundingBox = source || this.element.getBoundingClientRect();

    return Utils.hasCollision(thisBoundingBox, targetBoundingBox);
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
  onPickup(mousePosition) {
    this.diffX = mousePosition.left - this.element.offsetLeft * this.zoomLevel;
    this.diffY = mousePosition.top - this.element.offsetTop * this.zoomLevel;

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

  // Override
  onMouseDown(event) {}

  onMouseMove(event) {
    const newPosTop =
      event.clientY / this.zoomLevel - this.diffY / this.zoomLevel;
    const newPosLeft =
      event.clientX / this.zoomLevel - this.diffX / this.zoomLevel;

    this.element.style.top = newPosTop + "px";
    this.element.style.left = newPosLeft + "px";
  }

  onMouseUp(event) {
    if (this.connection) {
      console.log("connection", this.connection);
      const { sourceElement, targetElement } = this.connection;
      Events.notify(EVENT_TYPES.CONNECTION_MADE, this.connection);

      let connectionType =
        typeof connection == "string" ? this.connection : this.connection.type;

      const isSolvedConnection =
        Utils.isCornerConnection(connectionType) || connectionType === "float";

      if (isSolvedConnection) {
        this.groupOperations.addToGroup(sourceElement, 1111);
      } else {
        const { groupContainer } = this.groupOperations.group(
          sourceElement,
          targetElement
        );

        this.addToStage(groupContainer);
        console.log("container?", groupContainer);
        Events.notify(
          EVENT_TYPES.SAVE,
          GroupOperations.getPiecesInGroupContainer(groupContainer)
        );
      }
    } else {
      Events.notify(EVENT_TYPES.SAVE, this.elementsToSaveIfNoConnection);
    }

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
