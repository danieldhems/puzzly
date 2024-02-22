import Pockets from "./Pockets.js";

declare global {
  interface Window {
    Puzzly: any;
    Zoom: any;
  }
}

export enum InstanceTypes {
  SingleMovable = "SingleMovable",
  GroupMovable = "GroupMovable",
  PocketMovable = "PocketMovable",
  DragAndSelectMovable = "DragAndSelectMovable",
  PlayBoundaryMovable = "PlayBoundaryMovable",
}

export interface PuzzleData {
  puzzleId: string;
  piecesPerSideHorizontal: number;
  piecesPerSideVertical: number;
  shadowOffset: number;
  Pockets: Pockets;
  pocketId: number;
  puzzleImage: ImageBitmap;
  boardWidth: number;
  boardHeight: number;
}

export type SingleMovableElement = HTMLDivElement;
export type GroupMovableElement = HTMLDivElement;
export type PocketMovableElement = HTMLDivElement;
export type DragAndSelectMovableElement = HTMLDivElement;
export type MovableElement =
  | SingleMovableElement
  | GroupMovableElement
  | PocketMovableElement
  | DragAndSelectMovableElement;

export interface Connection {
  type: string;
  sourceElement: HTMLDivElement;
  targetElement?: HTMLDivElement;
  isSolving: boolean;
}

export type ConnectorType = -1 | 0 | 1;
export enum ConnectorNames {
  Plug = "plug",
  Socket = "socket",
}

// Todo: These won't work for non-four-sided pieces - should be an array of ConnectorTypes instead
export enum SideNames {
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
  TopRight = "top-right",
  BottomRight = "bottom-right",
  BottomLeft = "bottom-left",
  TopLeft = "top-left",
}
export type CurrentConnections = [SideNames, SideNames, SideNames, SideNames];
export type ConnectsTo = Record<string, number>;
export interface JigsawPieceData {
  // This is actually the index of the piece
  id: number;
  // This is the true ID for the piece in the database
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
  svgPath: string;
}

export type DomBox = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
