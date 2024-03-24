import { Connection, MovableElement, SideNames } from "./types";
export declare const getOppositeSide: (sideName: SideNames) => SideNames | undefined;
export declare function checkConnections(element: MovableElement): Connection | undefined;
