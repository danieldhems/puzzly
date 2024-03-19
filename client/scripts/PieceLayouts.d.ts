import arrangePiecesAroundEdge from "./pieceLayoutsNeaten";
import Pockets from "./Pockets";
import { PieceSectors } from "./types";
export interface PieceLayoutsProperties {
    largestPieceSpan: number;
    selectedNumPieces: number;
    solvingArea: HTMLDivElement | null;
    playBoundary: HTMLDivElement | null;
    Pockets: Pockets;
}
export default interface PieceLayouts extends PieceLayoutsProperties {
}
export default class PieceLayouts {
    playBoundary: HTMLDivElement | null;
    solvingArea: HTMLDivElement | null;
    selectedNumberOfPieces: number;
    pieceSectors: PieceSectors;
    sendToEdgeNeatenBtn: HTMLSpanElement | null;
    controlsHandle: HTMLElement | null;
    controlsPanel: HTMLElement | null;
    sendToEdgeShuffleBtn: HTMLElement | null;
    gatherPiecesBtn: HTMLSpanElement | null;
    controlsPanelIsOpen: boolean;
    innerPiecesVisible: boolean;
    filterBtnOnLabel: HTMLSpanElement | null;
    filterBtnOffLabel: HTMLSpanElement | null;
    filterBtn: HTMLElement | null;
    solvingAreaBoundingBox: {
        width: number;
        height: number;
        top: number;
        left: number;
    };
    arrangePiecesAroundEdge: typeof arrangePiecesAroundEdge;
    constructor({ largestPieceSpan, selectedNumPieces, solvingArea, playBoundary, Pockets, }: PieceLayoutsProperties);
    getSolvingAreaBoundingBox(): {
        top: number;
        left: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
    } | undefined;
    getPlayBoundaryBoundingBox(): {
        top: number;
        left: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
    } | undefined;
    attachEventListeners(): void;
    toggleInnerPieces(piecesVisible: boolean): void;
    onArrangePiecesAroundEdge(): void;
    gatherPieces(): void;
    onControlsHandleClick(): void;
    generatePieceSectorMap(): void;
    getRandomCoordsFromSectorMap(): {
        x: number;
        y: number;
    }[];
    getSectorBoundingBox(sectorIndex: number): {
        top: number;
        right: number;
        bottom: number;
        left: number;
    } | undefined;
    getRandomPositionOutsideBoardArea(sectorIndex: number): {
        left: number;
        top: number;
    } | undefined;
}
