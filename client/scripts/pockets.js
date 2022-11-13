import Utils from "./utils.js";

class Pockets {
  constructor(config){
    this.mainCanvas = config.canvas;
    this.shadowOffset = config.shadowOffset;
    this.borderColor = "#cecece";
    this.hasCapture = false;
    this.elementClone = null;

    this.pocketWidth = window.innerWidth / 4;
    this.pocketHeight = 250;
    this.uiWidth = "100%";
    
    this.pocketDropBoundingBox = this.getTargetBoxForPlacementInsidePocket(config.pieceSize);

    this.pockets = {};

    this.render();
    this.setScale(config.zoomLevel);

    window.addEventListener("mousedown", e => this.onMouseDown(e));
    window.addEventListener("mousemove", e => this.onMouseMove(e));
    window.addEventListener("mouseup", e => this.onMouseUp(e));

    return this;
  }

  setScale(num){
    this.scale = num;
  }

  makePocket(id, lastPocket = false){
    const pocket = document.createElement("div");
    pocket.id = `group-draw-${id}`;
    pocket.classList.add("pocket");
    pocket.style.width = "25%";
    pocket.style.height = "100%";
    pocket.style.display = "flex";
    pocket.style.position = "relative";
    pocket.style.boxSizing = "border-box";
    pocket.style.borderTop = `2px solid ${this.borderColor}`;

    if(!lastPocket){
      pocket.style.borderRight = `2px solid ${this.borderColor}`;
    }

    this.pockets[id] = pocket;

    return pocket;
  }

  onMouseDown(e){
    const el = e.target;
    const isPuzzlePiece = el.classList.contains("puzzle-piece");

    if(isPuzzlePiece && !Utils.hasGroup(el)){
      this.isMovingSinglePiece = true;
      this.isMouseDown = true;
      this.movingElement = el;

      if(this.isOverPockets(el) && this.elementClone === null){
        this.makeClone(this.movingElement);
      }
    } else {
      this.isMouseDown = false;
      this.isMovingSinglePiece = false;
    }
  }

  onMouseMove(e){
    if(this.isMouseDown && this.isMovingSinglePiece){
      if(this.isMovingSinglePiece){
        if(this.isOverPockets(this.movingElement) && this.elementClone === null){
          this.makeClone(this.movingElement);
        }

        if(!this.isOverPockets(this.movingElement) && this.elementClone){
          this.removeClone(this.movingElement);
        }

        if(this.elementClone){
          this.setClonePosition();
        }
      }
    }
  }

  onMouseUp(e){
    console.log("on mouse up", e.target)
    if(this.eventTargetIsPocket(e)){
      const pocketId = e.target.id.split("-")[2];
      this.addToPocket(this.movingElement, pocketId);
    }

    if(this.elementClone){
      this.removeClone();
    }

    if(this.isMouseDown){
      this.isMouseDown = false;
      this.movingElement = null;
    }
  }

  eventTargetIsPocket(e){
    return e.target.classList.contains("pocket");
  }

  addToPocket(element, pocketId){
    let dropX, dropY;
    const pocket = this.pockets[pocketId];

    console.log('bb', this.pocketDropBoundingBox)
    if(pocket.childNodes.length === 0){
      dropX = pocket.offsetWidth / 2 - element.offsetWidth / 2;
      dropY = pocket.offsetHeight / 2 - element.offsetHeight / 2;
    } else {
      console.log("placing randomly around center")
      dropX = Utils.getRandomInt(this.pocketDropBoundingBox.left, this.pocketDropBoundingBox.right);
      dropY = Utils.getRandomInt(this.pocketDropBoundingBox.top, this.pocketDropBoundingBox.bottom);
    }
    console.log("x", dropX)
    console.log("y", dropY)
    element.style.top = dropY + "px";
    element.style.left = dropX + "px";

    pocket.appendChild(element)
  }

  getTargetBoxForPlacementInsidePocket(pieceSize){
    const expansionRange = 50;
    const pocketWidth = this.pocketWidth;
    const pocketHeight = this.pocketHeight;
    const pocketCenterX = pocketWidth / 2;
    const pocketCenterY = pocketHeight / 2;
    const pieceSizeHalf = pieceSize / 2;

    const centerBoundingBox = {
      top: pocketCenterY - pieceSizeHalf,
      right: pocketCenterX + pieceSizeHalf,
      bottom: pocketCenterY + pieceSizeHalf,
      left: pocketCenterX - pieceSizeHalf,
    };

    const expandeCenterBoundingBox = {
      top: centerBoundingBox.top - expansionRange,
      right: centerBoundingBox.right + expansionRange,
      bottom: centerBoundingBox.bottom + expansionRange,
      left: centerBoundingBox.left - expansionRange,
    };

    return {
      top: expandeCenterBoundingBox.top,
      right: expandeCenterBoundingBox.right - pieceSize,
      bottom: expandeCenterBoundingBox.bottom - pieceSize,
      left: expandeCenterBoundingBox.left,
    }
  }

  makeClone(element){
    this.elementClone = element.cloneNode(true);
    this.elementClone.style.transform = `scale(${this.scale})`;
    this.elementClone.style.pointerEvents = "none";
    this.cloneContainer.appendChild(this.elementClone);
    this.setClonePosition();
  }

  setClonePosition(){
    this.elementClone.style.top = (this.mainCanvas.offsetTop + this.movingElement.offsetTop) + "px";
    this.elementClone.style.left = (this.mainCanvas.offsetLeft + this.movingElement.offsetLeft) + "px";
  }

  removeClone(){
    this.elementClone.remove();
    this.elementClone = null;
  }

  isOverPockets(element){
    const bb = element.getBoundingClientRect();
    bb.width += this.shadowOffset;
    bb.height += this.shadowOffset;
    return Utils.hasCollision(bb, this.boundingBox);
  }

  render(){
    const container = document.createElement("div");
    container.id = "side-groups";
    container.style.width = this.uiWidth;
    container.style.height = this.pocketHeight + "px";
    container.style.position = "fixed";
    container.style.bottom = 0;
    container.style.left = 0;

    const shade = document.createElement("div");
    shade.style.width = "100%";
    shade.style.height = "100%";
    shade.style.backgroundColor = "#000";
    shade.style.position = "absolute";
    shade.style.top = 0;
    shade.style.left = 0;
    container.appendChild(shade);

    const drawContainer = document.createElement("div");
    drawContainer.style.display = "flex";
    drawContainer.style.height = "100%";
    drawContainer.style.flexDirection = "columns";
    drawContainer.style.position = "relative";
    drawContainer.style.top = 0;
    drawContainer.style.left = 0;
    container.appendChild(drawContainer);

    drawContainer.appendChild(this.makePocket(1));
    drawContainer.appendChild(this.makePocket(2));
    drawContainer.appendChild(this.makePocket(3));
    drawContainer.appendChild(this.makePocket(4, true));

    const cloneContainer = document.createElement("div");
    cloneContainer.style.width = window.innerWidth + "px";
    cloneContainer.style.height = window.innerHeight + "px";
    cloneContainer.style.position = "fixed";
    cloneContainer.style.bottom = 0;
    cloneContainer.style.left = 0;
    cloneContainer.style.pointerEvents = "none";
    this.cloneContainer = cloneContainer;
    container.appendChild(cloneContainer);
    document.body.appendChild(container);

    this.ui = container;

    this.boundingBox = {
      top: window.innerHeight - container.offsetHeight,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0,
    };
  }
}

export default Pockets;
