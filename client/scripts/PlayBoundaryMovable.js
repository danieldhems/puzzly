import BaseMovable from "./BaseMovable.js";

export default class PlayBoundaryMovable extends BaseMovable {
  instanceType = "PlayBoundaryMovable";
  active = false;

  constructor(puzzly) {
    super(puzzly);

    this.element = this.playBoundary;
    this.element.addEventListener("mousedown", this.onMouseDown.bind(this));
  }

  onMouseDown(event) {
    if (this.isPlayBoundary(event.target) && window.Zoom.isZoomed) {
      // TODO: Is this needed?
      this.active = true;
      super.onPickup(event);
    }
  }
}
