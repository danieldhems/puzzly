import { ConnectorType, DomBox, DomBoxWithoutDimensions, JigsawPieceData, MovableElement, SideNames } from "./types";
declare const Utils: {
    loadAssets(assets: HTMLImageElement[]): Promise<unknown[]>;
    loadAsset(asset: HTMLImageElement | HTMLAudioElement): Promise<unknown>;
    getAllPieces(): NodeListOf<HTMLDivElement>;
    hasCollision(source: DomBoxWithoutDimensions, target: DomBoxWithoutDimensions): boolean;
    isInside(source: DOMRect, target: DOMRect): boolean;
    /**
     * Returns a random integer between min (inclusive) and max (inclusive).
     * The value is no lower than min (or the next integer greater than min
     * if min isn't an integer) and no greater than max (or the next integer
     * lower than max if max isn't an integer).
     * Using Math.round() will give you a non-uniform distribution!
     */
    getRandomInt(min: number, max: number): number;
    getQueryStringValue(key: string): string;
    isSolved(el: HTMLDivElement): boolean;
    isTopSide(type: ConnectorType[]): boolean;
    isTopRightCorner(type: ConnectorType[]): boolean;
    isTopLeftCorner(type: ConnectorType[]): boolean;
    isLeftSide(type: ConnectorType[]): boolean;
    isInnerPiece(type: ConnectorType[]): boolean;
    isRightSide(type: ConnectorType[]): boolean;
    isTopEdgePiece(type: ConnectorType[]): boolean;
    isRightEdgePiece(type: ConnectorType[]): boolean;
    isBottomEdgePiece(type: ConnectorType[]): boolean;
    isLeftEdgePiece(type: ConnectorType[]): boolean;
    isBottomLeftCorner(type: ConnectorType[]): boolean;
    isBottomSide(type: ConnectorType[]): boolean;
    isSidePiece(type: ConnectorType[]): boolean;
    isBottomRightCorner(type: ConnectorType[]): boolean;
    isCornerPiece(type: ConnectorType[]): boolean;
    isCornerConnection(str: SideNames): boolean;
    isEdgePiece(pieceType: ConnectorType[]): any;
    getPieceType(element: HTMLDivElement): ConnectorType[];
    getPuzzlePiecesInContainer(element: HTMLDivElement): NodeListOf<Element>;
    querySelectorFrom(selector: string, elements: NodeListOf<HTMLDivElement>): any;
    getPieceFromElement(el: HTMLDivElement): JigsawPieceData;
    insertUrlParam(key: string, value: string): void;
    getElementByPieceId(id: number): HTMLDivElement;
    getPxString(value: number): string;
    getPieceIdFromElement(element: HTMLDivElement): string | undefined;
    getGroupIdFromElement(element: HTMLDivElement): string | undefined;
    getElementsInGroupByElement(groupedElement: HTMLDivElement): Element[];
    getElementBoundingBox(element: MovableElement): DomBoxWithoutDimensions;
    getCornerBoundingBox(key: SideNames, pieceDimensions: {
        width: number;
        height: number;
    }, solvingAreaBox: DomBoxWithoutDimensions): DomBoxWithoutDimensions | undefined;
    narrowBoundingBoxToTolerance(box: DomBoxWithoutDimensions, tolerance: number): {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    getElementBoundingBoxRelativeToCorner(elementBoundingBox: DomBox, corner: SideNames): DomBox;
    getTopLeftCornerBoundingBox(): DomBoxWithoutDimensions;
    getTopRightCornerBoundingBox(): DomBoxWithoutDimensions;
    getBottomRightCornerBoundingBox(): DomBoxWithoutDimensions;
    getBottomLeftCornerBoundingBox(): DomBoxWithoutDimensions;
    getConnectorBoundingBox(element: HTMLDivElement, side: SideNames): {
        top: number;
        right: number;
        bottom: number;
        left: number;
    } | undefined;
    getConnectorBoundingBoxInGroup(element: HTMLDivElement, connector: SideNames, containerBoundingBox: DomBox): {
        top: any;
        right: number;
        bottom: number;
        left: any;
    } | undefined;
    getElementBoundingBoxForFloatDetection(element: HTMLDivElement, drawBoundingBox?: boolean): {
        top: any;
        right: any;
        bottom: any;
        left: any;
    };
    drawBox(box: DomBox, container?: HTMLDivElement | null, borderColor?: string): void;
    removeAllBoundingBoxIndicators(): void;
    getBoundingBoxForOffset(element: HTMLDivElement): {
        top: number;
        right: number;
        bottom: number;
        left: number;
        width: number;
        height: number;
    } | null;
    getStyleBoundingBox(element: HTMLDivElement): DomBox;
    getPocketByCollision(box: DomBoxWithoutDimensions): HTMLDivElement | undefined;
    getEventBox(e: MouseEvent): DomBoxWithoutDimensions;
    getIndividualPiecesOnCanvas(): MovableElement[];
    isOverPockets(box: DomBox): boolean;
    isPuzzlePiece(target: HTMLElement): boolean;
    getPuzzlePieceElementFromEvent(e: MouseEvent): MovableElement | undefined;
    elementIsInDragContainer(element: HTMLDivElement): boolean;
    isPocketDragContainer(element: HTMLDivElement): boolean;
    isDragAndSelectDragContainer(element: HTMLDivElement): boolean;
    getOrientation(boundingBox: DOMRect): "square" | "portrait" | "landscape";
    shuffleArray(array: unknown[]): unknown[];
    getSequentialArray(start: number, end: number, shuffle?: boolean): unknown[];
    evalBez(poly: number[], t: number): number;
    getCurveBoundingBox(controlPoints: {
        x: number;
        y: number;
    }[]): {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
};
export default Utils;
