import Events from "./events.js";
import { EVENT_TYPES, ZOOM_INTERVALS } from "./constants.js";
import Utils from "./utils.js";

export default class Zoom {
  stage;
  playBoundary;
  isPreviewActive;
  currentZoomInterval;
  zoomLevel;

  constructor(puzzly) {
    this.playBoundary = puzzly.playBoundary;
    this.isPreviewActive = puzzly.isPreviewActive;
    this.stage = puzzly.stage;
    this.currentZoomInterval = 0;
    this.zoomLevel = ZOOM_INTERVALS[this.currentZoomInterval];

    this.setPlayBoundaryPosition();

    window.addEventListener("keydown", this.handleZoom.bind(this));
    window.addEventListener("resize", this.setPlayBoundaryPosition.bind(this));
  }

  handleZoom(event) {
    this.prevZoomLevel = this.zoomLevel;

    // Plus key
    if (event.which === 187) {
      this.increaseZoomLevel();
    }

    // Minus key
    if (event.which === 189) {
      this.decreaseZoomLevel();
      //   if (this.currentZoomInterval === INITIAL_ZOOM_LEVEL) {
      //     this.resetPlayBoundaryPosition();
      //   }
    }

    // "0" Number key
    if (event.which === 48) {
      this.resetZoomLevel();
      this.resetPlayBoundaryPosition();
    }
  }

  // Might want an observer of some kind for the scalePlayBoundary method calls here, instead of manually calling it in all of these helper methods.
  resetZoomLevel() {
    this.currentZoomInterval = 0;
    this.zoomLevel = ZOOM_INTERVALS[this.currentZoomInterval];
    this.scalePlayBoundary(this.zoomLevel);
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
    }
  }

  decreaseZoomLevel() {
    const newLevel = this.currentZoomInterval - 1;
    if (ZOOM_INTERVALS[newLevel]) {
      this.currentZoomInterval = newLevel;
      this.zoomLevel = ZOOM_INTERVALS[newLevel];
      this.scalePlayBoundary(this.zoomLevel);
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

  setPlayBoundaryPosition() {
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

  resetPlayBoundaryPosition() {
    this.playBoundary.style.left = this.initialPlayBoundaryPositionLeft;
    this.playBoundary.style.top = Utils.getPxString(
      this.initialPlayBoundaryPositionTop
    );
  }
}
