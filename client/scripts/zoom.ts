import { EVENT_TYPES, ZOOM_INTERVALS } from "./constants.js";
import Utils from "./utils.js";
import BaseMovable from "./BaseMovable.js";
import Puzzly from "./Puzzly.js";

export enum ZoomTypes {
  Normal = "normal",
  Pointer = "pointer",
}

export default class Zoom extends BaseMovable {
  stage: HTMLDivElement;
  playBoundary: BaseMovable["playBoundary"];
  isPreviewActive: boolean;
  currentZoomInterval: number;
  zoomLevel: BaseMovable["zoomLevel"];
  prevZoomLevel: number;
  zoomType: ZoomTypes;
  isZoomed: boolean;

  keys = [187, 189, 48];

  constructor(puzzly: Puzzly) {
    super(puzzly);
    this.playBoundary = puzzly.playBoundary as HTMLDivElement;
    this.isPreviewActive = puzzly.isPreviewActive;
    this.stage = puzzly.stage as HTMLDivElement;
    this.currentZoomInterval = 0;
    this.zoomLevel = ZOOM_INTERVALS[this.currentZoomInterval];

    window.Zoom = this;

    this.centerPlayBoundary();

    window.addEventListener("keydown", this.handleNormalZoom.bind(this));
    window.addEventListener("dblclick", this.handlePointerZoom.bind(this));
    window.addEventListener("resize", this.centerPlayBoundary.bind(this));
  }

  handleNormalZoom(event: KeyboardEvent) {
    this.prevZoomLevel = this.zoomLevel;
    this.zoomType = ZoomTypes.Normal;

    if (this.keys.includes(event.which)) {
      this.setTransformOrigin(event);
    }

    // Plus key
    if (event.which === 187) {
      this.zoomType = ZoomTypes.Normal;
      this.increaseZoomLevel();
    }

    // Minus key
    if (event.which === 189) {
      this.zoomType = ZoomTypes.Normal;
      this.decreaseZoomLevel();
    }

    // "0" Number key
    if (event.which === 48) {
      this.resetZoomLevel();
      this.centerPlayBoundary();
    }
  }

  handlePointerZoom(event: MouseEvent) {
    this.zoomType = ZoomTypes.Pointer;

    this.setTransformOrigin(event);

    if (this.currentZoomInterval < ZOOM_INTERVALS.length - 1) {
      this.increaseZoomLevel();
    } else if (this.currentZoomInterval === ZOOM_INTERVALS.length - 1) {
      this.resetZoomLevel();
    }
  }

  getTransformOrigin(
    event: KeyboardEvent | MouseEvent
  ): { top: number; left: number } | undefined {
    if (this.zoomType === ZoomTypes.Normal) {
      return {
        top:
          window.innerHeight / 2 -
          (this.playBoundary as HTMLDivElement).offsetTop,
        left:
          window.innerWidth / 2 -
          (this.playBoundary as HTMLDivElement).offsetLeft,
      };
    } else if (this.zoomType === ZoomTypes.Pointer) {
      const pointerEvent = event as MouseEvent;
      return {
        top: pointerEvent.clientY,
        left: pointerEvent.clientX,
      };
    }
  }

  setTransformOrigin(event: MouseEvent | KeyboardEvent) {
    const { top, left } = this.getTransformOrigin(event) as {
      top: number;
      left: number;
    };
    // console.log("transform origin", top, left);
    (
      this.playBoundary as HTMLDivElement
    ).style.transformOrigin = `${top}px ${left}px`;
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

  scalePlayBoundary(scale: number) {
    (this.playBoundary as HTMLDivElement).style.transform = `scale(${scale})`;

    if (this.zoomLevel !== this.prevZoomLevel) {
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPES.CHANGE_SCALE, { detail: this.zoomLevel })
      );
    }

    if (this.isPreviewActive) {
      // TODO: Reimplement
      // this.updatePreviewerSizeAndPosition();
    }
  }

  centerPlayBoundary() {
    if (this.playBoundary) {
      const stageRect = this.stage.getBoundingClientRect();
      const playBoundaryRect = this.playBoundary.getBoundingClientRect();

      this.playBoundary.style.top = Utils.getPxString(
        stageRect.height / 2 - playBoundaryRect.height / 2
      );
      this.playBoundary.style.left = Utils.getPxString(
        stageRect.width / 2 - playBoundaryRect.width / 2
      );

      window.dispatchEvent(new CustomEvent(EVENT_TYPES.RESIZE));
    }
  }
}
