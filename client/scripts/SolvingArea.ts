import { ELEMENT_IDS } from "./constants";
import Utils from "./utils";

class SolvingArea {
    element: HTMLDivElement;

    constructor(imageWidth: number, imageHeight: number) {
        this.element = document.querySelector(
            `#${ELEMENT_IDS.SOLVED_PUZZLE_AREA}`
        ) as HTMLDivElement;
        this.init(imageWidth, imageHeight);
    }


    init(imageWidth: number, imageHeight: number) {

    }
}