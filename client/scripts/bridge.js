import { ELEMENT_IDS, EVENT_TYPES } from "./constants.js";
import Events from "./events.js";
import Utils from "./utils.js";

class Bridge {
  constructor() {
    // this.bridge = document.querySelector("#pockets-bridge");
    this.stage = document.querySelector("#stage");
    this.playBoundary = document.querySelector(`#${ELEMENT_IDS.PLAY_BOUNDARY}`);
    this.pockets = document.querySelector(`#${ELEMENT_IDS.POCKETS}`);
    this.movingElement = null;

    this.isMouseDown = false;
    this.isMouseMoving = false;
    this.dragAndSelectActive = false;

    this.diffX = null;
    this.diffY = null;

    this.pocketsActive = false;

    this.setupBridge(this.playBoundary);

    // window.addEventListener(EVENT_TYPES.PIECE_PICKUP, this.add.bind(this));
    window.addEventListener(EVENT_TYPES.PIECE_DROP, this.remove.bind(this));
    window.addEventListener(EVENT_TYPES.CHANGE_SCALE, this.sync.bind(this));
    window.addEventListener(EVENT_TYPES.RESIZE, this.sync.bind(this));
    window.addEventListener(EVENT_TYPES.PUZZLE_LOADED, this.onLoad.bind(this));
    window.addEventListener(EVENT_TYPES.CLEAR_BRIDGE, this.remove.bind(this));
    window.addEventListener(
      EVENT_TYPES.POCKET_PICKUP,
      this.onPocketPickup.bind(this)
    );
    window.addEventListener(
      EVENT_TYPES.POCKET_PUTDOWN,
      this.onPocketPutdown.bind(this)
    );
    window.addEventListener(
      EVENT_TYPES.DRAGANDSELECT_ACTIVE,
      this.onDragAndSelect.bind(this)
    );
    // window.addEventListener("mousedown", this.onMouseDown.bind(this));
  }

  onPocketPickup() {
    this.pocketsActive = true;
  }

  onPocketPutdown() {
    this.pocketsActive = false;
  }

  onDragAndSelect(e) {
    const isActive = e.detail;
    this.isDragAndSelectActive = isActive;
  }

  onLoad(event) {
    const config = event.detail;
    this.setScale(config.zoomLevel);
  }

  setScale(level) {
    this.zoomLevel = level;
    this.bridge.style.transform = `scale(${this.zoomLevel})`;

    const rect = this.playBoundary.getBoundingClientRect();

    // It would be better to read the top value from the playboundary instead of calculating it again here.
    // Had issues with application logic and the timing of things being set, so just doing this for now...
    this.bridge.style.top =
      (this.stage.getBoundingClientRect().height -
        this.playBoundary.getBoundingClientRect().height) /
        2 +
      "px";
    this.bridge.style.left = rect.left + "px";
  }

  sync(event) {
    const zoomLevel = event.detail;
    const rect = this.playBoundary.getBoundingClientRect();
    this.bridge.style.transform = `scale(${zoomLevel})`;
    this.bridge.style.top = rect.top + "px";
    this.bridge.style.left = rect.left + "px";
  }

  setupBridge(playBoundary) {
    const rect = playBoundary.getBoundingClientRect();
    this.bridge.style.width = rect.width + "px";
    this.bridge.style.height = rect.height + "px";
    this.bridge.style.transform = `scale(${this.zoomLevel})`;
  }

  makeClone(element) {
    const clone = element.cloneNode(true);
    clone.style.pointerEvents = "none";
    return clone;
  }

  add(eventData) {
    if (!this.isDragAndSelectActive) {
      const element = eventData.detail;
      this.movingElement = element;
      this.bridge.appendChild(this.movingElement);
      this.bridge.style.zIndex = 2;
    }
  }

  onMouseDown(e) {
    let el = Utils.getPuzzlePieceElementFromEvent(e);
    console.log(el);
    if (el && !this.isDragAndSelectActive && !this.pocketsActive) {
      this.movingElement = el;
      this.diffX = e.clientX - this.movingElement.offsetLeft;
      this.diffY = e.clientY - this.movingElement.offsetTop;
      window.addEventListener("mousemove", this.onMouseMove.bind(this));
    }
  }

  onMouseMove(e) {
    if (this.movingElement) {
      const newPosTop = e.clientY - this.diffY;
      const newPosLeft = e.clientX - this.diffX;
      this.movingElement.style.top = newPosTop + "px";
      this.movingElement.style.left = newPosLeft + "px";
      window.addEventListener("mouseup", this.onMouseUp.bind(this));
    }
  }

  onMouseUp(e) {
    Events.notify(EVENT_TYPES.RETURN_TO_CANVAS, this.movingElement);
    this.movingElement = null;
    this.remove();
    window.removeEventListener("mousemove", this.onMouseMove);
  }

  setClonePosition() {
    const box = Utils.getStyleBoundingBox(this.movingElement);
    this.elementClone.style.top = box.top + "px";
    this.elementClone.style.left = box.left + "px";
  }

  setCloneContainerPosition() {
    this.bridge.style.top = parseInt(this.mainCanvas.style.top) + "px";
    this.bridge.style.left = parseInt(this.mainCanvas.style.left) + "px";
  }

  remove() {
    this.elementClone?.remove();
    this.elementClone = null;
    this.bridge.style.zIndex = 1;
  }
}

export default Bridge;
