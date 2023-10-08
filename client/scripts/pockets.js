import Bridge from "./bridge.js";
import { ELEMENT_IDS, EVENT_TYPES } from "./constants.js";
import Utils from "./utils.js";

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

    this.pieceScaleWhileInPocket = 0.6;
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

    window.addEventListener("DOMContentLoaded", this.init);

    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener(EVENT_TYPES.CHANGE_SCALE, this.setScale.bind(this));
  }

  init(config) {
    this.ui = document.querySelector("#pockets");
    this.pocketsBridge = document.querySelector("#pockets-bridge");
    this.pocketsHandle = document.querySelector("#pockets-handle");

    if (this.currentOrientation === "landscape") {
      this.ui.style.left = window.innerWidth - this.ui.offsetWidth + "px";
    } else {
      this.ui.style.left = window.innerHeight - this.ui.offsetHeight + "px";
    }

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

  getOrientation() {
    return window.innerWidth > window.innerHeight
      ? "landscape"
      : window.innerHeight > window.innerWidth
      ? "portrait"
      : null;
  }

  shouldTriggerResize() {
    return (
      (window.innerWidth > window.innerHeight &&
        this.currentOrientation === "portrait") ||
      (window.innerHeight > window.innerWidth &&
        this.currentOrientation === "landscape")
    );
  }

  onResize() {
    if (this.shouldTriggerResize()) {
      this.resetElementPositionsInPockets();
      this.currentOrientation = this.getOrientation();
    }
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

  setPieceSize(el, scale = null, origin = null) {
    // When returning pieces to the canvas we need to remove the scale transform from them in order for them to be correctly scaled by the canvas itself, else they'll end up smaller or large than intended
    el.style.transform = scale ? `scale(${scale})` : "none";
    if (scale && origin) {
      el.style.transformOrigin = origin;
    }
  }

  setSizeForPiecesInPocket() {
    this.getPiecesInActivePocket().forEach((el) =>
      this.setPieceSize(el, this.pieceScaleWhileInPocket)
    );
  }

  resetPieceScale(el) {
    el.style.transform = "scale(1)";
  }

  setActivePiecesToPocketSize() {
    const activePieces = this.getPiecesInActivePocket();
    if (activePieces) {
      Array.from(activePieces).forEach((el) => {
        this.setPieceSize(el, this.pieceScaleWhileInPocket);
      });
    }
  }

  setActivePiecesToCurrentScale() {
    const activePieces = this.getPiecesInActivePocket();
    if (activePieces) {
      const pArr = Array.from(activePieces);
      // beef
      // const origin = pArr.length === 1 ? "50% 50%" : null;
      pArr.forEach((el) => {
        this.setPieceSize(el, this.zoomLevel, origin);
      });
    }
  }

  getPocketByCollision(box) {
    if (Utils.isOverPockets(box)) {
      let i = 0;
      while (i <= this.pockets.length) {
        const pocket = this.pockets[i];
        console.log(pocket);
        if (Utils.hasCollision(box, pocket.getBoundingClientRect())) {
          return pocket;
        }
        i++;
      }
    }
  }

  isFromPocket(el) {
    return el?.parentNode?.classList?.contains("pocket");
  }

  isFromCanvas(el) {
    return (
      el.parentNode.id === ELEMENT_IDS.PLAY_BOUNDARY ||
      el.parentNode.parentNode.id === ELEMENT_IDS.PLAY_BOUNDARY
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
    let el = e.target;
    let shouldTrackPiece;

    // If the empty space inside a pocket is clicked, do nothing
    if (el.classList?.contains("pocket")) {
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

    // Picking up a single piece from the canvas
    if (shouldTrackPiece && this.isFromCanvas(el)) {
      this.movingElement = el;
      this.disablePointerEvents();
    }

    // Piece is being picked up from a pocket
    if (this.isFromPocket(el)) {
      console.log(this.getPocketIdFromPiece(el));
      this.activePocket = this.pockets[this.getPocketIdFromPiece(el)];
      console.log(this.activePocket);
      this.lastPosition = el.getBoundingClientRect();

      this.setActivePiecesToCurrentScale();
      this.movingElement = this.getMovingElementForActivePocket(e);
      this.activePocket.appendChild(this.movingElement);

      this.setActivePiecesToCurrentScale();

      this.diffX = e.clientX - this.movingElement.offsetLeft;
      this.diffY = e.clientY - this.movingElement.offsetTop;
    }

    if (isMainCanvas) {
      this.isMainCanvasMoving = true;
    }

    if (Utils.isPuzzlePiece || isMainCanvas) {
      window.addEventListener("mousemove", this.onMouseMove.bind(this));
    } else {
      this.isMouseDown = false;
      this.isMovingSinglePiece = false;
    }
  }

  enablePointerEvents() {
    this.ui.style.pointerEvents = "auto";
    const pieces = this.ui.querySelectorAll(".puzzle-piece");
    pieces.forEach((el) => (el.style.pointerEvents = "auto"));
  }

  disablePointerEvents() {
    console.log("disabling pointer events");
    this.ui.style.pointerEvents = "none";
    const pieces = this.ui.querySelectorAll(".puzzle-piece");
    pieces.forEach((el) => (el.style.pointerEvents = "none"));
  }

  onMouseMove(e) {
    e.preventDefault();

    if (this.activePocket) {
      const x = this.diffX ? e.clientX - this.diffX : e.clientX;
      const y = this.diffY ? e.clientY - this.diffY : e.clientY;
      this.movingElement.style.top = y + "px";
      this.movingElement.style.left = x + "px";
    }
  }

  onMouseUp(e) {
    const trackingBox = Utils.getEventBox(e);
    const targetPocket = this.getPocketByCollision(trackingBox);
    // notify to remove from bridge

    this.enablePointerEvents();

    if (trackingBox && targetPocket) {
      if (this.activePocket) {
        this.addPiecesToPocket(targetPocket, this.movingElement.childNodes);
        this.setActivePiecesToPocketSize();
        this.movingElement.remove();
      } else {
        if (this.isDragActive) {
          this.addPiecesToPocket(targetPocket, this.movingElement.childNodes);
          window.dispatchEvent(this.getPocketDropEventMessage());
        } else {
          console.log("targetPocket", targetPocket);
          this.addToPocket(targetPocket, this.movingElement);
        }
      }
    } else {
      if (this.activePocket) {
        if (Utils.isOutOfBounds(this.movingElement.getBoundingClientRect())) {
          this.addPiecesToPocket(
            this.activePocket,
            this.movingElement.childNodes
          );
          this.movingElement.remove();
        } else {
          this.returnToCanvas(this.getPiecesInTransit());
          this.resetActivePocket();
        }
      }
    }

    if (this.isMovingSinglePiece) {
      this.isMovingSinglePiece = false;
    }

    if (this.activePiecesContainer) {
      this.activePiecesContainer.remove();
      this.activePiecesContainer = null;
    }

    this.movingElement = null;
    this.isMainCanvasMoving = false;
    this.activePocket = null;

    window.removeEventListener("mousemove", this.mouseFn);
  }

  eventTargetIsPocket(e) {
    return e.target.classList.contains("pocket");
  }

  eventTargetIsCanvas(e) {
    return e.target.id === ELEMENT_IDS.PLAY_BOUNDARY;
  }

  getPiecesInActivePocket() {
    return Array.from(this.activePocket.childNodes).filter((el) =>
      el.classList.contains("puzzle-piece")
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

    this.activePiecesContainer = container;

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

      // move(el).x(currX * this.zoomLevel).y(currY * this.zoomLevel).duration(this.animationDuration).end();
      el.style.top = currY * this.zoomLevel + "px";
      el.style.left = currX * this.zoomLevel + "px";

      const elBox = el.getBoundingClientRect();
      const box = {
        top: this.ui.offsetTop + top,
        right: el.offsetLeft + el.offsetWidth,
        bottom: el.offsetTop + el.offsetHeight,
        left: this.activePocket.offsetLeft + el.offsetLeft,
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
    let dropX, dropY;

    const els = Array.from(pocket.childNodes);
    if (els.length === 1) {
      dropX = pocket.offsetWidth / 2 - element.offsetWidth / 2;
      dropY = pocket.offsetHeight / 2 - element.offsetHeight / 2;
    } else {
      dropX = Utils.getRandomInt(
        this.pocketDropBoundingBox.left,
        this.pocketDropBoundingBox.right
      );
      dropY = Utils.getRandomInt(
        this.pocketDropBoundingBox.top,
        this.pocketDropBoundingBox.bottom
      );
    }

    element.style.top = dropY + "px";
    element.style.left = dropX + "px";
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
      console.log("pocket id is", pocketId);
    }

    this.setElementPositionInPocket(element, pocketEl);

    element.setAttribute("data-pocket-id", pocketId);
    element.classList.add("in-pocket");

    pocketEl?.appendChild(element);

    if (this.elementClone) {
      this.removeClone();
    }

    this.setPieceSize(element, this.pieceScaleWhileInPocket);

    Utils.requestSave([element]);
  }

  returnToCanvas(els) {
    for (let i = 0, l = els.length; i < l; i++) {
      const el = els[i];
      const pos = Utils.getPositionRelativeToContainer(
        el.getBoundingClientRect(),
        this.playBoundary.getBoundingClientRect(),
        this.zoomLevel
      );

      el.style.top = pos.y + "px";
      el.style.left = pos.x + "px";

      this.setPieceSize(el);
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
