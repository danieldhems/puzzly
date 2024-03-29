import GroupMovable from "./GroupMovable";
import { PocketMovable } from "./PocketMovable";
import { DebugOptions } from "./puzzlyCreator";
import SingleMovable from "./SingleMovable";
declare global {
    interface Window {
        Puzzly: any;
        Zoom: any;
        PuzzlyCreator: any;
        move: any;
    }
}
export declare enum InstanceTypes {
    SingleMovable = "SingleMovable",
    GroupMovable = "GroupMovable",
    PocketMovable = "PocketMovable",
    PlayBoundaryMovable = "PlayBoundaryMovable"
}
export type SingleMovableElement = HTMLDivElement;
export type GroupMovableElement = HTMLDivElement;
export type PocketMovableElement = HTMLDivElement;
export type MovableElement = SingleMovableElement | GroupMovableElement | PocketMovableElement;
export type MovableInstance = SingleMovable | GroupMovable | PocketMovable;
export interface Connection {
    type: SideNames | undefined;
    sourceElement: HTMLDivElement;
    targetElement?: HTMLDivElement;
    isSolving: boolean;
}
export type ConnectorType = -1 | 0 | 1;
export declare enum ConnectorNames {
    Plug = "plug",
    Socket = "socket"
}
export type ConnectorControlPoints = {
    cp1: {
        x: number;
        y: number;
    };
    cp2: {
        x: number;
        y: number;
    };
    dest: {
        x: number;
        y: number;
    };
};
export declare enum SideNames {
    Top = "top",
    Right = "right",
    Bottom = "bottom",
    Left = "left",
    TopRight = "top-right",
    BottomRight = "bottom-right",
    BottomLeft = "bottom-left",
    TopLeft = "top-left"
}
export type CurrentConnections = [SideNames, SideNames, SideNames, SideNames];
export type ConnectsTo = Record<string, number>;
export interface JigsawPieceData {
    id: number;
    _id: string;
    puzzleId: string;
    groupId: string;
    pocketId: number;
    imgX: number;
    imgY: number;
    imgW: number;
    imgH: number;
    pageX: number;
    pageY: number;
    zIndex: number;
    type: ConnectorType[];
    spriteX: number;
    spriteY: number;
    spritePath: string;
    spriteShadowX: number;
    spriteShadowY: number;
    solvedX: number;
    solvedY: number;
    isInnerPiece: boolean;
    isVisible: boolean;
    isSolved: boolean;
    connections: SideNames[];
    connectsTo: ConnectsTo;
    numPiecesFromTopEdge: number;
    numPiecesFromLeftEdge: number;
    piecesPerSideHorizontal: number;
    piecesPerSideVertical: number;
    selectedNumPieces: number;
    svgPath: string;
}
export interface GroupData {
    _id: string;
    puzzleId: string;
    piecesInGroup: JigsawPieceData;
    position: {
        top: number;
        left: number;
    };
    isSolved: boolean;
    zIndex: number;
}
export type DomBox = {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
};
export type DomBoxWithoutDimensions = Omit<DomBox, "width" | "height">;
export declare enum PuzzleShapes {
    Square = "Square",
    Rectangle = "Rectangle"
}
export interface PuzzleCreatorOptions {
    stageWidth: number;
    stageHeight: number;
    debugOptions: DebugOptions;
    selectedNumPieces: number;
    selectedShape?: PuzzleShapes;
    piecesPerSideHorizontal?: number;
    piecesPerSideVertical?: number;
    imagePreviewType: string;
    originalImageSize: {
        width: number;
        height: number;
    };
    pieces?: JigsawPieceData[];
    boardWidth: number;
    boardHeight: number;
    imageSize: number;
    spritePath?: string;
    previewPath: string;
    drawOutlines?: boolean;
    connectorSize?: number;
    integration: boolean;
}
export type PuzzleCreationResponse = PuzzleCreatorOptions & {
    _id: string;
    complete?: boolean;
    zIndex?: number;
    pieceSize: number;
    connectorDistanceFromCorner: number;
};
export interface SavedProgress {
    pieces: JigsawPieceData[];
    groups: GroupData[];
    latestSave: number;
}
export declare enum LocalStorageKeys {
    Progress = "LOCAL_STORAGE_PUZZLY_PROGRESS_KEY",
    LastSave = "LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY"
}
export interface SingleMovableSaveState {
    _id: string | undefined;
    groupId?: string;
    pageX: number;
    pageY: number;
    zIndex: number;
    isSolved: boolean;
    puzzleId: string;
    pocket: number;
    instanceType: InstanceTypes;
    isPuzzleComplete: boolean;
    integration?: boolean;
}
export interface GroupMovableSaveState extends Omit<SingleMovableSaveState, "pocket" | "pageX" | "pageY"> {
    position: {
        top: number;
        left: number;
    };
    remove?: boolean;
    pieces: SingleMovableSaveState[];
}
export type SaveStates = SingleMovableSaveState | GroupMovableSaveState;
export declare enum Orientation {
    Landscape = "Landscape",
    Portrait = "Portrait"
}
export type PieceSectors = {
    top: number;
    left: number;
    width: number;
    height: number;
}[];
export type PieceConnections = Record<SideNames, number>;
export declare enum SolvedPuzzlePreviewType {
    AlwaysOn = "AlwaysOn",
    Toggle = "Toggle"
}
