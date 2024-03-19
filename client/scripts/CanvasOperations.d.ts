import Puzzly from "./Puzzly.js";
import SingleMovable from "./SingleMovable.js";
import { MovableElement } from "./types.js";
export default class CanvasOperations {
    shadowOffset: Puzzly["shadowOffset"];
    puzzleImage: Puzzly["puzzleImage"];
    width: Puzzly["boardWidth"];
    height: Puzzly["boardHeight"];
    constructor(args: Pick<Puzzly, "boardWidth" | "boardHeight" | "puzzleImage" | "shadowOffset">);
    makeCanvas(): HTMLCanvasElement;
    drawMovableInstancesOntoCanvas(canvas: HTMLCanvasElement, instances: SingleMovable[], puzzleImage: Puzzly["puzzleImage"], shadowOffset: Puzzly["shadowOffset"]): void;
    drawMovableElementsOntoCanvas(canvas: HTMLCanvasElement, elements: MovableElement[], puzzleImage: Puzzly["puzzleImage"], shadowOffset: Puzzly["shadowOffset"]): void;
    onPuzzleLoaded(event: CustomEvent): void;
    getCanvas(id: string): HTMLCanvasElement | null;
}
