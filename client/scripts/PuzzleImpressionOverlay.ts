import RestrictedDraggable from "./RestrictedDraggable";
import { SVG_NAMESPACE } from "./constants";
import { getPuzzleImpressions } from "./puzzleGenerator";
import { MovementAxis, PuzzleShapes, PuzzleSize } from "./types";

export default class PuzzleImpressionOverlay {
    svgElement: SVGSVGElement;
    draggable: RestrictedDraggable;
    targetElement: HTMLImageElement | HTMLDivElement;
    container: HTMLElement;
    puzzleConfigs: PuzzleSize[];
    selectedPuzzleConfig: PuzzleSize;
    pieceSvgGroups: HTMLOrSVGElement[];
    impressionsContainer: HTMLDivElement;

    constructor({
        targetElement,
        selectedPuzzleConfig,
        puzzleConfigs,
    }: {
        targetElement: HTMLImageElement | HTMLDivElement;
        selectedPuzzleConfig: PuzzleSize;
        puzzleConfigs: PuzzleSize[];
    }) {
        console.log("selected puzzle config", selectedPuzzleConfig)
        this.targetElement = targetElement;
        this.selectedPuzzleConfig = selectedPuzzleConfig;
        this.puzzleConfigs = puzzleConfigs;
        this.container = this.targetElement.parentElement as HTMLElement;

        this.impressionsContainer = getPuzzleImpressions(this.puzzleConfigs);
        console.log(this.impressionsContainer);
        this.targetElement.appendChild(this.impressionsContainer);
        this.update(this.selectedPuzzleConfig);
    }

    getLayout(puzzleSize: PuzzleSize) {
        let width, height, allowedMovementAxis;

        // Calculate top and left position of target element, assuming it is centered
        const topBoundary = (this.container.offsetHeight - this.targetElement.offsetHeight) / 2;
        const leftBoundary = (this.container.offsetWidth - this.targetElement.offsetWidth) / 2;
        const rightBoundary = this.container.offsetWidth - leftBoundary;
        const bottomBoundary = this.container.offsetHeight - topBoundary;

        width = puzzleSize.puzzleWidth;
        height = puzzleSize.puzzleHeight;

        const { imageWidth, imageHeight } = puzzleSize;
        allowedMovementAxis = imageWidth < imageHeight ? MovementAxis.Y : MovementAxis.X;

        const scaledWidth = (this.targetElement.offsetWidth / puzzleSize.imageWidth) * puzzleSize.puzzleWidth;
        const scaledHeight = (this.targetElement.offsetHeight / puzzleSize.imageHeight) * puzzleSize.puzzleHeight;

        return {
            left: leftBoundary,
            top: topBoundary,
            right: rightBoundary,
            bottom: bottomBoundary,
            width: scaledWidth,
            height: scaledHeight,
            allowedMovementAxis,
        }
    }

    getScale(length: number) {
        return this.targetElement.offsetWidth / length;
    }

    update(puzzleConfig: PuzzleSize) {
        const layout = this.getLayout(puzzleConfig);

        if (this.draggable) {
            this.draggable.update(layout);
        } else {
            this.draggable = new RestrictedDraggable({
                containerElement: this.container,
                layout,
                id: "puzzle-impression-overlay",
                restrictionBoundingBox: layout
            });
            this.draggable.element.appendChild(this.impressionsContainer)
        }

        this.setImpression("puzzle-" + puzzleConfig.totalNumberOfPieces);
    }

    setImpression(id: string) {
        const impressions = this.impressionsContainer.getElementsByTagName("div");
        Array.from(impressions).forEach((impression) => {
            if (impression.id === id) {
                impression.classList.remove("js-hidden");
            } else {
                impression.classList.add("js-hidden");
            }
        })
    }
}