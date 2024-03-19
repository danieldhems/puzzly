import BaseMovable from "./BaseMovable.js";
import Pockets from "./Pockets.js";
import Puzzly from "./Puzzly.js";
import { MovableElement } from "./types.js";
declare class DragAndSelect extends BaseMovable {
    Puzzly: Puzzly;
    Pockets: Pockets;
    playBoundary: HTMLDivElement | null;
    piecesContainer: HTMLDivElement | null;
    selectedPiecesContainer: HTMLDivElement | null;
    zoomLevel: number;
    selectedPieces: HTMLDivElement[];
    lastPosition: {
        top: number;
        left: number;
    };
    isMouseDown: boolean;
    isMouseDownHeld: boolean;
    hasMouseReleased: boolean;
    hasMouseMoved: boolean;
    isRightClick: boolean;
    isInterrogatingMouse: boolean;
    piecesSelected: boolean;
    selectedPiecesAreMoving: boolean;
    mouseHoldDetectionTime: number;
    mouseHoldDetectionMovementTolerance: number;
    mouseHoldStartX: number | null;
    mouseHoldStartY: number | null;
    drawBox: HTMLDivElement;
    drawBoxActive: boolean;
    drawBoxStartX: number | null;
    drawBoxStartY: number | null;
    timer: ReturnType<typeof setTimeout> | null;
    touchStartTime: number;
    touchEndTime: number;
    diffX: number;
    diffY: number;
    constructor(opts: Puzzly);
    setScale(eventData: CustomEvent): void;
    isMouseHoldInitiated(): Promise<unknown>;
    isMouseHoldWithinTolerance(event: MouseEvent): boolean | undefined;
    initiateDrawBox(): void;
    activateDrawBox(event: MouseEvent): void;
    deactivateDrawBox(): void;
    updateDrawBox(event: MouseEvent): void;
    toggleDrawCursor(): void;
    setDrawCursor(state: number): void;
    getCollidingPieces(): MovableElement[];
    toggleHighlightPieces(pieces: MovableElement[]): void;
    getBoundingBoxForDragContainer(pieces: MovableElement[]): {
        top: number;
        right: number;
        bottom: number;
        left: number;
        width: number;
        height: number;
    };
    getContainerForMove(pieces: MovableElement[]): HTMLDivElement;
    dropPieces(pieces: MovableElement[]): void;
    onMouseDown(e: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    addPiecesToPocket(pocket: HTMLDivElement): void;
    endDrag(event: MouseEvent): void;
    isDragOutOfBounds(): boolean;
    setLastPosition(): void;
    reset(): void;
    save(): void;
}
export default DragAndSelect;