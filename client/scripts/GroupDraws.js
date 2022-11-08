import Utils from "./utils.js";

class GroupDraws {
  constructor(config){
    this.mainCanvas = config.canvas;
    this.shadowOffset = config.shadowOffset;
    this.borderColor = "#cecece";
    this.hasCapture = false;
    this.elementClone = null;
    this.render();

    document.addEventListener("mousedown", e => this.onMouseDown(e));

    return this;
  }

  makeDraw(id, lastDraw = false){
    const draw = document.createElement("div");
    draw.id = `group-draw-${id}`;
    draw.style.width = "25%";
    draw.style.height = "100%";
    draw.style.display = "flex";
    draw.style.boxSizing = "border-box";
    draw.style.borderTop = `2px solid ${this.borderColor}`;

    if(!lastDraw){
      draw.style.borderRight = `2px solid ${this.borderColor}`;
    }

    return draw;
  }

  release(){
    this.hasCapture = false;
  }

  onMouseDown(e){
    const el = e.target;
    const isPuzzlePiece = el.classList.contains("puzzle-piece");

    if(isPuzzlePiece && !Utils.hasGroup(el)){
      this.isMovingSinglePiece = true;
      this.isMouseDown = true;
      this.movingElement = el;

      if(this.isOverUi(el) && this.elementClone === null){
        this.makeClone(this.movingElement);
      }

      window.addEventListener("mousemove", e => this.onMouseMove(e));
      window.addEventListener("mouseup", e => this.onMouseUp(e));
    } else {
      this.isMouseDown = false;
      this.isMovingSinglePiece = false;
    }
  }

  onMouseMove(e){
    if(this.isMouseDown && this.isMovingSinglePiece){
      if(this.isMovingSinglePiece){
        if(this.isOverUi(this.movingElement) && this.elementClone === null){
          this.makeClone(this.movingElement);
        }

        if(!this.isOverUi(this.movingElement) && this.elementClone){
          this.removeClone(this.movingElement);
        }

        if(this.elementClone){
          this.setClonePosition();
        }
      }
    }
  }

  onMouseUp(e){
    console.log("on mouse up", e)
    if(this.elementClone){
      this.removeClone();
    }

    if(this.isMouseDown){
      this.isMouseDown = false;
      this.movingElement = null;
    }


  }

  makeClone(element){
    this.elementClone = element.cloneNode(true);
    this.elementClone.style.pointerEvents = "none";
    this.cloneContainer.appendChild(this.elementClone);
    this.setClonePosition();
  }

  setClonePosition(){
    this.elementClone.style.top = this.mainCanvas.offsetTop + this.movingElement.offsetTop + "px";
    this.elementClone.style.left = this.mainCanvas.offsetLeft + this.movingElement.offsetLeft + "px";
  }

  removeClone(){
    this.elementClone.remove();
    this.elementClone = null;
  }

  isOverUi(element){
    const bb = element.getBoundingClientRect();
    bb.width += this.shadowOffset;
    bb.height += this.shadowOffset;
    return Utils.hasCollision(bb, this.boundingBox);
  }

  render(){
    const container = document.createElement("div");
    container.id = "side-groups";
    container.style.width = "100%";
    container.style.height = "250px";
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

    drawContainer.appendChild(this.makeDraw(1));
    drawContainer.appendChild(this.makeDraw(2));
    drawContainer.appendChild(this.makeDraw(3));
    drawContainer.appendChild(this.makeDraw(4, true));

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

export default GroupDraws;
