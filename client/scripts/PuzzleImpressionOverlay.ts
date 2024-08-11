import RestrictedDraggable from "./RestrictedDraggable";
import { getPuzzleImpressions } from "./puzzleGenerator";
import { PuzzleConfig, PuzzleImpression } from "./types";

export default class PuzzleImpressionOverlay {
  svgElement: SVGSVGElement;
  draggable: RestrictedDraggable;
  targetElement: HTMLImageElement | HTMLDivElement;
  container: HTMLElement;
  puzzleConfigs: PuzzleConfig[];
  selectedPuzzleConfig: PuzzleConfig;
  pieceSvgGroups: HTMLOrSVGElement[];
  impressionsContainer: HTMLDivElement;
  impressions: PuzzleImpression[];
  activeImpression: PuzzleImpression;
  leftBoundary: number;
  topBoundary: number;

  constructor({
    targetElement,
    selectedPuzzleConfig,
    puzzleConfigs,
  }: {
    targetElement: HTMLImageElement | HTMLDivElement;
    selectedPuzzleConfig: PuzzleConfig;
    puzzleConfigs: PuzzleConfig[];
  }) {
    this.targetElement = targetElement;
    this.selectedPuzzleConfig = selectedPuzzleConfig;
    this.puzzleConfigs = puzzleConfigs;
    this.container = this.targetElement.parentElement as HTMLElement;

    const layout = this.getLayout(this.selectedPuzzleConfig);
    this.setLayoutInternal(layout);

    this.draggable = new RestrictedDraggable({
      containerElement: this.container,
      layout,
      id: "puzzle-impression-overlay",
      restrictionBoundingBox: layout,
    });

    this.setImpressions(this.puzzleConfigs);
    this.setActiveImpression(this.selectedPuzzleConfig);
  }

  getLayout(puzzleConfig: PuzzleConfig) {
    // Calculate top and left position of target element, assuming it is centered
    const topBoundary =
      (this.container.offsetHeight - this.targetElement.offsetHeight) / 2;
    const leftBoundary =
      (this.container.offsetWidth - this.targetElement.offsetWidth) / 2;
    const rightBoundary = this.container.offsetWidth - leftBoundary;
    const bottomBoundary = this.container.offsetHeight - topBoundary;

    const { puzzleWidth, puzzleHeight, imageWidth, imageHeight } = puzzleConfig;

    const scaledWidth =
      (this.targetElement.offsetWidth / imageWidth) * puzzleWidth;
    const scaledHeight =
      (this.targetElement.offsetHeight / imageHeight) * puzzleHeight;

    return {
      left: leftBoundary,
      top: topBoundary,
      right: rightBoundary,
      bottom: bottomBoundary,
      width: scaledWidth,
      height: scaledHeight,
    };
  }

  setLayoutInternal({ top, left }: { top: number; left: number }) {
    this.leftBoundary = left;
    this.topBoundary = top;
  }

  setImpressions(puzzleConfigs: PuzzleConfig[]) {
    if (this.impressionsContainer) {
      this.impressionsContainer.remove();
    }

    const { container, impressions } = getPuzzleImpressions(puzzleConfigs);

    console.log("impressions", impressions);
    this.impressionsContainer = container;
    this.impressions = impressions;
    this.draggable.element.appendChild(this.impressionsContainer);
    this.draggable.update(this.getLayout(puzzleConfigs[0]));
  }

  setActiveImpression(puzzleConfig: PuzzleConfig) {
    const impressionElements =
      this.impressionsContainer.getElementsByTagName("div");
    const id = "puzzle-" + puzzleConfig.totalNumberOfPieces;
    Array.from(impressionElements).forEach((impressionElement) => {
      if (impressionElement.id === id) {
        impressionElement.classList.remove("js-hidden");
        const layout = this.getLayout(puzzleConfig);
        this.draggable.update(layout);
        const impressiongIndex = parseInt(
          impressionElement.dataset.impressionIndex as string
        );
        this.activeImpression = this.impressions.find(
          (impression: PuzzleImpression) =>
            impression.index === impressiongIndex
        ) as PuzzleImpression;
      } else {
        impressionElement.classList.add("js-hidden");
      }
    });
  }

  getActiveImpression() {
    return {
      ...this.activeImpression,
      impressionWidth: this.draggable.element.offsetWidth,
      impressionHeight: this.draggable.element.offsetHeight,
    };
  }

  getPositionAndDimensions() {
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } =
      this.draggable.element;
    const width = parseInt(this.draggable.element.style.width);
    const height = parseInt(this.draggable.element.style.height);
    return {
      left: offsetLeft - this.leftBoundary,
      top: offsetTop - this.topBoundary,
      width,
      height,
    };
  }
}
