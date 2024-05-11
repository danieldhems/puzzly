import RestrictedDraggable from "./RestrictedDraggable";
import { MovementAxis, PuzzleShapes, PuzzleSize } from "./types";

export default class PuzzleImpressionOverlay {
    draggable: RestrictedDraggable;
    targetElement: HTMLImageElement | HTMLDivElement;
    container: HTMLElement;
    selectedPuzzleSize: PuzzleSize;
    isSquareOptionSelected: boolean;

    constructor({
        targetElement,
        selectedPuzzleSize,
        isSquareOptionSelected
    }: {
        targetElement: HTMLImageElement | HTMLDivElement;
        selectedPuzzleSize: PuzzleSize;
        isSquareOptionSelected: boolean
    }) {
        this.targetElement = targetElement;
        this.isSquareOptionSelected = isSquareOptionSelected;
        this.selectedPuzzleSize = selectedPuzzleSize;
        this.container = this.targetElement.parentElement as HTMLElement;

        const layout = this.getInitialValues({ isSquareOptionSelected: this.isSquareOptionSelected });

        this.draggable = new RestrictedDraggable({
            containerElement: this.container,
            layout,
            id: "puzzle-impression-overlay",
            restrictionBoundingBox: layout
        });
    }

    getInitialValues({ isSquareOptionSelected }: { isSquareOptionSelected: boolean }) {
        let width, height, allowedMovementAxis;

        // Calculate top and left position of target element, assuming it is centered
        const topBoundary = (this.container.offsetHeight - this.targetElement.offsetHeight) / 2;
        const leftBoundary = (this.container.offsetWidth - this.targetElement.offsetWidth) / 2;
        const rightBoundary = this.container.offsetWidth - leftBoundary;
        const bottomBoundary = this.container.offsetHeight - topBoundary;

        if (isSquareOptionSelected) {
            const size = Math.min(this.targetElement.offsetWidth, this.targetElement.offsetHeight);
            width = height = size;

            if (this.targetElement.offsetWidth < this.targetElement.offsetHeight) {
                allowedMovementAxis = MovementAxis.Y;
            } else {
                allowedMovementAxis = MovementAxis.X;
            }
        } else {
            width = this.selectedPuzzleSize.puzzleWidth;
            height = this.selectedPuzzleSize.puzzleHeight;
            const { imageWidth, imageHeight } = this.selectedPuzzleSize;
            allowedMovementAxis = imageWidth < imageHeight ? MovementAxis.Y : MovementAxis.X;
        }

        const scaledWidth = (this.targetElement.offsetWidth / this.selectedPuzzleSize.imageWidth) * this.selectedPuzzleSize.puzzleWidth;
        const scaledHeight = (this.targetElement.offsetHeight / this.selectedPuzzleSize.imageHeight) * this.selectedPuzzleSize.puzzleHeight;

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

    onShapeChange(shape: PuzzleShapes) {

    }
}