import { EVENT_TYPES } from "./constants.js";
import Events from "./events.js";
import Utils from "./utils.js";

class DragAndSelect {
  constructor(opts) {
    this.Puzzly = opts;
    this.Pockets = opts.Pockets;
    this.playBoundary = opts.playBoundary;
    this.piecesContainer = opts.piecesContainer;
    this.zoomLevel = opts.zoomLevel;
    this.selectedPieces = [];

    this.isMouseDown = false;
    this.isMouseDownHeld = false;
    this.hasMouseReleased = false;
    this.isRightClick = false;
    this.isInterrogatingMouse = false;
    this.piecesSelected = false;
    this.selectedPiecesAreMoving = false;

    this.mouseHoldDetectionTime = 1000;
    this.mouseHoldDetectionMovementTolerance = 5;

    this.drawBox;

    this.timer = null;

    this.touchStartTime;
    this.touchEndTime;

    this.initiateDrawBox();

    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener(EVENT_TYPES.CHANGE_SCALE, this.setScale.bind(this));
    window.addEventListener("puzzly_pockets_pieces_added", (e) => {
      this.toggleDrawCursor();
      this.toggleHighlightPieces(this.selectedPieces);
      this.selectedPieces = [];
      this.selectedPiecesContainer?.remove();
      this.selectedPiecesContainer = null;
      Events.notify(EVENT_TYPES.DRAGANDSELECT_ACTIVE, false);
    });
  }

  setScale(eventData) {
    const value = eventData.detail;
    this.zoomLevel = value;
  }

  isMouseHoldInitiated() {
    this.isInterrogatingMouse = true;
    return new Promise((resolve, reject) => {
      this.timer = setTimeout(() => {
        if (!this.hasMouseMoved && !this.hasMouseReleased) {
          resolve();
        } else {
          reject("Mouse-hold conditions not met");
        }
      }, this.mouseHoldDetectionTime);
    });
  }

  isMouseHoldWithinTolerance(e) {
    return (
      Math.abs(this.mouseHoldStartX - e.clientX) <=
        this.mouseHoldDetectionMovementTolerance ||
      Math.abs(e.clientX - this.mouseHoldStartX) <=
        this.mouseHoldDetectionMovementTolerance ||
      Math.abs(this.mouseHoldStartY - e.clientY) <=
        this.mouseHoldDetectionMovementTolerance ||
      Math.abs(e.clientY - this.mouseHoldStartY) <=
        this.mouseHoldDetectionMovementTolerance
    );
  }

  initiateDrawBox() {
    this.drawBox = document.createElement("div");
    this.drawBox.id = "drag-box";
    this.drawBox.style.position = "fixed";
    this.drawBox.style.border = "1px solid #fefefe";
    this.drawBox.style.backgroundColor = "#cecece";
    this.drawBox.style.opacity = 0.3;
    this.drawBox.style.display = "none";
    document.body.appendChild(this.drawBox);
  }

  activateDrawBox(e) {
    console.log("activating drawbox");
    this.drawBox.style.display = "block";
    this.drawBox.style.top = e.clientY + "px";
    this.drawBox.style.left = e.clientX + "px";
    this.drawBoxActive = true;
    this.drawBoxStartY = e.clientY;
    this.drawBoxStartX = e.clientX;
  }

  deactivateDrawBox() {
    this.drawBox.style.display = "none";
    this.drawBox.style.width = null;
    this.drawBox.style.height = null;
    this.drawBoxActive = false;
    this.drawBoxStartY = null;
    this.drawBoxStartX = null;
  }

  updateDrawBox(e) {
    let top, left, width, height;

    if (e.clientX > this.drawBoxStartX) {
      // Dragging right
      left = this.drawBoxStartX;
      width = e.clientX - this.drawBoxStartX;
    } else {
      // Dragging left
      left = e.clientX;
      width = this.drawBoxStartX - e.clientX;
    }

    if (e.clientY > this.drawBoxStartY) {
      // Dragging down
      top = this.drawBoxStartY;
      height = e.clientY - this.drawBoxStartY;
    } else {
      // Dragging up
      top = e.clientY;
      height = this.drawBoxStartY - e.clientY;
    }

    this.drawBox.style.top = top + "px";
    this.drawBox.style.left = left + "px";
    this.drawBox.style.width = width + "px";
    this.drawBox.style.height = height + "px";
  }

  toggleDrawCursor() {
    document.body.style.cursor = this.drawBoxActive ? "crosshair" : "default";
  }

  setDrawCursor(state) {
    document.body.style.cursor = state === 1 ? "crosshair" : "default";
  }

  getCollidingPieces() {
    const dragBoxRect = this.drawBox.getBoundingClientRect();
    return Utils.getIndividualPiecesOnCanvas().filter((el) =>
      Utils.hasCollision(el.getBoundingClientRect(), dragBoxRect)
    );
  }

  toggleHighlightPieces() {
    if (this.selectedPiecesContainer) {
      Array.from(this.selectedPiecesContainer.childNodes).forEach((element) => {
        element.style.opacity = this.drawBoxActive ? 0.5 : 1;
      });
    } else {
      Array.from(this.selectedPiecesContainer.childNodes).forEach((element) => {
        element.style.opacity = this.drawBoxActive ? 1 : 0.5;
      });
    }
  }

  getBoundingBoxForDragContainer(pieces) {
    let minX, minY, maxX, maxY;

    for (let i = 0, l = pieces.length; i < l; i++) {
      const piece = pieces[i];

      const box = Utils.getStyleBoundingBox(piece);

      const left = box.left;
      const top = box.top;
      const right = box.left + box.width;
      const bottom = box.top + box.height;

      if (i === 0) {
        minX = left;
        minY = top;
        maxX = right;
        maxY = bottom;
      } else {
        if (left < minX) {
          minX = left;
        }
        if (top < minY) {
          minY = top;
        }
        if (right > maxX) {
          maxX = right;
        }
        if (bottom > maxY) {
          maxY = bottom;
        }
      }
    }

    return {
      top: minY,
      right: maxX,
      bottom: maxY,
      left: minX,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  getContainerForMove(pieces) {
    const box = this.getBoundingBoxForDragContainer(pieces);

    const b = document.createElement("div");
    b.id = "selected-pieces-container";
    b.style.position = "absolute";
    b.style.top = box.top + "px";
    b.style.left = box.left + "px";
    b.style.width = box.width + "px";
    b.style.height = box.height + "px";

    pieces.forEach((p) => {
      p.style.left = p.offsetLeft - box.left + "px";
      p.style.top = p.offsetTop - box.top + "px";
      p.classList.add("selected");
      b.appendChild(p);
    });

    return b;
  }

  dropPieces(pieces) {
    // Put pieces back in play area
    pieces.forEach((p) => {
      p.style.left =
        p.offsetLeft + parseInt(this.selectedPiecesContainer.style.left) + "px";
      p.style.top =
        p.offsetTop + parseInt(this.selectedPiecesContainer.style.top) + "px";
      this.piecesContainer.appendChild(p);
    });
  }

  resetSelectedPiecesContainer() {
    this.selectedPiecesContainer.display = "none";
  }

  onMouseDown(e) {
    e.preventDefault();

    this.hasMouseReleased = false;
    this.isMouseDown = true;
    this.isRightClick = e.which === 3;

    this.mouseHoldStartX = e.clientX;
    this.mouseHoldStartY = e.clientY;

    this.touchStartTime = Date.now();

    const isEmptySpace = !Utils.isPuzzlePiece(e.target);

    isEmptySpace &&
      !this.isRightClick &&
      this.selectedPieces.length === 0 &&
      this.isMouseHoldInitiated()
        .then(() => {
          this.isMouseDownHeld = true;

          this.activateDrawBox(e);
          this.toggleDrawCursor();

          Events.notify(EVENT_TYPES.DRAGANDSELECT_ACTIVE, true);
        })
        .catch((e) => {
          this.isMouseDownHeld = false;

          if (this.selectedPieces.length > 0) {
            this.dropPieces(this.selectedPieces);

            this.selectedPieces = [];
            this.drawBoxActive = false;
            this.selectedPiecesContainer.remove();
            this.selectedPiecesContainer = null;

            Events.notify(EVENT_TYPES.CLEAR_BRIDGE, false);
          }

          Events.notify(EVENT_TYPES.DRAGANDSELECT_ACTIVE, false);
        });

    if (!isEmptySpace && this.selectedPieces.length > 0) {
      const pieceEl = Utils.getPuzzlePieceElementFromEvent(e);

      if (
        pieceEl.classList.contains("puzzle-piece") &&
        pieceEl.classList.contains("selected")
      ) {
        this.diffX =
          e.clientX - this.selectedPiecesContainer.offsetLeft * this.zoomLevel;
        this.diffY =
          e.clientY - this.selectedPiecesContainer.offsetTop * this.zoomLevel;
        this.selectedPiecesAreMoving = true;
      }
    }
  }

  onMouseMove(e) {
    e.preventDefault();

    if (
      this.isMouseDown &&
      this.isInterrogatingMouse &&
      !this.isMouseHoldWithinTolerance(e)
    ) {
      this.hasMouseMoved = true;
      this.isInterrogatingMouse = false;
    }

    if (this.isMouseDown && this.drawBoxActive) {
      this.updateDrawBox(e);
    }

    if (this.selectedPiecesAreMoving) {
      const newPosTop =
        e.clientY / this.zoomLevel - this.diffY / this.zoomLevel;
      const newPosLeft =
        e.clientX / this.zoomLevel - this.diffX / this.zoomLevel;

      this.selectedPiecesContainer.style.top = newPosTop + "px";
      this.selectedPiecesContainer.style.left = newPosLeft + "px";
    }
  }

  onMouseUp(e) {
    e.preventDefault();
    const droppedElementIsInSelectedGroup =
      e.target.classList?.contains("selected");

    this.touchEndTime = Date.now();

    this.hasMouseReleased = true;
    this.isMouseDown = false;
    this.isMouseDownHeld = false;
    this.hasMouseMoved = false;
    this.selectedPiecesAreMoving = false;

    this.mouseHoldStartX = null;
    this.mouseHoldStartY = null;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (this.drawBoxActive) {
      // Selection box has been drawn
      this.selectedPieces = this.getCollidingPieces();

      if (this.selectedPieces.length === 0) {
        this.endDrag();
        return;
      }

      this.selectedPiecesContainer = this.getContainerForMove(
        this.selectedPieces
      );

      this.piecesContainer.appendChild(this.selectedPiecesContainer);
      this.piecesSelected = true;

      this.toggleHighlightPieces(this.selectedPieces);
      this.toggleDrawCursor();
      this.deactivateDrawBox();

      Events.notify(EVENT_TYPES.PIECE_PICKUP, this.selectedPiecesContainer);
      Events.notify(EVENT_TYPES.DRAGANDSELECT_ACTIVE, true);
    } else if (this.selectedPiecesContainer) {
      // A group of selected pieces has been moved

      if (this.isDragOutOfBounds(e)) {
        this.selectedPiecesContainer.style.left =
          this.selectedPiecesContainerRectLeft + "px";
        this.selectedPiecesContainer.style.top =
          this.selectedPiecesContainerRectTop + "px";
      } else {
        this.selectedPiecesContainerRectLeft =
          this.selectedPiecesContainer.offsetLeft;
        this.selectedPiecesContainerRectTop =
          this.selectedPiecesContainer.offsetTop;
      }

      this.endDrag(e);
    } else if (this.touchEndTime - this.touchStartTime < 250) {
      // console.log("here");
      // Drag finished -> put pieces back
      // this.endDrag();
    }
  }

  addPiecesToPocket(pocket) {
    for (let i = 0, l = this.selectedPieces.length; i < l; i++) {
      const pieceInstance = this.Puzzly.getMovableInstanceFromElement(
        this.selectedPieces[i]
      );
      this.Pockets.addSingleToPocket(pocket, pieceInstance);
    }
  }

  endDrag(e) {
    this.deactivateDrawBox();
    this.setDrawCursor(0);

    if (this.selectedPieces.length > 0) {
      this.toggleHighlightPieces(this.selectedPieces);
      const eventBox = Utils.getEventBox(e);
      const pocket = Utils.getPocketByCollision(eventBox);
      if (pocket) {
        this.addPiecesToPocket(pocket, this.selectedPieces);
      } else {
        this.dropPieces(this.selectedPieces);
      }
      this.save();
    }

    Events.notify(EVENT_TYPES.DRAGANDSELECT_ACTIVE, false);
    Events.notify(EVENT_TYPES.CLEAR_BRIDGE);

    this.selectedPiecesContainer?.remove();
    this.selectedPiecesContainer = null;

    this.selectedPieces = [];
    this.drawBoxActive = false;

    this.touchStartTime = null;
    this.touchEndTime = null;
  }

  isDragOutOfBounds(e) {
    const selectedPiecesRect =
      this.selectedPiecesContainer.getBoundingClientRect();
    const playBoundaryRect = this.playBoundary.getBoundingClientRect();

    return !Utils.isInside(selectedPiecesRect, playBoundaryRect);
  }

  save() {
    const data = this.selectedPieces.map((element) => {
      const pieceInstance = this.Puzzly.getMovableInstanceFromElement(element);
      return {
        _id: pieceInstance._id,
        pageX: pieceInstance.element.offsetLeft,
        pageY: pieceInstance.element.offsetTop,
        pocket: pieceInstance.pocket,
      };
    });
    Events.notify(EVENT_TYPES.SAVE, data);
  }
}

export default DragAndSelect;
