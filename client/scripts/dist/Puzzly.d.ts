import SingleMovable from "./SingleMovable";
import GroupMovable from "./GroupMovable";
import Pockets from "./Pockets";
import DragAndSelect from "./dragAndSelect";
import { PocketMovable } from "./PocketMovable";
import PersistenceOperations from "./persistence";
import CanvasOperations from "./CanvasOperations";
import Zoom from "./zoom";
import SolvedPuzzlePreview from "./SolvedPuzzlePreview";
import { GroupData, JigsawPieceData, MovableElement, PuzzleCreationResponse, SolvedPuzzlePreviewType } from "./types";
import PieceLayouts from "./PieceLayouts";
import Sounds from "./Sounds";
/**
 * Puzzly
 *
 */
export default class Puzzly {
    DragAndSelect: DragAndSelect;
    SolvedPuzzlePreview: SolvedPuzzlePreview;
    PocketMovable: PocketMovable;
    PieceLayouts: PieceLayouts;
    PersistenceOperations: PersistenceOperations;
    CanvasOperations: CanvasOperations;
    Zoom: Zoom;
    Sounds: Sounds;
    boardSize: number;
    puzzleId: string;
    pieces: JigsawPieceData[];
    groups: GroupData[];
    lastSaveDate: number;
    pieceSize: number;
    piecesPerSideHorizontal: number;
    piecesPerSideVertical: number;
    selectedNumPieces: number;
    shadowOffset: number;
    Pockets: Pockets;
    pocketId: number;
    puzzleImage: HTMLImageElement;
    previewImage: HTMLImageElement;
    previewImageType: SolvedPuzzlePreviewType;
    puzzleImagePath: string;
    spritePath: string;
    boardWidth: number;
    solvedGroupId: number;
    boardHeight: number;
    zoomLevel: number;
    connectorTolerance: number;
    connectorDistanceFromCorner: number;
    connectorSize: number;
    floatTolerance: number;
    pieceInstances: SingleMovable[];
    groupInstances: GroupMovable[];
    complete?: boolean;
    stage: HTMLDivElement | null;
    playBoundary: HTMLDivElement | null;
    piecesContainer: HTMLDivElement | null;
    isPreviewActive: boolean;
    largestPieceSpan: number;
    noDispersal?: boolean;
    currentZIndex?: number;
    solvedCnv: HTMLCanvasElement | null;
    solvingArea: HTMLDivElement;
    filterBtn: HTMLSpanElement | null;
    filterBtnOffLabel: HTMLSpanElement | null;
    filterBtnOnLabel: HTMLSpanElement | null;
    timeStarted: number;
    integration: boolean;
    constructor(puzzleId: string, config: PuzzleCreationResponse);
    init(): void;
    updateSolvedCanvas(): void;
    removeGroupInstance(groupInstance: GroupMovable): void;
    setupSolvingArea(): void;
    updateElapsedTime(isComplete?: boolean): Promise<Response>;
    keepOnTop(el: MovableElement): void;
    loadAssets(assets: HTMLImageElement[]): Promise<unknown[]>;
    loadAsset(asset: HTMLImageElement): Promise<unknown>;
}