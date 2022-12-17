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
    this.zoomLevel = 1; // If this hasn't been set externally yet, assume it's the default value
    
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

  setPieceSize(el, scale = null, origin = null){
    // When returning pieces to the canvas we need to remove the scale transform from them in order for them to be correctly scaled by the canvas itself, else they'll end up smaller or large than intended
    el.style.transform = scale ? `scale(${scale})` : 'none';
    if(scale && origin){
      el.style.transformOrigin = origin;
    }
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
      const pArr = Array.from(activePieces);
      // beef
      // const origin = pArr.length === 1 ? "50% 50%" : null;
      pArr.forEach(el => {
        this.setPieceSize(el, this.zoomLevel, origin);
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
      this.lastPosition = el.getBoundingClientRect();

      this.setActivePiecesToCurrentScale();
      this.movingElement = this.getMovingElementForActivePocket(e);
      this.activePocket.appendChild(this.movingElement);
      
      this.setActivePiecesToCurrentScale();

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
      const movingElementBox = this.movingElement.getBoundingClientRect();

      const isOverPockets = this.isOverPockets(movingElementBox);

      if(isOverPockets && this.elementClone === null){
        this.makeClone(this.movingElement);
      } else if(!isOverPockets && this.elementClone){
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
    }
  }

  onMouseUp(e){
    // console.log("on mouse up", e)
    const eventBox = this.getEventBoundingBox(e);
    const targetPocket = this.getPocketByCollision(eventBox);

    if(targetPocket){
      if(this.activePocket){
        this.addPiecesToPocket(targetPocket, this.movingElement.childNodes);
        this.setActivePiecesToPocketSize();
        this.movingElement.remove();
      } else {
        this.addToPocket(targetPocket, this.movingElement);
      }
    } else {
      if(this.activePocket){
        if(Utils.isOutOfBounds(this.movingElement.getBoundingClientRect())){
          this.addPiecesToPocket(this.activePocket, this.movingElement.childNodes);
          this.movingElement.remove();
        } else {
          this.returnToCanvas(this.getPiecesInTransit());
          this.resetActivePocket();
        }
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

  // Create a container for all the pieces in a given pocket with the pieces arranged in a grid.
  // This container will be set as the movingElement.
  getMovingElementForActivePocket(e){
    const activePieces = Array.from(this.getPiecesInActivePocket());

    this.activePocketHasMultiplePieces = true;

    const container = document.createElement("div");
    container.classList.add("active-pieces-container");
    // container.style.border = "1px solid white";
    container.style.position = "absolute";

    this.activePiecesContainer = container;
    
    const rowLength = activePieces.length > 2 ? Math.ceil(Math.sqrt(activePieces.length)) : 2;

    let currX = 0, currY = 0;
    let colNumber = 1;
    let numRows = 0;
    let maxX = 0, maxY = 0, nextRowY = 0;

    let firstPieceOnRow = activePieces[0];

    for(let i = 0, l = activePieces.length; i < l; i++){
      const el = activePieces[i];

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
      }

      if(currX + box.width > maxX){
        maxX = currX + box.width;
      }

      if(maxY === 0){
        maxY = box.height;
      }

      if(currY + box.height > maxY){
        maxY = currY + box.height;
      }

      currX += box.width + box.width / 100 * 2;

      if(currY + box.height > nextRowY){
        nextRowY = currY + box.height + box.height / 100 * 2;
      }

      if(colNumber === rowLength){
        currY = nextRowY;
        currX = 0;
        colNumber = 1;
        numRows++;

        firstPieceOnRow = el; 
      } else {
        colNumber++;
      }

      container.appendChild(el);
    };

    container.style.width = maxX * this.zoomLevel + "px";
    container.style.height = maxY * this.zoomLevel + "px";

    const pocketBox = this.activePocket.getBoundingClientRect();

    const x = e.clientX - pocketBox.left - (maxX / 2  * this.zoomLevel);
    const y = e.clientY - pocketBox.top - (maxY / 2  * this.zoomLevel);
    
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
    // console.log("adding to pocket", pocket, element)
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

    if(pocketEl?.childNodes?.length === 0){
      dropX = pocketEl.offsetWidth / 2 - element.offsetWidth / 2;
      dropY = pocketEl.offsetHeight / 2 - element.offsetHeight / 2;
    } else {
      dropX = Utils.getRandomInt(this.pocketDropBoundingBox.left, this.pocketDropBoundingBox.right);
      dropY = Utils.getRandomInt(this.pocketDropBoundingBox.top, this.pocketDropBoundingBox.bottom);
    }

    element.style.top = dropY * this.pieceScaleWhileInPocket + "px";
    element.style.left = dropX * this.pieceScaleWhileInPocket + "px";

    element.setAttribute("data-pocket-id", pocketId);
    element.classList.add("in-pocket");

    pocketEl?.appendChild(element);

    if(this.elementClone){
      this.removeClone();
    }

    this.setPieceSize(element, this.pieceScaleWhileInPocket);
    Utils.requestSave([element]);
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

    Utils.requestSave(els)
  }

  notifyDrop(piece){
    const event = new CustomEvent("puzzly_piece_drop", { detail: { piece }});
    window.dispatchEvent(event)
  }

  getTargetBoxForPlacementInsidePocket(pieceSize){
    const expansionRange = 10;
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

    const expandedCenterBoundingBox = {
      top: centerBoundingBox.top - expansionRange,
      right: centerBoundingBox.right + expansionRange,
      bottom: centerBoundingBox.bottom + expansionRange,
      left: centerBoundingBox.left - expansionRange,
    };

    return {
      top: expandedCenterBoundingBox.top * this.zoomLevel,
      right: expandedCenterBoundingBox.right - pieceSize,
      bottom: expandedCenterBoundingBox.bottom - pieceSize,
      left: expandedCenterBoundingBox.left * this.zoomLevel,
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
    this.elementClone.style.top = parseInt(this.movingElement.style.top) + "px";
    this.elementClone.style.left = parseInt(this.movingElement.style.left) + "px";
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
    return Utils.hasCollision(box, this.ui.getBoundingClientRect());
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
  }
}

export default Pockets;
