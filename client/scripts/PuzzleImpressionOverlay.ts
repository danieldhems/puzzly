import RestrictedDraggable from "./RestrictedDraggable";
import { MovementAxis, PuzzleShapes } from "./types";

export default class PuzzleImpressionOverlay { 
    targetElement: HTMLImageElement | HTMLDivElement;
    container: HTMLElement;
    isSquareOptionSelected: boolean = true;

    constructor({ targetElement, isSquareOptionSelected }: { targetElement: HTMLImageElement | HTMLDivElement; isSquareOptionSelected: true }) {
        this.targetElement = targetElement;
        this.isSquareOptionSelected = isSquareOptionSelected;
        this.container = this.targetElement.parentElement as HTMLElement;

        const layout = this.getInitialValues({ isSquareOptionSelected: this.isSquareOptionSelected });

        new RestrictedDraggable({ containerElement: this.container, layout, id: "puzzle-impression-overlay", restrictionBoundingBox: layout });
    }

    getInitialValues({ isSquareOptionSelected }: { isSquareOptionSelected: boolean }) {
        let width, height, allowedMovementAxis;

        // Calculate top and left position of target element, assuming it is centered
        const topBoundary = (this.container.offsetHeight - this.targetElement.offsetHeight) / 2;
        const leftBoundary = (this.container.offsetWidth - this.targetElement.offsetWidth) / 2;
        const rightBoundary = this.container.offsetWidth - leftBoundary;
        const bottomBoundary = this.container.offsetHeight - topBoundary;

        if(isSquareOptionSelected){
            const size = Math.min(this.targetElement.offsetWidth, this.targetElement.offsetHeight);
            width = height = size;

            if(this.targetElement.offsetWidth < this.targetElement.offsetHeight){
                allowedMovementAxis = MovementAxis.Y;
            } else {
                allowedMovementAxis = MovementAxis.X;
            }
        } else {
            width = this.targetElement.offsetWidth;
            height = this.targetElement.offsetHeight;
        }

        return {
            left: leftBoundary,
            top: topBoundary,
            right: rightBoundary,
            bottom: bottomBoundary,
            width,
            height,
            allowedMovementAxis,
        }
    }

    onShapeChange(shape: PuzzleShapes) {

    }
}