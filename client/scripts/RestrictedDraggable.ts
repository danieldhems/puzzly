export default class RestrictedDraggable {
    element: HTMLElement;
    topBoundary: number;
    rightBoundary: number;
    bottomBoundary: number;
    leftBoundary: number;
    restrictToParent: boolean;
    

    constructor({ element, restrictToParent}: {element: HTMLElement; restrictToParent: boolean; }) {
        this.element = element;
        this.restrictToParent = restrictToParent;


    }
}