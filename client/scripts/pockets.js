import { ELEMENT_IDS, EVENT_TYPES } from "./constants.js";
import Utils from "./utils.js";

const POCKET_DEPTH = 110;

class Pockets {
  constructor(config) {
    this.playBoundary = config.playBoundary;
    this.shadowOffset = config.shadowOffset;
    this.largestPieceSpan = config.largestPieceSpan;
    this.connectorSize = config.connectorSize;
    this.borderColor = "#cecece";
    this.hasCapture = false;
    this.elementClone = null;

    this.animationDuration = 300;

    this.isMainCanvasMoving = false;
    this.isDragActive = false;

    this.zoomLevel = 1; // If this hasn't been set externally yet, assume it's the default value

    this.pockets = {};
    this.activePocketHasMultiplePieces = false;

    this.diffX;
    this.diffY;

    this.isCollapsed = false;

    this.currentOrientation = this.getOrientation();

    this.orientation = {
      portrait: {
        windowPropForDepth: "y",
      },
      landscape: {
        windowPropForDepth: "x",
      },
    };

    this.init(config);

    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener(EVENT_TYPES.RESIZE, this.onResize.bind(this));
    window.addEventListener(EVENT_TYPES.CHANGE_SCALE, this.setScale.bind(this));
  }

  init(config) {
    this.ui = document.querySelector("#pockets");
    this.pocketsBridge = document.querySelector("#pockets-bridge");
    this.pocketsHandle = document.querySelector("#pockets-handle");

    this.setSizeAndPosition();

    const pocket0 = document.querySelector("#pocket-0");
    const pocket1 = document.querySelector("#pocket-1");
    const pocket2 = document.querySelector("#pocket-2");
    const pocket3 = document.querySelector("#pocket-3");

    this.pockets = [pocket0, pocket1, pocket2, pocket3];

    this.ui.classList.add("initialised");

    this.setScale(config.zoomLevel);
    this.pocketDropBoundingBox = this.getTargetBoxForPlacementInsidePocket(
      config.pieceSize
    );

    this.pocketsHandle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const orientation = this.getOrientation();
      let axisToAnimate, windowPropForDepth, depth;
      if (orientation === "landscape") {
        axisToAnimate = "x";
        windowPropForDepth = "innerWidth";
        depth = this.ui.offsetWidth;
      } else {
        axisToAnimate = "y";
        windowPropForDepth = "innerHeight";
        depth = this.ui.offsetHeight;
      }

      if (this.isCollapsed) {
        move(this.ui)
          [axisToAnimate](window[windowPropForDepth] - depth)
          .duration(this.animationDuration)
          .end();
        this.isCollapsed = false;
      } else {
        move(this.ui)
          [axisToAnimate](
            window[windowPropForDepth] - this.pocketsHandle.offsetWidth
          )
          .duration(this.animationDuration)
          .end();
        this.isCollapsed = true;
      }
    });
  }

  setSizeAndPosition() {
    if (this.currentOrientation === "landscape") {
      this.ui.style.width = POCKET_DEPTH + "px";
      this.ui.style.left = window.innerWidth - POCKET_DEPTH + "px";
    } else {
      this.ui.style.height = POCKET_DEPTH + "px";
      this.ui.style.top = window.innerHeight - POCKET_DEPTH + "px";
    }
  }

  getOrientation() {
    return window.innerWidth > window.innerHeight
      ? "landscape"
      : window.innerHeight > window.innerWidth
      ? "portrait"
      : null;
  }

  hasOrientationChanged() {
    return (
      (window.innerWidth > window.innerHeight &&
        this.currentOrientation === "portrait") ||
      (window.innerHeight > window.innerWidth &&
        this.currentOrientation === "landscape")
    );
  }

  onResize() {
    console.log("resizing");
    this.setSizeAndPosition();
    this.currentOrientation = this.getOrientation();
  }

  setScale(event) {
    const zoomLevel = event.detail;
    this.zoomLevel = zoomLevel;
  }

  getPocketIdFromPiece(el) {
    if (el.classList.contains("puzzle-piece")) {
      return parseInt(el.dataset.pocketId);
    }
  }

  getIdForPocket(pocket) {
    return pocket.id.split("-")[1];
  }

  resetPieceScale(el) {
    el.style.transform = "scale(1)";
  }

  getPocketByCollision(box) {
    if (Utils.isOverPockets(box)) {
      let i = 0;
      while (i <= this.pockets.length) {
        const pocket = this.pockets[i];
        if (Utils.hasCollision(box, pocket.getBoundingClientRect())) {
          return pocket;
        }
        i++;
      }
    }
  }

  isFromPocket(el) {
    return el?.parentNode?.parentNode?.classList?.contains("pocket");
  }

  isFromCanvas(el) {
    console.log("el.parentNode", el.parentNode.parentNode);
    return (
      el.parentNode.id === ELEMENT_IDS.PIECES_CONTAINER ||
      el.parentNode.parentNode.id === ELEMENT_IDS.PIECES_CONTAINER
    );
  }

  getPocketIdFromElement(el) {
    return el.classList?.contains("pocket") && el.id.split("-")[2];
  }

  getEventBoundingBox(e) {
    return {
      top: e.clientY,
      right: e.clientX,
      bottom: e.clientY,
      left: e.clientX,
    };
  }

  getPocketDropEventMessage() {
    return new CustomEvent("puzzly_pockets_pieces_added");
  }

  onMouseDown(e) {
    e.stopPropagation();
    let el = Utils.getPuzzlePieceElementFromEvent(e);
    let shouldTrackPiece;

    if (!el) return;

    // If the empty space inside a pocket is clicked, do nothing
    if (el?.classList?.contains("pocket")) {
      return;
    }

    if (Utils.isPuzzlePiece(el)) {
      el = Utils.getPuzzlePieceElementFromEvent(e);
      shouldTrackPiece = !Utils.hasGroup(el);
    }

    this.isDragActive = el.classList
      ? el.classList.contains("selected")
      : false;

    const isMainCanvas =
      el.id === ELEMENT_IDS.PLAY_BOUNDARY ||
      el.id === ELEMENT_IDS.SOLVED_PUZZLE_AREA ||
      el.dataset?.isSolved === "true";

    if (this.isFromPocket(el)) {
      // Piece is being picked up from a pocket
      this.lastPosition = el.getBoundingClientRect();
      this.activePocket = this.pockets[this.getPocketIdFromPiece(el)];

      this.movingElement = this.getMovingElementForActivePocket(e);

      const pos = this.getPositionForMovingElement();
      this.movingElement.style.top = pos.top + "px";
      this.movingElement.style.left = pos.left + "px";
      this.diffX = e.clientX - this.movingElement.offsetLeft;
      this.diffY = e.clientY - this.movingElement.offsetTop;

      this.activePocket.appendChild(this.movingElement);
    } else {
      // Picking up a single piece from the canvas
      this.movingElement = el;
      this.disablePointerEvents();
    }

    if (isMainCanvas) {
      this.isMainCanvasMoving = true;
    }

    if (!Utils.isPuzzlePiece || !isMainCanvas) {
      this.isMouseDown = false;
      this.isMovingSinglePiece = false;
    }

    if (this.movingElement) {
      window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    }
  }

  onMouseMove(e) {
    const newPosTop = e.clientY - this.diffY;
    const newPosLeft = e.clientX - this.diffX;
    if (this.movingElement) {
      this.movingElement.style.top = newPosTop + "px";
      this.movingElement.style.left = newPosLeft + "px";
    }
  }

  getPositionForMovingElement() {
    // const activePocketBB = this.activePocket.getBoundingClientRect();
    return {
      top: 0 - this.movingElement.offsetHeight / 2,
      left: 0 - this.movingElement.offsetWidth / 2,
    };
  }

  enablePointerEvents() {
    this.ui.style.pointerEvents = "auto";
    const pieces = this.ui.querySelectorAll(".puzzle-piece");
    pieces.forEach((el) => (el.style.pointerEvents = "auto"));
  }

  disablePointerEvents() {
    this.ui.style.pointerEvents = "none";
    const pieces = this.ui.querySelectorAll(".puzzle-piece");
    pieces.forEach((el) => (el.style.pointerEvents = "none"));
  }

  onMouseUp(e) {
    const trackingBox = Utils.getEventBox(e);
    const targetPocket = this.getPocketByCollision(trackingBox);

    this.enablePointerEvents();

    const element = e.target;
    if (trackingBox && targetPocket) {
      if (this.activePocket) {
        this.addPiecesToPocket(targetPocket, this.movingElement.childNodes);
        this.movingElement.remove();
      } else {
        if (this.isDragActive && this.movingElement) {
          this.addPiecesToPocket(
            targetPocket,
            this.movingElement.parentNode.childNodes
          );
          window.dispatchEvent(this.getPocketDropEventMessage());
        } else {
          this.addToPocket(targetPocket, this.movingElement);
        }
      }
    } else {
      if (this.activePocket) {
        if (
          Utils.isOutOfBounds([this.movingElement]) ||
          Utils.isOverPlayBoundaryAndPockets(element)
        ) {
          this.addPiecesToPocket(
            this.activePocket,
            this.movingElement.childNodes
          );
          this.movingElement.remove();
        } else {
          console.log("returning to canvas");
          this.returnToCanvas(this.getPiecesInTransit());
          this.resetActivePocket();
        }
      }
    }

    if (this.isMovingSinglePiece) {
      this.isMovingSinglePiece = false;
    }

    this.movingElement = null;
    this.isMainCanvasMoving = false;
    this.activePocket = null;

    window.removeEventListener("mousemove", this.onMouseUp);
  }

  eventTargetIsPocket(e) {
    return e.target.classList.contains("pocket");
  }

  eventTargetIsCanvas(e) {
    return e.target.id === ELEMENT_IDS.PLAY_BOUNDARY;
  }

  getPiecesInActivePocket() {
    return Array.from(
      this.activePocket.querySelectorAll(".pocket-inner .puzzle-piece")
    );
  }

  getPiecesInTransit() {
    if (this.movingElement.classList.contains("active-pieces-container")) {
      return Array.from(this.movingElement.childNodes);
    } else {
      return [this.movingElement];
    }
  }

  // Create a container for all the pieces in a given pocket with the pieces arranged in a grid.
  // This container will be set as the movingElement.
  getMovingElementForActivePocket(e) {
    const activePieces = Array.from(this.getPiecesInActivePocket());

    this.activePocketHasMultiplePieces = true;

    const container = document.createElement("div");
    container.classList.add("active-pieces-container");
    // container.style.border = "1px solid white";
    container.style.position = "absolute";

    const rowLength =
      activePieces.length > 2 ? Math.ceil(Math.sqrt(activePieces.length)) : 2;

    let currX = 0,
      currY = 0;
    let colNumber = 1;
    let numRows = 0;
    let maxX = 0,
      maxY = 0,
      nextRowY = 0;

    let firstPieceOnRow = activePieces[0];

    for (let i = 0, l = activePieces.length; i < l; i++) {
      const el = activePieces[i];

      //   // move(el).x(currX * this.zoomLevel).y(currY * this.zoomLevel).duration(this.animationDuration).end();
      el.style.top = currY + "px";
      el.style.left = currX + "px";

      // const box = el.getBoundingClientRect();
      // const box = Utils.getStyleBoundingBox(el);
      const box = {
        top: el.offsetTop,
        right: el.offsetLeft + el.offsetWidth,
        bottom: el.offsetTop + el.offsetHeight,
        left: el.offsetLeft,
        width: el.offsetWidth,
        height: el.offsetHeight,
      };

      if (currX + box.width > maxX) {
        maxX = currX + box.width;
      }

      if (maxY === 0) {
        maxY = box.height;
      }

      if (currY + box.height > maxY) {
        maxY = currY + box.height;
      }

      currX += box.width + (box.width / 100) * 2;

      if (currY + box.height > nextRowY) {
        nextRowY = currY + box.height + (box.height / 100) * 2;
      }

      if (colNumber === rowLength) {
        currY = nextRowY;
        currX = 0;
        colNumber = 1;
        numRows++;

        firstPieceOnRow = el;
      } else {
        colNumber++;
      }

      container.appendChild(el);
    }

    container.style.width = maxX * this.zoomLevel + "px";
    container.style.height = maxY * this.zoomLevel + "px";

    const pocketBox = this.activePocket.getBoundingClientRect();

    const x = e.clientX - pocketBox.left - (maxX / 2) * this.zoomLevel;
    const y = e.clientY - pocketBox.top - (maxY / 2) * this.zoomLevel;

    container.style.top = y + "px";
    container.style.left = x + "px";

    return container;
  }

  addPiecesToPocket(pocket, pieces) {
    const pieceArray = Array.from(pieces);
    pieceArray.forEach((p) => this.addToPocket(pocket, p));
  }

  resetActivePocket() {
    this.activePocket = null;
  }

  setElementPositionInPocket(element, pocket) {
    const innerElement = pocket.querySelector(".pocket-inner");
    const rangeX = (innerElement.offsetWidth / 100) * 10;
    const rangeY = (innerElement.offsetHeight / 100) * 10;

    element.style.top = Utils.getRandomInt(0, rangeY) + "px";
    element.style.left = Utils.getRandomInt(0, rangeX) + "px";
  }

  resetElementPositionsInPockets() {
    for (let i = 0, l = this.pockets.length; i < l; i++) {
      const pocket = this.pockets[i];
      const els = pocket.childNodes;
      if (els.length) {
        els.forEach((el) => {
          this.setElementPositionInPocket(el, pocket);
        });
      }
    }
  }

  addToPocket(pocket, element) {
    if (!element) return;

    let pocketId, pocketEl;

    if (Number.isInteger(pocket)) {
      pocketEl = this.pockets[pocket];
      pocketId = pocket;
    } else {
      pocketEl = pocket;
      pocketId = this.getIdForPocket(pocket);
    }

    this.setElementPositionInPocket(element, pocketEl);

    element.setAttribute("data-pocket-id", pocketId);
    element.classList.add("in-pocket");

    pocketEl?.querySelector("div").appendChild(element);

    if (this.elementClone) {
      this.removeClone();
    }

    Utils.requestSave([element]);
  }

  returnToCanvas(els) {
    for (let i = 0, l = els.length; i < l; i++) {
      const el = els[i];
      const playboundaryRect = this.playBoundary.getBoundingClientRect();
      const pocketsRect = this.ui.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const pos = {
        x: elRect.left - playboundaryRect.left,
        y: elRect.top - playboundaryRect.top,
      };

      el.style.top = pos.y + "px";
      el.style.left = pos.x + "px";

      this.playBoundary.appendChild(el);
      el.classList.remove("in-pocket");
      el.setAttribute("data-pocket-id", null);
      el.style.pointerEvents = "auto";

      this.notifyDrop(el);
    }

    Utils.requestSave(els);
  }

  notifyDrop(piece) {
    const event = new CustomEvent("puzzly_piece_drop", { detail: { piece } });
    window.dispatchEvent(event);
  }

  getTargetBoxForPlacementInsidePocket() {
    const box = Utils.getStyleBoundingBox(this.pockets[0]);
    const onePercentWidth = box.width / 100;
    const onePercentHeight = box.height / 100;
    return {
      top: onePercentHeight * 10,
      left: onePercentWidth * 20,
      right: onePercentWidth * 10 + 5,
      bottom: onePercentHeight * 10 + 5,
    };
  }
}

export default Pockets;
