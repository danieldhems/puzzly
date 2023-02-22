import Utils from "./utils.js";

class DragAndSelect {
  constructor(opts){
    this.canvas = opts.canvas;
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

    window.addEventListener("mousedown", e => this.onMouseDown(e))
    window.addEventListener("mousemove", e => this.onMouseMove(e))
    window.addEventListener("mouseup", e => this.onMouseUp(e))
    window.addEventListener("puzzly_pockets_pieces_added", e => {
      this.toggleDrawCursor();
      this.toggleHighlightPieces(this.selectedPieces);
      this.selectedPieces = [];
      window.dispatchEvent(this.getDragActiveEventMessage(false));
    });
  }

  setScale(scale){
    this.zoomLevel = scale;
  }

  isMouseHoldInitiated(){
    this.isInterrogatingMouse = true;
    return new Promise((resolve, reject) => {
      this.timer = setTimeout(() => {
        if(!this.hasMouseMoved && !this.hasMouseReleased){
          resolve();
        } else {
          reject("Mouse-hold conditions not met");
        }
      }, this.mouseHoldDetectionTime);
    });
  }

  isMouseHoldWithinTolerance(e){
    return Math.abs(this.mouseHoldStartX - e.clientX) <= this.mouseHoldDetectionMovementTolerance
      || Math.abs(e.clientX - this.mouseHoldStartX) <= this.mouseHoldDetectionMovementTolerance
      || Math.abs(this.mouseHoldStartY - e.clientY) <= this.mouseHoldDetectionMovementTolerance
      || Math.abs(e.clientY - this.mouseHoldStartY) <= this.mouseHoldDetectionMovementTolerance;
  }

  initiateDrawBox(){
    this.drawBox = document.createElement("div");
    this.drawBox.id = "drag-box";
    this.drawBox.style.position = "fixed";
    this.drawBox.style.border = "1px solid #fefefe";
    this.drawBox.style.backgroundColor = "#cecece";
    this.drawBox.style.opacity = .3;
    this.drawBox.style.display = "none";
    document.body.appendChild(this.drawBox)
  }

  activateDrawBox(e){
    this.drawBox.style.display = "block";
    this.drawBox.style.top = e.clientY + "px";
    this.drawBox.style.left = e.clientX + "px";
    this.drawBoxActive = true;
    this.drawBoxStartY = e.clientY;
    this.drawBoxStartX = e.clientX;
  }

  deactivateDrawBox(){
    this.drawBox.style.display = "none";
    this.drawBox.style.width = null;
    this.drawBox.style.height = null;
    this.drawBoxActive = false;
    this.drawBoxStartY = null;
    this.drawBoxStartX = null;
  }

  updateDrawBox(e){
    let top, left, width, height;

    if(e.clientX > this.drawBox.offsetLeft){
      width = e.clientX - this.drawBox.offsetLeft;
    } else {
      left = this.drawBoxStartX - (this.drawBoxStartX - e.clientX);
      width = this.drawBoxStartX - left;
    }

    if(e.clientY > this.drawBox.offsetTop){
      height = e.clientY - this.drawBox.offsetTop;
    } else {
      top = this.drawBoxStartY - (this.drawBoxStartY - e.clientY);
      height = this.drawBoxStartY - top;
    }

    this.drawBox.style.top = top + "px";
    this.drawBox.style.left = left + "px";
    this.drawBox.style.width = width + "px";
    this.drawBox.style.height = height + "px";
  }

  toggleDrawCursor(){
    document.body.style.cursor = this.drawBoxActive ? "crosshair" : "default";
  }

  getDragActiveEventMessage(isActive){
    return new CustomEvent("puzzly_dragandselect_active", { detail: isActive });
  }

  getCollidingPieces(){
    const dragBoxRect = this.drawBox.getBoundingClientRect();
    return Utils.getIndividualPiecesOnCanvas().filter(el =>
      Utils.hasCollision(el.getBoundingClientRect(), dragBoxRect)
    )
  }

  toggleHighlightPieces(pieces){
    pieces.forEach(el => {
      el.style.opacity = this.drawBoxActive ? .5 : 1;
      if(this.drawBoxActive){
        el.classList.add("selected")
      } else {
        el.classList.remove("selected")
      }
    });
  }

  getBoundingBoxForDragContainer(pieces){
    let minX, minY, maxX, maxY;

    for(let i = 0, l = pieces.length; i < l; i++){
      const piece = pieces[i];

      const left = piece.offsetLeft;
      const top = piece.offsetTop;
      const right = piece.offsetLeft + piece.offsetWidth;
      const bottom = piece.offsetTop + piece.offsetHeight;

      if(i === 0){
        minX = left;
        minY = top;
        maxX = right;
        maxY = bottom;
      } else {
        if(left < minX){
          minX = left;
        }
        if(top < minY){
          minY = top;
        }
        if(right > maxX){
          maxX = right;
        }
        if(bottom > maxY){
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
    }
  }

  getContainerForMove(pieces){
    const box = this.getBoundingBoxForDragContainer(pieces);

    const b = document.createElement("div");
    b.id = "selected-pieces-container";
    b.style.position = "absolute";
    // b.style.border = "2px solid";
    b.style.top = box.top + "px";
    b.style.left = box.left + "px";
    b.style.width = box.width + "px";
    b.style.height = box.height + "px";

    pieces.forEach(p => {
      p.style.left = p.offsetLeft - box.left + "px";
      p.style.top = p.offsetTop - box.top + "px";
      b.appendChild(p);
    });

    this.canvas.appendChild(b);
    return b;
  }

  dropPieces(pieces){
    pieces.forEach(p => {
      p.style.left =
        p.offsetLeft +
        parseInt(this.selectedPiecesContainer.style.left) +
        "px";
      p.style.top =
        p.offsetTop +
        parseInt(this.selectedPiecesContainer.style.top) +
        "px";
      this.canvas.appendChild(p);
    });
  }

  resetSelectedPiecesContainer(){
    this.selectedPiecesContainer.display = "none";
  }

  onMouseDown(e){
    e.preventDefault();

    this.hasMouseReleased = false;
    this.isMouseDown = true;
    this.isRightClick = e.which === 3;

    this.mouseHoldStartX = e.clientX;
    this.mouseHoldStartY = e.clientY;

    this.touchStartTime = Date.now();

    const el = e.target;
    const classes = e.target.classList;

    const isEmptySpace = !classes.contains("puzzle-piece") && !classes.contains("svg-image") && !classes.contains("svg-container") && !classes.contains("in-pocket");

    isEmptySpace && !this.isRightClick && this.selectedPieces.length === 0 && this.isMouseHoldInitiated()
      .then(() => {
        this.isMouseDownHeld = true;

        this.activateDrawBox(e);
        this.toggleDrawCursor();

        window.dispatchEvent(this.getDragActiveEventMessage(true));
      })
      .catch(e => {
        this.isMouseDownHeld = false;

        if(this.selectedPieces.length > 0){
          this.dropPieces(this.selectedPieces);
          
          this.selectedPieces = [];
          this.drawBoxActive = false;
          this.selectedPiecesContainer.remove();
          this.selectedPiecesContainer = null;
        }

        window.dispatchEvent(this.getDragActiveEventMessage(false));
      });

    if(!isEmptySpace && this.selectedPieces.length > 0){
      const pieceEl = Utils.getPuzzlePieceElementFromEvent(e);

      if(pieceEl.classList.contains("puzzle-piece") && pieceEl.classList.contains("selected")){
        this.diffX = e.clientX - this.selectedPiecesContainer.offsetLeft * this.zoomLevel;
        this.diffY = e.clientY - this.selectedPiecesContainer.offsetTop * this.zoomLevel;

        this.selectedPiecesAreMoving = true;
      }
    }
  }

  onMouseMove(e){
    e.preventDefault();

    if(this.isMouseDown && this.isInterrogatingMouse && !this.isMouseHoldWithinTolerance(e)){
      this.hasMouseMoved = true;
      this.isInterrogatingMouse = false;
    }

    if(this.isMouseDown && this.drawBoxActive){
      this.updateDrawBox(e);
    }

    if(this.selectedPiecesAreMoving){
      const newPosTop = (e.clientY / this.zoomLevel) - (this.diffY / this.zoomLevel);
      const newPosLeft = (e.clientX / this.zoomLevel) - (this.diffX / this.zoomLevel);

      this.selectedPiecesContainer.style.top = newPosTop + "px";
      this.selectedPiecesContainer.style.left = newPosLeft + "px";
    }
  }

  onMouseUp(e){
    e.preventDefault();

    const droppedElementIsInSelectedGroup = e.target.classList?.contains("selected");

    this.touchEndTime = Date.now();

    this.hasMouseReleased = true;
    this.isMouseDown = false;
    this.isMouseDownHeld = false;
    this.hasMouseMoved = false;

    this.mouseHoldStartX = null;
    this.mouseHoldStartY = null;

    this.selectedPiecesAreMoving = false;

    if(this.touchEndTime - this.touchStartTime < 250){
      this.toggleDrawCursor();
      this.toggleHighlightPieces(this.selectedPieces);

      this.dropPieces(this.selectedPieces);

      window.dispatchEvent(this.getDragActiveEventMessage(false));

      if(this.selectedPieces.length){
        Utils.requestSave(this.selectedPieces);
      }

      this.selectedPiecesContainer?.remove();
      this.selectedPiecesContainer = null;
      
      this.selectedPieces = [];
      this.drawBoxActive = false;

      this.touchStartTime = null;
      this.touchEndTime = null;
    }

    if(this.timer){
      clearTimeout(this.timer);
    }

    if(this.drawBoxActive){
      // Selection box has been drawn
      this.selectedPieces = this.getCollidingPieces();
      this.selectedPiecesContainer = this.getContainerForMove(this.selectedPieces);
      this.selectedPiecesContainerRectLeft = this.selectedPiecesContainer.offsetLeft;
      this.selectedPiecesContainerRectTop = this.selectedPiecesContainer.offsetTop;

      this.piecesSelected = true;

      this.toggleHighlightPieces(this.selectedPieces);
      this.toggleDrawCursor();
      this.deactivateDrawBox();

      window.dispatchEvent(this.getDragActiveEventMessage(true));
    } else if(this.selectedPiecesContainer && droppedElementIsInSelectedGroup){
      // A group of selected pieces has been moved
      console.log("checking out of bounds", this.selectedPiecesContainer)

      if(this.isDragOutOfBounds(e)){
        this.selectedPiecesContainer.style.left = this.selectedPiecesContainerRectLeft + "px";
        this.selectedPiecesContainer.style.top = this.selectedPiecesContainerRectTop + "px";
      } else {
        this.selectedPiecesContainerRectLeft = this.selectedPiecesContainer.offsetLeft;
        this.selectedPiecesContainerRectTop = this.selectedPiecesContainer.offsetTop;
      }
    }
  }

  isDragOutOfBounds(e){
    const selectedPiecesRect = this.selectedPiecesContainer.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    return !Utils.isInside(selectedPiecesRect, canvasRect);
  }
}

export default DragAndSelect;
