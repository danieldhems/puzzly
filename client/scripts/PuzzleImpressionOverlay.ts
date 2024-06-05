import RestrictedDraggable from "./RestrictedDraggable";
import { getPuzzleImpressions } from "./puzzleGenerator";
import { MovementAxis, PuzzleConfig } from "./types";

export default class PuzzleImpressionOverlay {
    svgElement: SVGSVGElement;
    draggable: RestrictedDraggable;
    targetElement: HTMLImageElement | HTMLDivElement;
    container: HTMLElement;
    puzzleConfigs: PuzzleConfig[];
    selectedPuzzleConfig: PuzzleConfig;
    pieceSvgGroups: HTMLOrSVGElement[];
    impressionsContainer: HTMLDivElement;

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

        this.draggable = new RestrictedDraggable({
            containerElement: this.container,
            layout,
            id: "puzzle-impression-overlay",
            restrictionBoundingBox: layout
        });

        this.setImpressions(this.puzzleConfigs);
        this.setActiveImpression(this.selectedPuzzleConfig);
    }

    getLayout(puzzleConfig: PuzzleConfig) {
        // Calculate top and left position of target element, assuming it is centered
        const topBoundary = (this.container.offsetHeight - this.targetElement.offsetHeight) / 2;
        const leftBoundary = (this.container.offsetWidth - this.targetElement.offsetWidth) / 2;
        const rightBoundary = this.container.offsetWidth - leftBoundary;
        const bottomBoundary = this.container.offsetHeight - topBoundary;

        const { puzzleWidth, puzzleHeight, imageWidth, imageHeight } = puzzleConfig;

        const scaledWidth = (this.targetElement.offsetWidth / imageWidth) * puzzleWidth;
        const scaledHeight = (this.targetElement.offsetHeight / imageHeight) * puzzleHeight;

        return {
            left: leftBoundary,
            top: topBoundary,
            right: rightBoundary,
            bottom: bottomBoundary,
            width: scaledWidth,
            height: scaledHeight,
        }
    }

    setImpressions(puzzleConfigs: PuzzleConfig[]) {
        if (this.impressionsContainer) {
            this.impressionsContainer.remove();
        }
        this.impressionsContainer = getPuzzleImpressions(puzzleConfigs);
        this.draggable.element.appendChild(this.impressionsContainer)
        this.draggable.update(this.getLayout(puzzleConfigs[0]))
    }

    setActiveImpression(puzzleConfig: PuzzleConfig) {
        const impressions = this.impressionsContainer.getElementsByTagName("div");
        const id = "puzzle-" + puzzleConfig.totalNumberOfPieces;
        Array.from(impressions).forEach((impression) => {
            if (impression.id === id) {
                impression.classList.remove("js-hidden");
                const layout = this.getLayout(puzzleConfig)
                this.draggable.update(layout);
            } else {
                impression.classList.add("js-hidden");
            }
        })
    }


}