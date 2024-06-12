import Puzzly from "./Puzzly";
import { SolvedPuzzlePreviewType } from "./types";

export default class SolvedPuzzlePreview {
  fullImageViewerEl: HTMLDivElement | null;
  controlElement: HTMLSpanElement | null;
  showBtn: HTMLSpanElement | null;
  hideBtn: HTMLSpanElement | null;
  previewImage: HTMLImageElement;
  imagePreviewType: SolvedPuzzlePreviewType;
  isPreviewActive: boolean;
  isControlAvailable: boolean;
  cropData: any;

  constructor({ previewImage, imagePreviewType, cropData }: Puzzly) {
    this.isControlAvailable =
      imagePreviewType === SolvedPuzzlePreviewType.Toggle;
    this.controlElement = document.getElementById("preview");
    this.showBtn = document.getElementById("preview-show") as HTMLSpanElement;
    this.hideBtn = document.getElementById("preview-hide") as HTMLSpanElement;
    this.cropData = cropData;

    this.fullImageViewerEl = document.getElementById(
      "solved-preview"
    ) as HTMLDivElement;

    this.previewImage = previewImage;

    this.setupFullImagePreviewer();
  }

  setupFullImagePreviewer() {
    if (this.fullImageViewerEl) {
      console.log("crop data", this.cropData)
      // Set the background size and position based on the crop data chosen by the user
      const widthDifference = 100 - this.cropData.widthPercentage;
      const heightDifference = 100 - this.cropData.heightPercentage;

      const widthPercentage = this.fullImageViewerEl.offsetWidth / 100 * widthDifference;
      const heightPercentage = this.fullImageViewerEl.offsetHeight / 100 * heightDifference;

      const backgroundWidth = this.fullImageViewerEl.offsetWidth + widthPercentage;
      const backgroundHeight = this.fullImageViewerEl.offsetHeight + heightPercentage;

      this.fullImageViewerEl.style.backgroundImage = `url(${this.previewImage.src})`;
      this.fullImageViewerEl.style.backgroundRepeat = `no-repeat`;
      this.fullImageViewerEl.style.backgroundSize = `${backgroundWidth}px ${backgroundHeight}px`;

      const left = backgroundWidth / 100 * this.cropData.leftOffsetPercentage;
      const top = backgroundHeight / 100 * this.cropData.topOffsetPercentage;
      this.fullImageViewerEl.style.backgroundPosition = `-${left}px -${top}px`;
    }

    if (!this.isControlAvailable) {
      (this.fullImageViewerEl as HTMLDivElement).style.opacity = 0.5 + "";
    } else {
      (this.fullImageViewerEl as HTMLDivElement).style.display = "none";
    }

    if (this.controlElement) {
      if (this.imagePreviewType === SolvedPuzzlePreviewType.AlwaysOn) {
        this.controlElement.style.display = "none";
      } else {
        this.controlElement.addEventListener(
          "mousedown",
          this.togglePreviewer.bind(this)
        );
      }
    }
  }

  togglePreviewer() {
    if (this.isPreviewActive) {
      (this.fullImageViewerEl as HTMLDivElement).style.display = "none";
      (this.showBtn as HTMLSpanElement).style.display = "block";
      (this.hideBtn as HTMLSpanElement).style.display = "none";
      this.isPreviewActive = false;
    } else {
      (this.fullImageViewerEl as HTMLDivElement).style.display = "block";
      (this.showBtn as HTMLSpanElement).style.display = "none";
      (this.hideBtn as HTMLSpanElement).style.display = "block";
      this.isPreviewActive = true;
    }
  }
}
