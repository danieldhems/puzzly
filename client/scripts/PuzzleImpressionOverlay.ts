import { MovementAxis, PuzzleShapes } from "./types";

export default class PuzzleImpressionOverlay { 
    element: HTMLDivElement;
    targetElement: HTMLImageElement | HTMLDivElement;
    container: HTMLElement;
    width: number;
    height: number;
    diffX: number;
    diffY: number;
    leftBoundary: number;
    rightBoundary: number;
    topBoundary: number;
    bottomBoundary: number;
    allowedMovementAxis: MovementAxis | undefined;
    isSquareOptionSelected: boolean = true;
    isMoving: boolean = false;

    constructor({ targetElement, isSquareOptionSelected }: { targetElement: HTMLImageElement | HTMLDivElement; isSquareOptionSelected: true }) {
        this.targetElement = targetElement;
        this.isSquareOptionSelected = isSquareOptionSelected;
        this.container = this.targetElement.parentElement as HTMLElement;

        this.setInitialValues({ isSquareOptionSelected: this.isSquareOptionSelected });
        this.element = this.createElement();
        this.container.append(this.element);

        this.attachListeners();
    }

    setInitialValues({ isSquareOptionSelected }: { isSquareOptionSelected: boolean }) {
        let width, height;

        if(isSquareOptionSelected){
            const size = Math.min(this.targetElement.offsetWidth, this.targetElement.offsetHeight);
            width = height = size;

            if(this.targetElement.offsetWidth < this.targetElement.offsetHeight){
                this.allowedMovementAxis = MovementAxis.Y;
            } else {
                this.allowedMovementAxis = MovementAxis.X;
            }
        } else {
            width = this.targetElement.offsetWidth;
            height = this.targetElement.offsetHeight;
        }

        this.width = width;
        this.height = height;
    }

    createElement() {
        const element = document.createElement("div");
        element.id = "puzzle-impression-overlay";
        element.style.position = "absolute";

        // Calculate top and left position of target element, assuming it is centered
        this.topBoundary = (this.container.offsetHeight - this.targetElement.offsetHeight) / 2;
        this.leftBoundary = (this.container.offsetWidth - this.targetElement.offsetWidth) / 2;
        this.rightBoundary = this.container.offsetWidth - this.leftBoundary;
        this.bottomBoundary = this.container.offsetHeight - this.topBoundary;

        element.style.top = this.topBoundary + "px";
        element.style.left = this.leftBoundary + "px";
        element.style.width = this.width + "px";
        element.style.height = this.height + "px";
        return element;
    }

    attachListeners() {
        this.element.addEventListener("mousedown", this.onMouseDown.bind(this))
    }

    onMouseDown(e: MouseEvent) {
        this.diffX = e.clientX - parseInt(this.element.style.left);
        this.diffY = e.clientY - parseInt(this.element.style.top);
        this.element.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.element.addEventListener("mouseup", this.onMouseUp.bind(this));

        this.isMoving = true;
    }

    onMouseMove(e: MouseEvent) {
        if(this.isMoving){
            console.log("mouse is moving")
            
            const 

            if(this.allowedMovementAxis === MovementAxis.X) {
                const newValue = e.clientX - this.diffX;
                if(newValue >= this.leftBoundary || newValue <= this.rightBoundary) {
                    this.element.style.left = e.clientX - this.diffX + "px";
                }
            } else if(this.allowedMovementAxis === MovementAxis.Y) {
                const newValue = e.clientY - this.diffY;
                if(newValue >= this.topBoundary || newValue <= this.bottomBoundary) {
                    this.element.style.top = e.clientY - this.diffY + "px";
                }
            } else {
                this.element.style.left = e.clientX - this.diffX + "px";
                this.element.style.top = e.clientY - this.diffY + "px";
            }
        }
    }

    onMouseUp(e: MouseEvent) {
        if(this.isMoving){
            this.isMoving = false;
            this.element.removeEventListener("mousemove", this.onMouseMove);
        }
    }

    onShapeChange(shape: PuzzleShapes) {

    }

    isWithinBounds() {
        // const elBoundingBox = {
        //     top: newY,
        //     right: newX + this.targetElement.offsetWidth,
        //     bottom: newY + this.targetElement.offsetHeight,
        //     left: newX,
        // };
        // const containerBoundingBox = this.targetElement.getBoundingClientRect();
        
        // return (
        //     elBoundingBox.left >= Math.ceil(containerBoundingBox.left) &&
        //     elBoundingBox.right <= Math.ceil(containerBoundingBox.right) &&
        //     elBoundingBox.top >= Math.ceil(containerBoundingBox.top) &&
        //     elBoundingBox.bottom <= Math.ceil(containerBoundingBox.bottom)
        // );
    }
}