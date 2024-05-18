import RestrictedDraggable from "./RestrictedDraggable";
import { getPuzzleImpressions } from "./puzzleGenerator";
import { MovementAxis, PuzzleConfig } from "./types";

export default class PuzzleImpressionOverlay {
    svgElement: SVGSVGElement;
    draggable: RestrictedDraggable;
    targetElement: HTMLImageElement | HTMLDivElement;
    container: HTMLElement;
    puzzleConfigs: {
        rectangularPuzzleConfigs: PuzzleConfig[];
        squarePuzzleConfigs: PuzzleConfig[];
    };
    selectedPuzzleConfig: PuzzleConfig;
    rectangularImpressions: HTMLDivElement;
    squareImpressions: HTMLDivElement;
    // TODO enum
    activeImpressionSetName: string;

    constructor({
        targetElement,
        selectedPuzzleConfig,
        puzzleConfigs,
    }: {
        targetElement: HTMLImageElement | HTMLDivElement;
        selectedPuzzleConfig: PuzzleConfig;
        puzzleConfigs: {
            rectangularPuzzleConfigs: PuzzleConfig[];
            squarePuzzleConfigs: PuzzleConfig[];
        };
    }) {
        console.log("targetElement", targetElement)
        console.log("puzzle configs", puzzleConfigs)
        console.log("selected puzzle config", selectedPuzzleConfig)
        this.targetElement = targetElement;
        this.selectedPuzzleConfig = selectedPuzzleConfig;
        this.puzzleConfigs = puzzleConfigs;
        this.container = this.targetElement.parentElement as HTMLElement;

        this.rectangularImpressions = getPuzzleImpressions(
            this.puzzleConfigs.rectangularPuzzleConfigs
        );
        this.squareImpressions = getPuzzleImpressions(
            this.puzzleConfigs.squarePuzzleConfigs
        );

        // console.log(this.impressionsContainer);

        this.update(this.selectedPuzzleConfig);
        this.setActiveImpressionGroup("rectangular");
        this.setImpression("puzzle-" + this.selectedPuzzleConfig.totalNumberOfPieces);
    }

    getLayout(puzzleSize: PuzzleConfig) {
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

    update(puzzleConfig: PuzzleConfig) {
        const layout = this.getLayout(puzzleConfig);

        if (this.draggable) {
            this.draggable.update(layout);
            this.setImpression(`puzzle-${puzzleConfig.totalNumberOfPieces}`)
        } else {
            this.draggable = new RestrictedDraggable({
                containerElement: this.container,
                layout,
                id: "puzzle-impression-overlay",
                restrictionBoundingBox: layout
            });
            this.draggable.element.appendChild(this.rectangularImpressions);
            this.draggable.element.appendChild(this.squareImpressions);
        }

    }

    hideAllSets() {
        // TODO: Need cleaner solution for this
        this.rectangularImpressions.classList.add("js-hidden");
        this.squareImpressions.classList.add("js-hidden");
    }

    setActiveImpressionGroup(name: string) {
        this.activeImpressionSetName = name;
        this.hideAllSets();
        this.container.querySelector(`#${name}-impressions`)?.classList.remove("js-hidden");
    }

    setImpression(id: string) {
        const impressions = this.container.querySelector(`#${this.activeImpressionSetName}-impressions`)?.getElementsByTagName("div");

        console.log(this.activeImpressionSetName)
        console.log("setImpression", impressions)
        console.log(id)

        if (impressions) {
            Array.from(impressions).forEach((impression) => {
                if (impression.id === id) {
                    impression.classList.remove("js-hidden");
                } else {
                    impression.classList.add("js-hidden");
                }
            })
        }
    }
}