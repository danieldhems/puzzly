import BaseMovable from "./BaseMovable";
import Pockets from "./Pockets";
import Puzzly from "./Puzzly";
import { InstanceTypes, MovableElement } from "./types";
export declare class PocketMovable extends BaseMovable {
    instanceType: InstanceTypes;
    piecesInPocket: MovableElement[];
    activePocket?: HTMLDivElement;
    activePocketInnerElement: null;
    Pockets: Pockets;
    constructor(puzzleData: Puzzly);
    onMouseDown(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    getMovingElementForActivePocket(event: MouseEvent): HTMLDivElement;
    getPiecesInActivePocket(): Element[];
    addToStage(): void;
    getDataForSave(): {
        pageX: number;
        pageY: number;
        _id: string | undefined;
        pocket: string | undefined;
        instanceType: InstanceTypes;
    }[];
    save(): void;
    destroy(): void;
}
