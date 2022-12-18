import Utils from "./utils.js";

class DragAndSelect {
  constructor(opts){
    this.canvas = opts.canvas;
    this.zoomLevel = opts.zoomLevel;
    this.selectedPieces = [];

    this.isMouseDown = false;
    this.isMouseDownHeld = false;
    this.hasMouseReleased = false;
    this.isInterrogatingMouse = false;
    this.selectedPiecesAreMoving = false;

    this.mouseHoldDetectionTime = 1000;
    this.mouseHoldDetectionMovementTolerance = 20;

    this.drawBox;

    this.timer = null;

    this.touchStartTime;
    this.touchEndTime;

    this.initiateDrawBox();

    window.addEventListener("mousedown", e => this.onMouseDown(e))
    window.addEventListener("mousemove", e => this.onMouseMove(e))
    window.addEventListener("mouseup", e => this.onMouseUp(e))
    window.addEventListener("mouseclick", e => this.onMouseClick(e))
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

  getDrawBoxEventMessage(isActive){
    return new CustomEvent("puzzly_dragandselect_drawing_box", { detail: isActive });
  }

  getDragActiveEventMessage(isActive){
    return new CustomEvent("puzzly_dragandselect_active", { detail: isActive });
  }

  getMoveBoxEventMessage(isActive){
    return new CustomEvent("puzzly_dragandselect_moving_box", { detail: isActive });
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

  getContainerForMove(pieces){
    const canvasBox = this.canvas.getBoundingClientRect();

    const b = document.createElement("div");
    b.id = "drag-container";
    b.style.position = "absolute";
    // b.style.border = "2px solid";
    b.style.top = "0px";
    b.style.left = "0px";
    b.style.width = canvasBox.width + "px";
    b.style.height = canvasBox.height + "px";

    pieces.forEach(p => {
      p.style.left = p.offsetLeft + "px";
      p.style.top = p.offsetTop + "px";
      b.appendChild(p);
    });

    this.canvas.appendChild(b);
    return b;
  }

  dropPieces(pieces){
    console.log("dropping pieces", pieces)
    pieces.forEach(p => {
      p.style.left =
        p.offsetLeft +
        parseInt(this.movingContainer.style.left) +
        "px";
      p.style.top =
        p.offsetTop +
        parseInt(this.movingContainer.style.top) +
        "px";
      this.canvas.appendChild(p);
    });
  }

  onMouseDown(e){
    e.preventDefault();

    const el = e.target;
    
    const classes = e.target.classList;
    const isEmptySpace = !classes.contains("puzzle-piece") && !classes.contains("in-pocket");

    this.hasMouseReleased = false;
    this.isMouseDown = true;

    this.mouseHoldStartX = e.clientX;
    this.mouseHoldStartY = e.clientY;

    this.touchStartTime = Date.now();

    isEmptySpace && this.selectedPieces.length === 0 && this.isMouseHoldInitiated()
      .then(() => {
        this.isMouseDownHeld = true;

        this.activateDrawBox(e);
        this.toggleDrawCursor();

        window.dispatchEvent(this.getDrawBoxEventMessage(true));
      })
      .catch(e => {
        console.log(e)
        this.isMouseDownHeld = false;

        if(this.selectedPieces.length > 0){
          this.dropPieces(this.selectedPieces);
          this.toggleHighlightPieces(this.selectedPieces);
          this.toggleDrawCursor();

          this.selectedPieces = [];
          this.drawBoxActive = false;
          this.movingContainer.remove();
          this.movingContainer = null;
        }

        window.dispatchEvent(this.getDrawBoxEventMessage(false));
        window.dispatchEvent(this.getMoveBoxEventMessage(false));
        window.dispatchEvent(this.getDragActiveEventMessage(false));
      })

    if(this.selectedPieces.length > 0){
      if(el.classList.contains("puzzle-piece") && el.classList.contains("selected")){
        window.dispatchEvent(this.getMoveBoxEventMessage(true));

        this.diffX = e.clientX - this.movingContainer.offsetLeft;
        this.diffY = e.clientY - this.movingContainer.offsetTop;

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

      this.movingContainer.style.top = newPosTop + "px";
      this.movingContainer.style.left = newPosLeft + "px";
    }
  }

  onMouseUp(e){
    e.preventDefault();

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
      Utils.requestSave(this.selectedPieces);

      this.movingContainer?.remove();
      this.movingContainer = null;
      
      this.selectedPieces = [];
      this.selectedPiecesAreMoving = false;
      this.drawBoxActive = false;

      this.touchStartTime = null;
      this.touchEndTime = null;
    }

    if(this.timer){
      clearTimeout(this.timer);
    }

    if(this.drawBoxActive){
      this.selectedPieces = this.getCollidingPieces();
      this.movingContainer = this.getContainerForMove(this.selectedPieces);

      this.toggleHighlightPieces(this.selectedPieces);
      this.toggleDrawCursor();
      this.deactivateDrawBox();

      window.dispatchEvent(this.getDragActiveEventMessage(true));
    }

    window.dispatchEvent(this.getDrawBoxEventMessage(false));
  }
}

export default DragAndSelect;
