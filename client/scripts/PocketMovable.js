import BaseMovable from "./BaseMovable.js";
import { EVENT_TYPES } from "./constants.js";
import Events from "./events.js";
import Utils from "./utils.js";

export class PocketMovable extends BaseMovable {
  instanceType = "PocketMovable";
  piecesInPocket = null;
  activePocket = null;
  activePocketInnerElement = null;

  constructor(puzzleData) {
    super(puzzleData);

    this.puzzly = puzzleData;
    this.Pockets = puzzleData.Pockets;

    this.pocketsContainer.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this)
    );
  }

  onMouseDown(event) {
    if (event.which === 1) {
      const element = Utils.getPuzzlePieceElementFromEvent(event);
      if (element) {
        this.active = true;
        this.activePocket = this.getPocketByCollision(Utils.getEventBox(event));
        this.activePocketInnerElement =
          this.activePocket.querySelector(".pocket-inner");

        const elementsInPocket = Array.from(this.getPiecesInActivePocket());
        this.piecesInPocket = elementsInPocket.map((element) =>
          this.puzzly.getMovableInstanceFromElement(element)
        );

        this.element = this.getMovingElementForActivePocket(event);
        this.activePocketInnerElement.prepend(this.element);
        super.onPickup(event);
      }
    }
  }

  onMouseUp(event) {
    if (this.active) {
      if (this.isInsidePlayArea() && !this.isOverPockets(event)) {
        console.log(1);
        this.addToStage();
      } else if (this.isOverPockets(event)) {
        console.log(2);
        const pocket = this.getPocketByCollision(Utils.getEventBox(event));
        this.Pockets.addManyToPocket(pocket, this);
      } else if (!this.isInsidePlayArea() && !this.isOverPockets(event)) {
        console.log(3);
        this.Pockets.addManyToPocket(this.activePocket, this);
      }

      this.save();
    }
  }

  // Create a container for all the pieces in a given pocket with the pieces arranged in a grid.
  // This container will be set as the movingElement.
  getMovingElementForActivePocket(e) {
    const container = document.createElement("div");
    container.id = "active-pieces-container";
    // container.style.border = "1px solid white";
    container.style.position = "absolute";

    const rowLength =
      this.piecesInPocket.length > 2
        ? Math.ceil(Math.sqrt(this.piecesInPocket.length))
        : 2;

    let currX = 0,
      currY = 0;
    let colNumber = 1;
    let numRows = 0;
    let maxX = 0,
      maxY = 0,
      nextRowY = 0;

    let firstPieceOnRow = this.piecesInPocket[0];

    for (let i = 0, l = this.piecesInPocket.length; i < l; i++) {
      const el = this.piecesInPocket[i].element;

      //   // move(el).x(currX * this.zoomLevel).y(currY * this.zoomLevel).duration(this.animationDuration).end();
      el.style.top = currY + "px";
      el.style.left = currX + "px";

      // const box = el.getBoundingClientRect();
      // const box = Utils.getStyleBoundingBox(el);
      const box = {
        top: el.offsetTop,
        right: el.offsetLeft + el.offsetWidth,
        bottom: el.offsetTop + el.offsetHeight,
        left: el.offsetLeft,
        width: el.offsetWidth,
        height: el.offsetHeight,
      };

      if (currX + box.width > maxX) {
        maxX = currX + box.width;
      }

      if (maxY === 0) {
        maxY = box.height;
      }

      if (currY + box.height > maxY) {
        maxY = currY + box.height;
      }

      currX += box.width + (box.width / 100) * 2;

      if (currY + box.height > nextRowY) {
        nextRowY = currY + box.height + (box.height / 100) * 2;
      }

      if (colNumber === rowLength) {
        currY = nextRowY;
        currX = 0;
        colNumber = 1;
        numRows++;

        firstPieceOnRow = el;
      } else {
        colNumber++;
      }

      container.appendChild(el);
    }

    container.style.width = maxX + "px";
    container.style.height = maxY + "px";

    const pocketBox = this.activePocket.getBoundingClientRect();

    const x = e.clientX - pocketBox.left - maxX / 2;
    const y = e.clientY - pocketBox.top - maxY / 2;

    container.style.top = y + "px";
    container.style.left = x + "px";

    return container;
  }

  getPiecesInActivePocket() {
    return Array.from(
      this.activePocket.querySelectorAll(".pocket-inner .puzzle-piece")
    );
  }

  addToStage() {
    this.piecesInPocket.forEach((piece) => {
      const element = piece.element;
      const playboundaryRect = this.piecesContainer.getBoundingClientRect();
      const elRect = element.getBoundingClientRect();

      const pos = {
        x: elRect.left - playboundaryRect.left,
        y: elRect.top - playboundaryRect.top,
      };

      element.style.top = pos.y + "px";
      element.style.left = pos.x + "px";

      this.piecesContainer.appendChild(element);
      element.classList.remove("in-pocket");
      element.setAttribute("data-pocket-id", null);
      element.style.pointerEvents = "auto";

      piece.pocket = undefined;

      // Events.notify(EVENT_TYPES.RETURN_TO_CANVAS, element);
    });
  }

  getDataForSave() {
    return this.piecesInPocket.map((piece) => ({
      pageX: piece.element.offsetLeft,
      pageY: piece.element.offsetTop,
      _id: piece.pieceData._id,
      pocket: piece.pocket,
      instanceType: this.instanceType,
    }));
  }

  save() {
    console.log("PocketMovable save", this);
    if (this.active) {
      console.log("PocketMovable saving");
      Events.notify(EVENT_TYPES.SAVE, this.getDataForSave());
      this.destroy();
    }
  }

  destroy() {
    this.element.remove();
    this.element = null;
    this.active = false;
  }
}
