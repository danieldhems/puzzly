import { Connection, DomBox, MovableElement, SideNames } from "./types";
export declare const getOppositeSide: (sideName: SideNames) => SideNames | undefined;
export declare function checkConnections(element: MovableElement, solvingAreaBox: DomBox, connectorTolerance: number): Connection | undefined;
