import { MovableElement, SideNames } from "./types";
export declare const getOppositeSide: (sideName: SideNames) => SideNames | undefined;
export declare function checkConnections(element: MovableElement): {
    type: SideNames;
    sourceElement: HTMLDivElement;
    isSolving: boolean;
} | undefined;
