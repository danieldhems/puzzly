import BaseMovable from "./BaseMovable";
import Puzzly from "./Puzzly";
import { EVENT_TYPES, MINIMUM_VIEWPORT_LENGTH_FOR_OUTOFBOUNDS_TO_BE_USED, SCREEN_MARGIN, PLAY_BOUNDARY_SIZE_IN_VIEWPORT_PERCENTAGE } from "./constants";
import { InstanceTypes } from "./types";
import Utils from "./utils";

export default class PlayBoundaryMovable extends BaseMovable {
  instanceType = InstanceTypes.PlayBoundaryMovable;
  stage: HTMLDivElement;
  viewportLargeEnoughForOutOfBoundsArea: boolean;

  constructor(puzzly: Puzzly) {
    super(puzzly);

    this.element = this.playBoundary as HTMLDivElement;
    this.element.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.stage = puzzly.stage as HTMLDivElement;
    window.Puzzly.PlayBoundaryMovable = this;

    this.init();
  }

  init() {
    this.setSize();
    window.addEventListener("resize", this.reCenter.bind(this));
  }

  setSize() {
    if (window.innerHeight < window.innerWidth) {
      this.element.style.height = window.innerHeight - (SCREEN_MARGIN * 2) + "px";

      if (window.innerWidth < MINIMUM_VIEWPORT_LENGTH_FOR_OUTOFBOUNDS_TO_BE_USED) {
        this.element.style.width = window.innerWidth - (SCREEN_MARGIN * 2) + "px";
      } else {
        const screenPortion = window.innerWidth / 100 * PLAY_BOUNDARY_SIZE_IN_VIEWPORT_PERCENTAGE;
        this.element.style.width = screenPortion + "px";
      }
    } else if (window.innerWidth < window.innerHeight) {  
      this.element.style.width = window.innerWidth - (SCREEN_MARGIN * 2) + "px";

      if (window.innerHeight < MINIMUM_VIEWPORT_LENGTH_FOR_OUTOFBOUNDS_TO_BE_USED) {
        this.element.style.height = window.innerHeight - (SCREEN_MARGIN * 2) + "px";
      } else {
        const screenPortion = window.innerWidth / 100 * PLAY_BOUNDARY_SIZE_IN_VIEWPORT_PERCENTAGE;
        this.element.style.height = screenPortion + "px";
      }
    }
  }

  drawSolvingArea() {

  }

  reCenter() {
    if (this.playBoundary) {
      const stageRect = this.stage.getBoundingClientRect();
      const playBoundaryRect = this.playBoundary.getBoundingClientRect();

      // TODO: Abstract / clean up
      if (window.innerHeight < window.innerWidth) {
        this.playBoundary.style.top = Utils.getPxString(
          SCREEN_MARGIN
        );
        if (window.innerWidth < MINIMUM_VIEWPORT_LENGTH_FOR_OUTOFBOUNDS_TO_BE_USED) {
          this.playBoundary.style.left = Utils.getPxString(
            SCREEN_MARGIN
          );
        } else {
          this.playBoundary.style.left = Utils.getPxString(
            stageRect.width / 2 - playBoundaryRect.width / 2
          );
        }
      } else if (window.innerWidth < window.innerHeight) {
        this.playBoundary.style.left = Utils.getPxString(
          SCREEN_MARGIN
        );
        if (window.innerHeight < MINIMUM_VIEWPORT_LENGTH_FOR_OUTOFBOUNDS_TO_BE_USED) {
          this.playBoundary.style.top = Utils.getPxString(
            SCREEN_MARGIN
          );
        } else {
          this.playBoundary.style.top = Utils.getPxString(
            stageRect.height / 2 - playBoundaryRect.height / 2
          );
        }
      }

      window.dispatchEvent(new CustomEvent(EVENT_TYPES.RESIZE));
    }
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
