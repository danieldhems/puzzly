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
    this.puzzly = puzzly;
    // console.log("puzzly", puzzly);
    this.puzzleImage = puzzly.puzzleImage;

    this.piecesContainer = document.querySelector(
      `#${ELEMENT_IDS.PIECES_CONTAINER}`
    );
    this.solvedContainer = document.getElementById(
      ELEMENT_IDS.SOLVED_CONTAINER
    );
    this.solvedCanvas = document.getElementById(ELEMENT_IDS.SOLVED_CANVAS);
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

    this.solvedGroupId = puzzly.solvedGroupId;

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

  static isGroupedPiece(element) {
    return (
      element?.dataset?.groupId !== undefined &&
      element?.dataset?.groupId !== ""
    );
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
    // console.log("element to add", this);
    this.piecesContainer.prepend(elementToAdd);
  }

  // Override
  addToPocket() {}

  // Override
  addToSolved() {}

  // Override
  markAsSolved() {}

  // Lifecycle method called when a movable is picked up i.e. the user has begun interacting with it
  onPickup(event) {
    const mousePosition = {
      top: event.clientY,
      left: event.clientX,
    };
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
  onMouseDown() {}

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
      this.handleConnection();
    }

    Events.notify(EVENT_TYPES.MOVE_FINISHED, event);
    this.clean();
  }

  handleConnection() {
    const { sourceElement, targetElement } = this.connection;

    const sourceInstance =
      window.Puzzly.getMovableInstanceFromElement(sourceElement);
    const targetInstance =
      window.Puzzly.getMovableInstanceFromElement(targetElement);

    console.log("instances", sourceInstance, targetInstance);

    if (this.connection.isSolving) {
      sourceInstance.solve();
    } else if (
      this.isConnectionBetweenSingleAndGroup(sourceInstance, targetInstance) ||
      this.isConnectionBetweenTwoGroups(sourceInstance, targetInstance)
    ) {
      sourceInstance.joinTo(targetInstance);
    }

    Events.notify(EVENT_TYPES.CONNECTION_MADE, [
      sourceInstance,
      targetInstance,
    ]);
  }

  isConnectionBetweenSingleAndGroup(sourceInstance, targetInstance) {
    return (
      (sourceInstance.instanceType === "SingleMovable" &&
        targetInstance.instanceType === "GroupMovable") ||
      (targetInstance.instanceType === "SingleMovable" &&
        sourceInstance.instanceType === "GroupMovable")
    );
  }

  isConnectionBetweenTwoGroups(sourceInstance, targetInstance) {
    return (
      (sourceInstance.instanceType === "GroupMovable" &&
        targetInstance.instanceType === "GroupMovable") ||
      (targetInstance.instanceType === "GroupMovable" &&
        sourceInstance.instanceType === "GroupMovable")
    );
  }

  getPosition() {
    return {
      top: this.element.offsetTop,
      left: this.element.offsetLeft,
    };
  }

  resetPosition() {
    if (this.active) {
      this.element.style.top = this.lastPosition.top + "px";
      this.element.style.left = this.lastPosition.left + "px";
    }
  }

  clean() {
    this.active = false;

    if (typeof this.onMouseMove === "function") {
      window.removeEventListener("mousemove", this.onMouseMove);
    }
    if (typeof this.onMouseUp === "function") {
      window.removeEventListener("mouseup", this.onMouseUp);
    }
  }
}
