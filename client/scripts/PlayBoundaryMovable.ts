import BaseMovable from "./BaseMovable";
import Puzzly from "./Puzzly";
import { InstanceTypes } from "./types";

export default class PlayBoundaryMovable extends BaseMovable {
  instanceType = InstanceTypes.PlayBoundaryMovable;

  constructor(puzzly: Puzzly) {
    super(puzzly);

    this.element = this.playBoundary as HTMLDivElement;
    this.element.addEventListener("mousedown", this.onMouseDown.bind(this));
  }

  onMouseDown(event: MouseEvent) {
    if (
      this.isPlayBoundary(event.target as HTMLElement) &&
      window.Zoom.isZoomed
    ) {
      // TODO: Is this needed?
      this.active = true;
      super.onPickup(event);
    }
  }

  // Determine whether to allow the play boundary to be dragged any further based on its relation to the viewport
  shouldConstrainViewport(event: MouseEvent) {
    // TODO: Implement
    const rect = this.element.getBoundingClientRect();

    const currentTop = parseInt(this.element.style.top);
    // console.log("rect height", rect.height);
    // console.log("rect width", rect.width);
    // console.log("rect right", rect.right);
    console.log("rect bottom", rect.bottom);
    console.log("window height", window.innerHeight);
    // console.log("viewport width", window.innerWidth);
    const cutOffHeight =
      Math.floor((rect.height - this.element.offsetHeight) / 2) + 10;
    const cutOffWidth =
      Math.floor((rect.width - this.element.offsetWidth) / 2) + 10;
    // console.log("cut off height", cutOffHeight);
    // console.log("cut off width", cutOffWidth);

    // const target = cutOffWidth - window.innerWidth;
    // console.log("target", target);
    // console.log(this.element.offsetLeft + this.element);

    const newPosTop = event.clientY - this.diffY;
    const newPosLeft = event.clientX - this.diffX;

    // console.log("newPosLeft", newPosLeft);
    // console.log("element width", this.element.offsetWidth);
    console.log("calc", Math.abs(newPosTop) + this.element.offsetHeight);

    if (
      Math.abs(newPosTop) + this.element.offsetHeight >
      window.innerHeight + 10
    ) {
      return;
    }

    if (newPosTop > cutOffHeight) {
      return;
    }
  }
}
