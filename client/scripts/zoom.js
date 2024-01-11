import Events from "./events.js";
import { EVENT_TYPES, ZOOM_INTERVALS } from "./constants.js";
import Utils from "./utils.js";

export default class Zoom {
  stage;
  playBoundary;
  isPreviewActive;
  currentZoomInterval;
  zoomLevel;
  zoomType;

  keys = [187, 189, 48];

  constructor(puzzly) {
    this.playBoundary = puzzly.playBoundary;
    this.isPreviewActive = puzzly.isPreviewActive;
    this.stage = puzzly.stage;
    this.currentZoomInterval = 0;
    this.zoomLevel = ZOOM_INTERVALS[this.currentZoomInterval];

    this.centerPlayBoundary();

    window.addEventListener("keydown", this.handleNormalZoom.bind(this));
    window.addEventListener("dblclick", this.handlePointerZoom.bind(this));
    window.addEventListener("resize", this.centerPlayBoundary.bind(this));
  }

  handleNormalZoom(event) {
    this.prevZoomLevel = this.zoomLevel;
    this.zoomType = "normal";

    if (this.keys.includes(event.which)) {
      this.setTransformOrigin();
    }

    // Plus key
    if (event.which === 187) {
      this.zoomType = "normal";
      this.increaseZoomLevel();
    }

    // Minus key
    if (event.which === 189) {
      this.zoomType = "normal";
      this.decreaseZoomLevel();
    }

    // "0" Number key
    if (event.which === 48) {
      this.resetZoomLevel();
      this.centerPlayBoundary();
    }
  }

  handlePointerZoom(event) {
    this.zoomType = "pointer";

    this.setTransformOrigin(event);

    if (this.currentZoomInterval < ZOOM_INTERVALS.length - 1) {
      this.increaseZoomLevel();
    } else if (this.currentZoomInterval === ZOOM_INTERVALS.length - 1) {
      this.resetZoomLevel();
    }
  }

  getTransformOrigin(event) {
    if (this.zoomType === "normal") {
      return {
        top: window.innerHeight / 2 - this.playBoundary.offsetTop,
        left: window.innerWidth / 2 - this.playBoundary.offsetLeft,
      };
    } else if (this.zoomType === "pointer") {
      return {
        top: event.clientY,
        left: event.clientX,
      };
    }
  }

  setTransformOrigin(event) {
    const { top, left } = this.getTransformOrigin(event);
    // console.log("transform origin", top, left);
    this.playBoundary.style.transformOrigin = `${top}px ${left}px`;
  }

  // Might want an observer of some kind for the scalePlayBoundary method calls here, instead of manually calling it in all of these helper methods.
  resetZoomLevel() {
    this.currentZoomInterval = 0;
    this.zoomLevel = ZOOM_INTERVALS[this.currentZoomInterval];
    this.scalePlayBoundary(this.zoomLevel);
    this.centerPlayBoundary();
    this.isZoomed = false;
  }

  setZoomLevel() {
    this.zoomLevel = ZOOM_INTERVALS[this.currentZoomInterval];
    this.scalePlayBoundary(this.zoomLevel);
  }

  increaseZoomLevel() {
    const newLevel = this.currentZoomInterval + 1;
    if (ZOOM_INTERVALS[newLevel]) {
      this.currentZoomInterval = newLevel;
      this.zoomLevel = ZOOM_INTERVALS[newLevel];
      this.scalePlayBoundary(this.zoomLevel);
      this.isZoomed = true;
    }
  }

  decreaseZoomLevel() {
    const newLevel = this.currentZoomInterval - 1;
    if (ZOOM_INTERVALS[newLevel]) {
      this.currentZoomInterval = newLevel;
      this.zoomLevel = ZOOM_INTERVALS[newLevel];
      this.scalePlayBoundary(this.zoomLevel);

      if (ZOOM_INTERVALS[newLevel] === ZOOM_INTERVALS[0]) {
        this.isZoomed = false;
        this.centerPlayBoundary();
      }
    }
  }

  scalePlayBoundary(scale) {
    this.playBoundary.style.transform = `scale(${scale})`;

    if (this.zoomLevel !== this.prevZoomLevel) {
      Events.notify(EVENT_TYPES.CHANGE_SCALE, this.zoomLevel);
    }

    if (this.isPreviewActive) {
      this.updatePreviewerSizeAndPosition();
    }
  }

  centerPlayBoundary() {
    const stageRect = this.stage.getBoundingClientRect();
    const playBoundaryRect = this.playBoundary.getBoundingClientRect();

    this.playBoundary.style.top = Utils.getPxString(
      stageRect.height / 2 - playBoundaryRect.height / 2
    );
    this.playBoundary.style.left = Utils.getPxString(
      stageRect.width / 2 - playBoundaryRect.width / 2
    );

    Events.notify(EVENT_TYPES.RESIZE);
  }
}
