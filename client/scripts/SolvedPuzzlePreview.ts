import Puzzly from "./Puzzly";
import { SolvedPuzzlePreviewType } from "./types";

export default class SolvedPuzzlePreview {
  fullImageViewerEl: HTMLDivElement | null;
  controlElement: HTMLSpanElement | null;
  showBtn: HTMLSpanElement | null;
  hideBtn: HTMLSpanElement | null;
  puzzleImagePath: string;
  imagePreviewType: SolvedPuzzlePreviewType;
  isPreviewActive: boolean;
  isControlAvailable: boolean;
  cropData: any;

  constructor({ puzzleImagePath, imagePreviewType }: Puzzly) {
    this.isControlAvailable =
      imagePreviewType === SolvedPuzzlePreviewType.Toggle;
    this.controlElement = document.getElementById("preview");
    this.showBtn = document.getElementById("preview-show") as HTMLSpanElement;
    this.hideBtn = document.getElementById("preview-hide") as HTMLSpanElement;

    this.puzzleImagePath = puzzleImagePath;

    this.fullImageViewerEl = document.getElementById(
      "solved-preview"
    ) as HTMLDivElement;

    this.setupFullImagePreviewer();
  }

  setupFullImagePreviewer() {
    if (this.fullImageViewerEl) {
      this.fullImageViewerEl.style.background = `url(${this.puzzleImagePath}) no-repeat`;
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
