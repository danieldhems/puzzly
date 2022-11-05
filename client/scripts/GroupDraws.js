class GroupDraws {
  constructor(){
    this.borderColor = "#cecece";
    this.drawUI();
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

  keepOnTop(currentIndex){
    this.ui.style.zIndex = currentIndex+1;
  }

  drawUI(){
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
    shade.style.opacity = .8;
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

    document.body.appendChild(container);
    this.ui = container;
  }
}

export default GroupDraws;
