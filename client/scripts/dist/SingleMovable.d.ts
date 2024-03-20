import BaseMovable from "./BaseMovable";
import GroupMovable from "./GroupMovable";
import GroupOperations from "./GroupOperations";
import Pockets from "./Pockets";
import Puzzly from "./Puzzly";
import { DomBox, InstanceTypes, JigsawPieceData, MovableElement, SingleMovableSaveState } from "./types";
export default class SingleMovable extends BaseMovable {
    instanceType: InstanceTypes;
    shapeType: number;
    pieceData: JigsawPieceData;
    puzzleId: string;
    _id: string;
    groupId: string;
    GroupOperations: GroupOperations;
    piecesPerSideHorizontal: number;
    piecesPerSideVertical: number;
    isSolved: boolean;
    Puzzly: Puzzly;
    pocketId?: number;
    Pockets: Pockets;
    constructor({ puzzleData, pieceData, }: {
        puzzleData: Puzzly;
        pieceData: JigsawPieceData;
    });
    setPiece(pieceData: JigsawPieceData): void;
    createElement(): HTMLDivElement;
    render(): void;
    isElementOwned(element: MovableElement): boolean;
    hasMouseDown(element: HTMLElement): boolean;
    addToPocket(pocket: HTMLDivElement): void;
    addToSolved(): void;
    isOutOfBounds(event: MouseEvent): boolean;
    markAsSolved(): void;
    getConnectingPieceIds(pieceData: JigsawPieceData): {
        right: number;
        bottom: number;
        left?: undefined;
        top?: undefined;
    } | {
        left: number;
        right: number;
        bottom: number;
        top?: undefined;
    } | {
        left: number;
        bottom: number;
        right?: undefined;
        top?: undefined;
    } | {
        top: number;
        right: number;
        bottom: number;
        left?: undefined;
    } | {
        top: number;
        right: number;
        bottom: number;
        left: number;
    } | {
        top: number;
        left: number;
        bottom: number;
        right?: undefined;
    } | {
        top: number;
        right: number;
        bottom?: undefined;
        left?: undefined;
    } | {
        top: number;
        left: number;
        right: number;
        bottom?: undefined;
    } | {
        top: number;
        left: number;
        right?: undefined;
        bottom?: undefined;
    } | undefined;
    onMouseDown(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    setLastPosition(position?: Pick<DomBox, "top" | "left">): void;
    onPuzzleLoaded(): void;
    onMoveFinished(): void;
    solve(options?: {
        save: boolean;
    } | undefined): void;
    setGroupIdAcrossInstance(groupId: string): void;
    onGroupCreated(event: CustomEvent): void;
    setPositionAsGrouped(): void;
    joinTo(targetInstance: GroupMovable | SingleMovable): void;
    getDataForSave(): SingleMovableSaveState;
    save(force?: boolean): void;
}
