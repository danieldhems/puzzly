import BaseMovable from "./BaseMovable.js";
import Puzzly from "./Puzzly.js";
export declare enum ZoomTypes {
    Normal = "normal",
    Pointer = "pointer"
}
export default class Zoom extends BaseMovable {
    stage: HTMLDivElement;
    playBoundary: BaseMovable["playBoundary"];
    isPreviewActive: boolean;
    currentZoomInterval: number;
    zoomLevel: BaseMovable["zoomLevel"];
    prevZoomLevel: number;
    zoomType: ZoomTypes;
    isZoomed: boolean;
    keys: number[];
    constructor(puzzly: Puzzly);
    handleNormalZoom(event: KeyboardEvent): void;
    handlePointerZoom(event: MouseEvent): void;
    getTransformOrigin(event: KeyboardEvent | MouseEvent): {
        top: number;
        left: number;
    } | undefined;
    setTransformOrigin(event: MouseEvent | KeyboardEvent): void;
    resetZoomLevel(): void;
    setZoomLevel(): void;
    increaseZoomLevel(): void;
    decreaseZoomLevel(): void;
    scalePlayBoundary(scale: number): void;
    centerPlayBoundary(): void;
}
