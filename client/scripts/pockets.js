import Utils from "./utils.js";

class Pockets {
  constructor(config){
    this.mainCanvas = config.canvas;
    this.shadowOffset = config.shadowOffset;
    this.largestPieceSpan = config.largestPieceSpan;
    this.connectorSize = config.connectorSize;
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
    this.activePocketHasMultiplePieces = false;

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

  getIdForPocket(pocket){
    return pocket.id.split("-")[2];
  }

  setPieceSize(el, scale = null){
    // When returning pieces to the canvas we need to remove the scale transform from them in order for them to be correctly scaled by the canvas itself, else they'll end up smaller or large than intended
    el.style.transform = scale ? `scale(${scale})` : 'none';
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
    e.stopPropagation();
    const el = e.target;

    let diffX, diffY;

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
      this.setActivePiecesToCurrentScale();

      this.lastPosition = el.getBoundingClientRect();

      if(this.getPiecesInActivePocket().length > 1){
        this.movingElement = this.getMovingElementForActivePocket(e);
        this.activePocket.appendChild(this.movingElement);
      } else {
        this.movingElement = el;
      }

      diffX = e.clientX - this.movingElement.offsetLeft;
      diffY = e.clientY - this.movingElement.offsetTop;
    }

    if(isMainCanvas) {
      this.isMainCanvasMoving = true;
    }

    this.mouseFn = e => this.onMouseMove(e, diffX, diffY);

    if(isPuzzlePiece || isMainCanvas){
      window.addEventListener("mousemove", this.mouseFn);
    } else {
      this.isMouseDown = false;
      this.isMovingSinglePiece = false;
    }
  }

  onMouseMove(e, diffX, diffY){
    e.preventDefault();
    if(this.isMovingSinglePiece){
      if(this.isOverPockets(this.movingElement.getBoundingClientRect()) && this.elementClone === null){
        this.makeClone(this.movingElement);
      } else if(!this.isOverPockets(this.movingElement.getBoundingClientRect()) && this.elementClone){
        this.removeClone(this.movingElement);
      }

      if(this.elementClone){
        this.setClonePosition();
      }
    } else if(this.activePocket) {
      const x = diffX ? e.clientX - diffX : e.clientX;
      const y = diffY ? e.clientY - diffY : e.clientY;
      this.movingElement.style.top = y + "px";
      this.movingElement.style.left = x + "px";

      const box = this.movingElement.getBoundingClientRect();
    }
  }

  onMouseUp(e){
    // console.log("on mouse up", e)
    const eventBox = this.getEventBoundingBox(e);
    const targetPocket = this.getPocketByCollision(eventBox);

    if(targetPocket){
      if(this.activePocket){
        if(this.getPiecesInTransit().length > 1){
          this.addPiecesToPocket(targetPocket, this.movingElement.childNodes);
          this.movingElement.remove();
        } else {
          this.addToPocket(targetPocket, this.movingElement);
        }
        this.setActivePiecesToPocketSize();
      } else {
        this.addToPocket(targetPocket, this.movingElement);
      }
    } else {
      if(this.activePocket){
        if(Utils.isOutOfBounds(this.movingElement.getBoundingClientRect())){

        }
        this.returnToCanvas(this.getPiecesInTransit());
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

    if(this.activePiecesContainer){
      this.activePiecesContainer.remove();
      this.activePiecesContainer = null;
    }

    this.clearPocketBridge();

    this.movingElement = null;
    this.isMainCanvasMoving = false;
    this.activePocket = null;

    window.removeEventListener("mousemove", this.mouseFn);
  }

  eventTargetIsPocket(e){
    return e.target.classList.contains("pocket");
  }

  eventTargetIsCanvas(e){
    return e.target.id === "canvas";
  }

  getPiecesInActivePocket(){
    return Array.from(this.activePocket.childNodes).filter(el => el.classList.contains("puzzle-piece"));
  }

  getPiecesInTransit(){
    if(this.movingElement.classList.contains("active-pieces-container")){
      return Array.from(this.movingElement.childNodes);
    } else {
      return [this.movingElement];
    }
  }

  getPiecePosByConnectors(x, y, el){
    const pos = {
      x, y
    };
    const connectors = el.dataset.jigsawType.split(",");

    if(connectors[3] === "0" || connectors[3] === "-1"){
      pos.x = x + this.connectorSize;
    } else {
      pos.x = x;
    }

    if(connectors[0] === "0" || connectors[0] === "-1"){
      pos.y = y + this.connectorSize;
    } else {
      pos.y = y;
    }

    pos.x *= this.zoomLevel;
    pos.y *= this.zoomLevel;

    return pos;
  }

  // Create a container for all the pieces in a given pocket with the pieces arranged in a grid.
  // This container will be set as the movingElement.
  getMovingElementForActivePocket(e){
    const activePieces = Array.from(this.getPiecesInActivePocket());

    if(activePieces.length === 1) return activePieces[0];

    this.activePocketHasMultiplePieces = true;

    const container = document.createElement("div");
    container.classList.add("active-pieces-container");
    container.style.border = "1px solid white";
    container.style.position = "absolute";

    this.activePiecesContainer = container;
    
    const pieceMargin = this.connectorSize;
    const rowLength = activePieces.length > 2 ? Math.ceil(Math.sqrt(activePieces.length)) : 2;

    let currX = 0, currY = 0;
    let colNumber = 1;
    let numRows = 0;
    let maxX = 0, maxY = 0;

    let firstPieceOnRow = activePieces[0];

    for(let i = 0, l = activePieces.length; i < l; i++){
      const el = activePieces[i];

      const pos = this.getPiecePosByConnectors(currX, currY, el)

      el.style.top = pos.y + "px";
      el.style.left = pos.x + "px";

      if(currX + el.offsetWidth > maxX){
        maxX = currX + el.offsetWidth * this.zoomLevel;
      }

      if(currY + el.offsetHeight > maxY){
        maxY = currY + el.offsetHeight * this.zoomLevel;
      }

      currX += this.largestPieceSpan + pieceMargin * this.zoomLevel;

      if(colNumber === rowLength){
        currY += this.largestPieceSpan + pieceMargin * this.zoomLevel;
        currX = 0;
        colNumber = 1;
        numRows++;

        firstPieceOnRow = el; 
      } else {
        colNumber++;
      }

      container.appendChild(el);
    };

    container.style.width = maxX + "px";
    container.style.height = maxY + "px";

    const pocketBox = this.activePocket.getBoundingClientRect();

    const x = e.clientX - pocketBox.left - (parseInt(container.style.width) / 2);
    const y = e.clientY - pocketBox.top - (parseInt(container.style.height) / 2);
    
    container.style.top = y + "px";
    container.style.left = x + "px";

    return container;
  }

  resetActivePocket(){
    this.activePocket = null;
  }

  clearPocketBridge(){
    Array.from(this.pocketBridge?.childNodes).forEach(el => el.remove());
  }

  addToPocket(pocket, element){
    if(!element) return;

    let pocketId, pocketEl;

    if(Number.isInteger(pocket)){
      pocketEl = this.pockets[pocket].el;
      pocketId = pocket;
    } else {
      pocketEl = pocket;
      pocketId = this.getIdForPocket(pocket);
    }

    let dropX, dropY;

    // console.log('bb', this.pocketDropBoundingBox)
    if(pocketEl?.childNodes?.length === 0){
      dropX = pocketEl.offsetWidth / 2 - element.offsetWidth / 2;
      dropY = pocketEl.offsetHeight / 2 - element.offsetHeight / 2;
    } else {
      // console.log("placing randomly around center")
      dropX = Utils.getRandomInt(this.pocketDropBoundingBox.left, this.pocketDropBoundingBox.right);
      dropY = Utils.getRandomInt(this.pocketDropBoundingBox.top, this.pocketDropBoundingBox.bottom);
    }
    // console.log("x", dropX)
    // console.log("y", dropY)
    element.style.top = dropY + "px";
    element.style.left = dropX + "px";

    element.setAttribute("data-pocket-id", pocketId);
    element.classList.add("in-pocket");

    pocketEl?.appendChild(element);

    if(this.elementClone){
      this.removeClone();
    }

    this.setPieceSize(element, this.pieceScaleWhileInPocket);
    this.requestSave([element])
  }

  addPiecesToPocket(pocket, pieces){
    const pieceArray = Array.from(pieces);
    pieceArray.forEach(p => this.addToPocket(pocket, p));
  }

  returnToCanvas(els){
    for(let i = 0, l = els.length; i < l; i++){
      const el = els[i];

      const cnv = this.mainCanvas;

      const elBox = el.getBoundingClientRect();
      const cnvRect = cnv.getBoundingClientRect();
      
      // console.log("elBox", elBox)
      // console.log("cnvRect", cnvRect)

      // const div = document.createElement("div");
      // div.style.position = "absolute";
      // div.style.top = cnvRect.top + "px";
      // div.style.left = cnvRect.left + "px";
      // div.style.width = cnvRect.width + "px";
      // div.style.height = cnvRect.height + "px";
      // div.style.border = "2px solid red";
      // div.style.pointerEvents = "none";
      // document.body.appendChild(div);

      const pos = Utils.getPositionRelativeToCanvas(el, this.zoomLevel)

      el.style.top = pos.y + "px";
      el.style.left = pos.x + "px";

      this.setPieceSize(el);
      this.mainCanvas.appendChild(el);
      el.classList.remove("in-pocket");
      el.setAttribute("data-pocket-id", null);

      this.notifyDrop(el);
    };

    this.requestSave(els)
  }

  requestSave(pieces){
    const event = new CustomEvent("puzzly_save", { detail: { pieces }});
    window.dispatchEvent(event)
  }

  notifyDrop(piece){
    const event = new CustomEvent("puzzly_piece_drop", { detail: { piece }});
    window.dispatchEvent(event)
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

  addToBridge(element){
    this.pocketBridge.appendChild(element);

    const bridgeBox = {
      top: parseInt(this.pocketBridge.style.top),
      left: parseInt(this.pocketBridge.style.left),
    };
    const elementBox = element.getBoundingClientRect();

    element.style.top = bridgeBox.top + elementBox.top + "px";
    element.style.left = bridgeBox.left + elementBox.left + "px";

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
