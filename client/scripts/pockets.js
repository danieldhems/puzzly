import Utils from "./utils.js";

class Pockets {
  constructor(config){
    console.log(config)
    this.mainCanvas = config.canvas;
    this.shadowOffset = config.shadowOffset;
    this.borderColor = "#cecece";
    this.hasCapture = false;
    this.elementClone = null;

    this.isMainCanvasMoving = false;

    this.pocketWidth = window.innerWidth / 4;
    this.pocketHeight = 250;
    this.uiWidth = "100%";
    this.pieceScaleWhileInPocket = .8;
    
    this.pocketDropBoundingBox = this.getTargetBoxForPlacementInsidePocket(config.pieceSize);

    this.pockets = {};
    this.activePiecesInTransit = null;

    this.render();
    this.setScale(config.zoomLevel);

    window.addEventListener("mousedown", e => this.onMouseDown(e));
    window.addEventListener("mouseup", e => this.onMouseUp(e));

    return this;
  }

  setScale(num){
    this.zoomLevel = num;
    this.pocketBridge.style.transform = `scale(${num})`;
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

    this.pockets[id] = {
      el: pocket,
    };

    return pocket;
  }

  getPocketIdFromPiece(el){
    return el.parentNode.id.split("-")[2];
  }

  setPieceSize(el, scale){
    el.style.transform = `scale(${scale})`;
  }

  setSizeForPiecesInPocket(){
    this.getPiecesInActivePocket().forEach(el => this.setPieceSize(el, this.pieceScaleWhileInPocket));
  }

  resetPieceScale(el){
    el.style.transform = "scale(1)";
  }

  setActivePiecesToPocketSize(){
    const activePieces = this.getPiecesInActivePocket();
    if(activePieces){
      Array.from(activePieces).forEach(el => {
        this.setPieceSize(el, this.pieceScaleWhileInPocket)
      });
    }
  }

  setActivePiecesToCurrentScale(){
    const activePieces = this.getPiecesInActivePocket();
    if(activePieces){
      Array.from(activePieces).forEach(el => {
        this.setPieceSize(el, this.zoomLevel)
      });
    }
  }

  getPocketByCollision(box){
    if(this.isOverPockets(box)){
      let i = 1;
      while(i <= Object.keys(this.pockets).length){
        const pocket = this.pockets[i].el;
        if(Utils.hasCollision(box, pocket.getBoundingClientRect())){
          return pocket;
        }
        i++;
      };
    }
  }

  isFromPocket(el){
    return el.parentNode.classList?.contains("pocket");
  }

  isFromCanvas(el){
    return el.parentNode.id === "canvas";
  }

  getPocketIdFromElement(el){
    return el.classList?.contains("pocket") && el.id.split("-")[2];
  }

  getEventBoundingBox(e){
    return {top: e.clientY, right: e.clientX, bottom: e.clientY, left: e.clientX};
  }

  onMouseDown(e){
    const el = e.target;

    // If the empty space inside a pocket is clicked, do nothing
    if(el.classList?.contains("pocket")){
      return;
    }

    const isPuzzlePiece = el.classList.contains("puzzle-piece");
    const hasGroup = isPuzzlePiece && Utils.hasGroup(el);
    const shouldTrackPiece = isPuzzlePiece && !hasGroup;

    const isMainCanvas = el.id === "canvas" || el.id === "boardArea" || el.dataset?.isSolved === "true";

    // Picking up a single piece from the canvas
    if(shouldTrackPiece && this.isFromCanvas(el)){
      this.isMovingSinglePiece = true;
      this.movingElement = el;

      if(this.isOverPockets(el.getBoundingClientRect()) && this.elementClone === null){
        this.makeClone(el);
      }
    }

    // Piece is being picked up from a pocket
    if(this.isFromPocket(el)){
      this.activePocket = this.pockets[this.getPocketIdFromPiece(el)].el;
      this.activePiecesInTransit = this.activePocket.childNodes;
      this.setActivePiecesToCurrentScale();
      this.movingElement = this.makePopupContainerForActivePieces();
      console.log(this.activePiecesInTransit)
      this.pocketBridge.appendChild(this.movingElement);
    }

    if(isMainCanvas) {
      this.isMainCanvasMoving = true;
    }

    this.mouseFn = e => this.onMouseMove(e);

    if(isPuzzlePiece || isMainCanvas){
      window.addEventListener("mousemove", this.mouseFn);
    } else {
      this.isMouseDown = false;
      this.isMovingSinglePiece = false;
    }
  }

  onMouseMove(e){
    if(this.isMovingSinglePiece){
      if(this.isOverPockets(this.movingElement.getBoundingClientRect()) && this.elementClone === null){
        this.makeClone(this.movingElement);
      } else if(!this.isOverPockets(this.movingElement.getBoundingClientRect()) && this.elementClone){
        this.removeClone(this.movingElement);
      }

      if(this.elementClone){
        this.setClonePosition();
      }
    }
  }

  onMouseUp(e){
    // console.log("on mouse up", e)
    const eventBox = this.getEventBoundingBox(e);
    const pocketByCollision = this.getPocketByCollision(eventBox);

    if(pocketByCollision){
      if(this.activePocket){
        console.log(this.activePiecesInTransit)
        this.addPiecesToPocket(this.activePocket, this.activePiecesInTransit)
        this.setActivePiecesToPocketSize();
        // this.activePiecesContainer.remove();
      } else {
        this.addToPocket(this.movingElement, pocketByCollision);
      }
    } else {
      if(this.activePocket){
        this.returnToCanvas(this.getPiecesInActivePocket());
        this.resetActivePocket();
      }

      if(this.elementClone){
        this.removeClone();
      }
    }

    if(this.isMainCanvasMoving){
      this.setCloneContainerPosition();
    }

    if(this.isMovingSinglePiece){
      this.isMovingSinglePiece = false;
    }

    this.movingElement = null;
    this.isMainCanvasMoving = false;

    window.removeEventListener("mousemove", this.mouseFn);
  }

  eventTargetIsPocket(e){
    return e.target.classList.contains("pocket");
  }

  eventTargetIsCanvas(e){
    return e.target.id === "canvas";
  }

  getPiecesInActivePocket(){
    return this.activePocket?.childNodes;
  }

  // Create a container for all the pieces in a given pocket with the pieces arranged in a grid.
  // This container will be set as the movingElement.
  makePopupContainerForActivePieces(){
    // Need this to keep track of active pieces when they're not inside a pocket, as we're about to take them out in this method.
    // This will be useful for putting them back in a pocket.
    const activePieces = this.getPiecesInActivePocket();

    const container = document.createElement("div");
    container.classList.add("active-pieces-container");

    const pocketBox = this.activePocket.getBoundingClientRect();
    container.style.position = "absolute";
    container.style.top = pocketBox.top + "px";
    container.style.left = pocketBox.left + "px";
    this.activePiecesContainer = container;
    
    const pieceMargin = 5 / activePieces[0].offsetWidth * 100;
    const rowLength = activePieces.length > 2 ? Math.round(Math.sqrt(activePieces)) : 2;

    let currX = 0, currY = 0;
    let colNumber = 1;

    Array.from(activePieces).forEach((p, i) => {
      p.style.top = currY + "px";
      p.style.left = currX + "px";

      currX += this.largestPieceSpan + pieceMargin;

      if(colNumber === rowLength){
        currY += this.largestPieceSpan + pieceMargin;
        currX = 0;
        colNumber = 0;
      } else {
        colNumber++;
      }

      container.appendChild(p);
    });

    return container;
  }

  resetActivePocket(){
    this.activePocket = null;
  }

  addToPocket(element, pocket){
    if(!element) return;

    let dropX, dropY;

    // console.log('bb', this.pocketDropBoundingBox)
    if(pocket?.childNodes?.length === 0){
      dropX = pocket.offsetWidth / 2 - element.offsetWidth / 2;
      dropY = pocket.offsetHeight / 2 - element.offsetHeight / 2;
    } else {
      // console.log("placing randomly around center")
      dropX = Utils.getRandomInt(this.pocketDropBoundingBox.left, this.pocketDropBoundingBox.right);
      dropY = Utils.getRandomInt(this.pocketDropBoundingBox.top, this.pocketDropBoundingBox.bottom);
    }
    // console.log("x", dropX)
    // console.log("y", dropY)
    element.style.top = dropY + "px";
    element.style.left = dropX + "px";

    pocket?.appendChild(element);

    if(this.elementClone){
      this.removeClone();
    }

    element.classList.add("in-pocket");

    this.setPieceSize(element, this.pieceScaleWhileInPocket);
    // this.setActivePiecesToPocketSize();
  }

  addPiecesToPocket(pocket, pieces){
    Array.from(pieces).forEach(p => pocket.appendChild(p));
  }

  returnToCanvas(els){
    Array.from(els).forEach(el => {
      const rect = el.getBoundingClientRect();
      el.style.top = rect.top - this.mainCanvas.offsetTop + "px";
      el.style.left = rect.left - this.mainCanvas.offsetLeft + "px";
      this.mainCanvas.appendChild(el);
      el.classList.remove("in-pocket");
    })
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
    this.elementClone.style.pointerEvents = "none";
    this.pocketBridge.appendChild(this.elementClone);
    this.setClonePosition();
    this.pocketBridge.style.zIndex = 2;
  }

  setClonePosition(){
    this.elementClone.style.top = this.movingElement.offsetTop + "px";
    this.elementClone.style.left = this.movingElement.offsetLeft + "px";
  }

  setCloneContainerPosition(){
    this.pocketBridge.style.top = parseInt(this.mainCanvas.style.top) + "px";
    this.pocketBridge.style.left = parseInt(this.mainCanvas.style.left) + "px";
  }

  removeClone(){
    this.elementClone.remove();
    this.elementClone = null;
    this.pocketBridge.style.zIndex = 1;
  }

  isOverPockets(box){
    if(!box) return;
    box.width += this.shadowOffset;
    box.height += this.shadowOffset;
    return Utils.hasCollision(box, this.boundingBox);
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
    cloneContainer.id = "pocket-bridge";
    cloneContainer.style.width = this.mainCanvas.offsetWidth + "px";
    cloneContainer.style.height = this.mainCanvas.offsetHeight + "px";
    cloneContainer.style.position = "fixed";
    cloneContainer.style.bottom = 0;
    cloneContainer.style.left = 0;
    cloneContainer.style.pointerEvents = "none";
    this.pocketBridge = cloneContainer;
    container.appendChild(cloneContainer);
    document.body.appendChild(container);

    this.ui = container;
    this.pocketBridge = cloneContainer;

    this.boundingBox = {
      top: window.innerHeight - container.offsetHeight,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0,
    };
  }
}

export default Pockets;
