import Utils from "./utils.js";

class DragAndSelect {
  constructor(){
    this.isMouseDown = false;
    this.isMouseDownHeld = false;
    this.hasMouseReleased = false;
    this.isInterrogatingMouse = false;

    this.mouseHoldDetectionTime = 1000;
    this.mouseHoldDetectionMovementTolerance = 20;

    this.dragBox;

    this.timer = null;

    this.initiateDragBox();

    window.addEventListener("mousedown", e => this.onMouseDown(e))
    window.addEventListener("mousemove", e => this.onMouseMove(e))
    window.addEventListener("mouseup", e => this.onMouseUp(e))
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
    // console.log(e.clientX, e.clientY);
    // console.log(this.mouseHoldStartX, this.mouseHoldStartY)
    // console.log(this.mouseHoldDetectionMovementTolerance)

    // console.log("condition 1", Math.abs(this.mouseHoldStartX - e.clientX))
    // console.log("condition 2", Math.abs(e.clientX - this.mouseHoldStartX))
    // console.log("condition 3", Math.abs(this.mouseHoldStartY - e.clientY))
    // console.log("condition 4", Math.abs(e.clientY - this.mouseHoldStartY))
    return Math.abs(this.mouseHoldStartX - e.clientX) <= this.mouseHoldDetectionMovementTolerance
      || Math.abs(e.clientX - this.mouseHoldStartX) <= this.mouseHoldDetectionMovementTolerance
      || Math.abs(this.mouseHoldStartY - e.clientY) <= this.mouseHoldDetectionMovementTolerance
      || Math.abs(e.clientY - this.mouseHoldStartY) <= this.mouseHoldDetectionMovementTolerance;
  }

  initiateDragBox(){
    this.dragBox = document.createElement("div");
    this.dragBox.id = "drag-box";
    this.dragBox.style.position = "fixed";
    this.dragBox.style.border = "1px solid #fefefe";
    this.dragBox.style.backgroundColor = "#cecece";
    this.dragBox.style.opacity = .3;
    this.dragBox.style.display = "none";
    document.body.appendChild(this.dragBox)
  }

  activateDragBox(e){
    this.dragBox.style.display = "block";
    this.dragBox.style.top = e.clientY + "px";
    this.dragBox.style.left = e.clientX + "px";
    this.dragBoxActive = true;
    this.dragBoxStartY = e.clientY;
    this.dragBoxStartX = e.clientX;
  }

  deactivateDragBox(){
    this.dragBox.style.display = "none";
    this.dragBox.style.width = null;
    this.dragBox.style.height = null;
    this.dragBoxActive = false;
    this.dragBoxStartY = null;
    this.dragBoxStartX = null;
  }

  updateDragBox(e){
    let top, left, width, height;

    if(e.clientX > this.dragBox.offsetLeft){
      width = e.clientX - this.dragBox.offsetLeft;
    } else {
      left = this.dragBoxStartX - (this.dragBoxStartX - e.clientX);
      width = this.dragBoxStartX - left;
    }

    if(e.clientY > this.dragBox.offsetTop){
      height = e.clientY - this.dragBox.offsetTop;
    } else {
      top = this.dragBoxStartY - (this.dragBoxStartY - e.clientY);
      height = this.dragBoxStartY - top;
    }

    this.dragBox.style.top = top + "px";
    this.dragBox.style.left = left + "px";
    this.dragBox.style.width = width + "px";
    this.dragBox.style.height = height + "px";
  }

  getDragEventMessage(isActive){
    return new CustomEvent("puzzly_drag_and_select", { detail: isActive });
  }

  getCollidingPieces(){
    const dragBoxRect = this.dragBox.getBoundingClientRect();
    return Utils.getIndividualPiecesOnCanvas().filter(el =>
      Utils.hasCollision(el.getBoundingClientRect(), dragBoxRect)
    )
  }

  onMouseDown(e){
    e.preventDefault();
    
    const classes = e.target.classList;
    const isEmptySpace = !classes.contains("puzzle-piece") && !classes.contains("in-pocket");

    this.hasMouseReleased = false;

    this.isMouseDown = true;

    this.mouseHoldStartX = e.clientX;
    this.mouseHoldStartY = e.clientY;

    isEmptySpace && this.isMouseHoldInitiated()
      .then(() => {
        this.isMouseDownHeld = true;
        this.activateDragBox(e);
        window.dispatchEvent(this.getDragEventMessage(true));
      })
      .catch(e => {
        console.log(e)
        this.isMouseDownHeld = false;
        window.dispatchEvent(this.getDragEventMessage(false));
      })
  }

  onMouseMove(e){
    e.preventDefault();

    if(this.isMouseDown && this.isInterrogatingMouse && !this.isMouseHoldWithinTolerance(e)){
      this.hasMouseMoved = true;
      this.isInterrogatingMouse = false;
    }

    if(this.dragBoxActive){
      this.updateDragBox(e);
    }
  }

  onMouseUp(e){
    e.preventDefault();
    this.hasMouseReleased = true;
    this.isMouseDown = false;
    this.isMouseDownHeld = false;
    this.hasMouseMoved = false;

    this.mouseHoldStartX = null;
    this.mouseHoldStartY = null;

    if(this.timer){
      clearTimeout(this.timer);
    }

    if(this.dragBoxActive){
      this.selectedPieces = this.getCollidingPieces();
      console.log(pieces)
      this.deactivateDragBox();
    }

    window.dispatchEvent(this.getDragEventMessage(false));
  }
}

export default DragAndSelect;
