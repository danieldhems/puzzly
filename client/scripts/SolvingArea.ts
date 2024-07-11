import SingleMovable from "./SingleMovable";
import { ELEMENT_IDS, STROKE_OFFSET } from "./constants";
import { getSvg } from "./svg";
import Utils from "./utils";

export default class SolvingArea {
    element: HTMLDivElement;
    playBoundary: HTMLDivElement;
    width: number;
    height: number;
    imagePath: string;

    constructor(boardWidth: number, boardHeight: number, imagePath: string) {
        this.element = document.querySelector(
            `#${ELEMENT_IDS.SOLVED_PUZZLE_AREA}`
        ) as HTMLDivElement;
        this.playBoundary = document.querySelector(
            `#${ELEMENT_IDS.PLAY_BOUNDARY}`
        ) as HTMLDivElement;

        this.width = boardWidth;
        this.height = boardHeight;
        this.imagePath = imagePath;

        this.init();
    }

    init() {
        this.element.style.width = Utils.getPxString(this.width);
        this.element.style.height = Utils.getPxString(this.height);
        this.element.style.top = Utils.getPxString(
            this.playBoundary.offsetHeight / 2 - this.height / 2
        );
        this.element.style.left = Utils.getPxString(
            this.playBoundary.offsetWidth / 2 - this.width / 2
        );

        const backgroundElement = document.createElement("div");
        backgroundElement.style.width = this.width + "px";
        backgroundElement.style.height = this.height + "px";
        backgroundElement.style.background = `url(${this.imagePath}) no-repeat`;
        backgroundElement.style.opacity = ".3";
        this.element.appendChild(backgroundElement);
    }

    render(pieceInstances: SingleMovable[]) {
        const pieces = pieceInstances.map(piece => piece.pieceData);

        const svgWidth = this.width + STROKE_OFFSET;
        const svgHeight = this.height + STROKE_OFFSET;

        const svgOptions = {
            svgWidth: svgWidth,
            svgHeight: svgHeight,
            viewbox: `0 0 ${svgWidth} ${svgHeight}`,
            isGroup: true,
        }

        const svgElementTemplate = getSvg(
            `svg-${Date.now()}`,
            pieces,
            this.imagePath,
            svgOptions,
        );

        const existingSvgElement = this.element.querySelector(".group-svg-container");
        if (existingSvgElement) {
            existingSvgElement.remove();
        }

        const svgContainer = document.createElement("div");
        svgContainer.classList.add("group-svg-container");
        svgContainer.innerHTML = svgElementTemplate;
        this.element.appendChild(svgContainer)
    }
}