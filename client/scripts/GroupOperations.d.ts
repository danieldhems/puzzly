import CanvasOperations from "./CanvasOperations";
import { MovableElement } from "./types";
import SingleMovable from "./SingleMovable";
export interface GroupOperationsProperties {
    width: number;
    height: number;
    puzzleImage: HTMLImageElement;
    shadowOffset: number;
    piecesPerSideHorizontal: number;
    piecesPerSideVertical: number;
    position?: {
        top: number;
        left: number;
    };
    zIndex?: number;
}
export default interface GroupOperations extends GroupOperationsProperties {
    CanvasOperations: CanvasOperations;
}
export default class GroupOperations implements GroupOperationsProperties {
    constructor(config: GroupOperationsProperties);
    isGroupSolved(groupId: string): boolean | void;
    static getGroupTopContainer(el: HTMLDivElement): MovableElement;
    getGroup(element: MovableElement): string | null;
    getPiecesInGroup(groupId: string): NodeListOf<MovableElement>;
    static getPiecesInGroupContainer(container: MovableElement): NodeListOf<Element>;
    static getSolvedPieces(): NodeListOf<MovableElement>;
    getConnections(el: MovableElement): string[];
    getCollisionCandidatesInGroup(groupId: string): HTMLDivElement[];
    static generateGroupId(): number;
    static setIdForGroupElements(groupContainerElement: MovableElement, id: string): void;
    createGroup(sourceInstance: SingleMovable, targetInstance: SingleMovable): {
        container: HTMLDivElement;
        position: {
            top: number;
            left: number;
        };
    };
    createGroupContainer(groupId?: string): MovableElement;
    getElementsForGroup(groupId: string): MovableElement[];
    addToGroup(sourceInstance: SingleMovable, groupId: string, alignGroupToElement?: boolean): void;
    setGroupContainerPosition(container: MovableElement, { top, left }: Pick<DOMRect, "top" | "left">): void;
    getConnectionsForPiece(element: MovableElement): string[];
    updateConnections(elements: MovableElement[]): void;
}
