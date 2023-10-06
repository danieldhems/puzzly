import { ELEMENT_IDS, EVENT_TYPES } from "./constants.js";
import Utils from "./utils.js";

class Bridge {
  constructor(puzzly) {
    this.bridge = document.querySelector("#pockets-bridge");
    this.stage = document.querySelector("#stage");
    this.playBoundary = document.querySelector(`#${ELEMENT_IDS.PLAY_BOUNDARY}`);
    this.movingElement = null;
    this.elementClone = null;

    this.isMouseDown = false;
    this.isMouseMoving = false;

    this.setupBridge(this.playBoundary);

    window.addEventListener(EVENT_TYPES.PIECE_PICKUP, this.add.bind(this));
    window.addEventListener(EVENT_TYPES.PIECE_DROP, this.remove.bind(this));
    window.addEventListener(EVENT_TYPES.CHANGE_SCALE, this.sync.bind(this));
    window.addEventListener(EVENT_TYPES.SYNC, this.sync.bind(this));
    window.addEventListener(EVENT_TYPES.PUZZLE_LOADED, this.onLoad.bind(this));
    window.addEventListener(EVENT_TYPES.CLEAR_BRIDGE, this.remove.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
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
    const element = eventData.detail;
    this.movingElement = element;
    this.elementClone = this.makeClone(this.movingElement);
    this.bridge.appendChild(this.elementClone);
    this.setClonePosition();
    this.bridge.style.zIndex = 2;
  }

  onMouseMove(e) {
    if (this.elementClone) {
      this.setClonePosition();
    }
  }

  setClonePosition() {
    const top = this.movingElement.offsetTop;
    const left = this.movingElement.offsetLeft;
    this.elementClone.style.top = top + "px";
    this.elementClone.style.left = left + "px";
  }

  setCloneContainerPosition() {
    this.bridge.style.top = parseInt(this.mainCanvas.style.top) + "px";
    this.bridge.style.left = parseInt(this.mainCanvas.style.left) + "px";
  }

  remove() {
    this.elementClone.remove();
    this.elementClone = null;
    this.bridge.style.zIndex = 1;
  }

  clearbridge() {
    Array.from(this.bridge?.childNodes).forEach((el) => el.remove());
  }
}

export default Bridge;
