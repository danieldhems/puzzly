import RestrictedDraggable from "./RestrictedDraggable";
import { MovementAxis, PuzzleShapes, PuzzleSize } from "./types";

export default class PuzzleImpressionOverlay {
    draggable: RestrictedDraggable;
    targetElement: HTMLImageElement | HTMLDivElement;
    container: HTMLElement;
    selectedPuzzleSize: PuzzleSize;

    constructor({
        targetElement,
        selectedPuzzleSize,
    }: {
        targetElement: HTMLImageElement | HTMLDivElement;
        selectedPuzzleSize: PuzzleSize
    }) {
        this.targetElement = targetElement;
        this.selectedPuzzleSize = selectedPuzzleSize;
        this.container = this.targetElement.parentElement as HTMLElement;

        const layout = this.getLayout(this.selectedPuzzleSize);

        this.draggable = new RestrictedDraggable({
            containerElement: this.container,
            layout,
            id: "puzzle-impression-overlay",
            restrictionBoundingBox: layout
        });
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

    update(puzzleSize: PuzzleSize) {
        this.selectedPuzzleSize = puzzleSize;
        const layout = this.getLayout(this.selectedPuzzleSize);
        if (this.draggable) {
            this.draggable.update(layout);
        }
    }
}