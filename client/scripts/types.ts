import GroupMovable from "./GroupMovable.js";
import { PocketMovable } from "./PocketMovable.js";
import Pockets from "./Pockets.js";
import { DebugOptions } from "./puzzlyCreator.js";
import SingleMovable from "./SingleMovable.js";

declare global {
  interface Window {
    Puzzly: any;
    Zoom: any;
    PuzzlyCreator: any;
  }
}

export enum InstanceTypes {
  SingleMovable = "SingleMovable",
  GroupMovable = "GroupMovable",
  PocketMovable = "PocketMovable",
  PlayBoundaryMovable = "PlayBoundaryMovable",
}

export type SingleMovableElement = HTMLDivElement;
export type GroupMovableElement = HTMLDivElement;
export type PocketMovableElement = HTMLDivElement;
export type MovableElement =
  | SingleMovableElement
  | GroupMovableElement
  | PocketMovableElement;

export type MovableInstance = SingleMovable | GroupMovable | PocketMovable;

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
  piecesPerSideHorizontal: number;
  piecesPerSideVertical: number;
  selectedNumPieces: number;
  svgPath: string;
}

export type DomBox = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export interface Puzzly {
  puzzleId: string;
  pieces: JigsawPieceData[];
  piecesPerSideHorizontal: number;
  piecesPerSideVertical: number;
  shadowOffset: number;
  Pockets: Pockets;
  pocketId: number;
  puzzleImage: ImageBitmap;
  boardWidth: number;
  boardHeight: number;
  zoomLevel: number;
  connectorTolerance: number;
  connectorDistanceFromCorner: number;
  connectorSize: number;
  pieceInstances: SingleMovable[];
  groupInstances: GroupMovable[];
  complete: boolean;
  playBoundary: HTMLDivElement;
  stage: HTMLDivElement;
  piecesContainer: HTMLDivElement;
  isPreviewActive: boolean;
  keepOnTop: (element: MovableElement) => void;
  updateSolvedCanvas: () => void;
}

export interface PuzzleCreatorOptions {
  stageWidth: number;
  stageHeight: number;
  debugOptions: DebugOptions;
  selectedNumPieces: number;
  imagePreviewType: string; // TODO: Enum
  originalImageSize: {
    width: number;
    height: number;
  };
  pieces?: JigsawPieceData[];
  boardSize: number;
  imageSize: number;
  puzzleToImageRatio: number;
  spritePath?: string;
  previewPath: string;
  integration: boolean;
}
