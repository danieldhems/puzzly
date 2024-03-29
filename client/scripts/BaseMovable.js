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

  isDragAndSelectActive = false;

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
    this.playBoundary = document.getElementById(ELEMENT_IDS.PLAY_BOUNDARY);
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

    window.addEventListener(EVENT_TYPES.DRAGANDSELECT_ACTIVE, (event) => {
      this.isDragAndSelectActive = event.detail;
    });
  }

  onChangeScale(event) {
    this.zoomLevel = event.detail;
  }

  isPuzzlePiece(target) {
    const classes = target?.classList;
    if (!classes) return;
    return PUZZLE_PIECE_CLASSES.some((c) => classes.contains(c));
  }

  isSinglePiece(element) {
    const classes = element.classList;
    return (
      PUZZLE_PIECE_CLASSES.some((c) => classes.contains(c)) &&
      !classes.contains("in-pocket") &&
      !classes.contains("grouped")
    );
  }

  isPlayBoundary(element) {
    return (
      element.id === ELEMENT_IDS.PLAY_BOUNDARY ||
      element.id === ELEMENT_IDS.SOLVED_PUZZLE_AREA
    );
  }

  static isGroupedPiece(element) {
    return element.dataset.groupId?.length > 0;
  }

  isPocketPiece(element) {
    return element.parentNode.id === ELEMENT_IDS.POCKET_DRAG_CONTAINER;
  }

  isDragAndSelectPiece(element) {
    if (!element) return;
    return element.parentNode.id === ELEMENT_IDS.DRAGANDSELECT_CONTAINER;
  }

  isEventOverPockets(event) {
    if (!event) return;

    const eventBox = Utils.getEventBox(event);
    const pocketsBox = this.pocketsContainer.getBoundingClientRect();

    return this.hasCollision(eventBox, pocketsBox);
  }

  getPocketByCollision(box) {
    let i = 0;
    while (i <= this.pockets.length) {
      const pocket = this.pockets[i];
      if (this.hasCollision(pocket, box)) {
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

  isPuzzleComplete() {
    const numbrOfSolvedPieces =
      this.solvedContainer.querySelectorAll(".puzzle-piece").length;
    return this.puzzly.selectedNumPieces === numbrOfSolvedPieces;
  }

  // Lifecycle method called when a movable is picked up i.e. the user has begun interacting with it
  onPickup(event) {
    const mousePosition = {
      top: event.clientY,
      left: event.clientX,
    };

    // Apply the zoomLevel to everything except for the play boundary (all other movables are children of this)
    if (this.instanceType === "PlayBoundaryMovable") {
      this.diffX = mousePosition.left - parseInt(this.element.style.left);
      this.diffY = mousePosition.top - parseInt(this.element.style.top);
    } else {
      // TODO: Shouldn't be accessing the zoomLevel on a global like this.
      this.diffX =
        mousePosition.left -
        parseInt(this.element.style.left) * window.Zoom.zoomLevel;
      this.diffY =
        mousePosition.top -
        parseInt(this.element.style.top) * window.Zoom.zoomLevel;
    }

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
    if (this.active && !this.dragAndSelectActive) {
      let newPosTop, newPosLeft;

      if (this.instanceType === "PlayBoundaryMovable") {
        // this.shouldConstrainViewport()
        // Viewport constraint not yet implemented so just ignore for now and move the play boundary around freely
        newPosTop = event.clientY - this.diffY;
        newPosLeft = event.clientX - this.diffX;
      } else {
        newPosTop =
          event.clientY / window.Zoom.zoomLevel -
          this.diffY / window.Zoom.zoomLevel;
        newPosLeft =
          event.clientX / window.Zoom.zoomLevel -
          this.diffX / window.Zoom.zoomLevel;
      }

      this.element.style.top = newPosTop + "px";
      this.element.style.left = newPosLeft + "px";
    }
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
    const { sourceElement, targetElement, isSolving } = this.connection;

    const sourceInstance =
      window.Puzzly.getMovableInstanceFromElement(sourceElement);
    const targetInstance =
      window.Puzzly.getMovableInstanceFromElement(targetElement);

    if (isSolving) {
      sourceInstance.solve({ save: true });
    } else if (
      this.isConnectionBetweenSingleAndGroup(sourceInstance, targetInstance) ||
      this.isConnectionBetweenTwoGroups(sourceInstance, targetInstance)
    ) {
      sourceInstance.joinTo(targetInstance);
    }

    Events.notify(EVENT_TYPES.CONNECTION_MADE, {
      sourceInstance,
      targetInstance,
      isSolving,
    });
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
