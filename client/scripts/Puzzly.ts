import SingleMovable from "./SingleMovable";
import GroupMovable from "./GroupMovable";
import Pockets from "./Pockets";
import DragAndSelect from "./dragAndSelect";
import Utils from "./utils";
import {
  CONNECTOR_SIZE_PERC,
  CONNECTOR_TOLERANCE_AMOUNT,
  ELEMENT_IDS,
  EVENT_TYPES,
  FLOAT_TOLERANCE_AMOUNT,
  SCREEN_MARGIN,
  SHADOW_OFFSET_RATIO,
  SOLVING_AREA_SCREEN_PORTION,
} from "./constants";
import { PocketMovable } from "./PocketMovable";
import PersistenceOperations from "./persistence";
import CanvasOperations from "./CanvasOperations";
import Zoom from "./zoom";
import PlayBoundaryMovable from "./PlayBoundaryMovable";
import SolvedPuzzlePreview from "./SolvedPuzzlePreview";
import {
  GroupData,
  JigsawPieceData,
  MovableElement,
  MovableInstance,
  PuzzleConfig,
  PuzzleCreationResponse,
  PuzzleShapes,
  SolvedPuzzlePreviewType,
} from "./types";
import PieceLayouts from "./PieceLayouts";
import loadAssets from "./assetLoader";
import Sounds from "./Sounds";
import SolvingArea from "./SolvingArea";
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
  PlayBoundaryMovable: PlayBoundaryMovable;
  SolvingArea: SolvingArea;
  Zoom: Zoom;
  Sounds: Sounds;
  boardSize: number;
  puzzleWidth: number;
  puzzleHeight: number;
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
  puzzleSprite: HTMLImageElement;
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
  filterBtn: HTMLSpanElement | null;
  filterBtnOffLabel: HTMLSpanElement | null;
  filterBtnOnLabel: HTMLSpanElement | null;
  timeStarted: number;
  integration: boolean;
  imageWidth: number;
  imageHeight: number;
  imagePreviewType: SolvedPuzzlePreviewType;
  scale: number;
  viewportLargeEnoughForOutOfBoundsArea: boolean;
  playBoundaryWidth: number;
  playBoundaryHeight: number;
  lengthForFullScreen: number;
  numberOfPiecesHorizontal: number;
  numberOfPiecesVertical: number;
  cropData: {
    top: number,
    left: number,
    width: number;
    height: number;
  }

  constructor(puzzleId: string, config: any) {
    Object.assign(this, {
      ...config,
      debug: true,
      showDebugInfo: false,
      piecesPerSideHorizontal: config.numberOfPiecesHorizontal,
      piecesPerSideVertical: config.numberOfPiecesVertical,
      drawSquares: false,
    });

    window.Puzzly = this;

    this.numberOfPiecesHorizontal = config.numberOfPiecesHorizontal;
    this.numberOfPiecesVertical = config.numberOfPiecesVertical;

    // TODO: Rename this to avoid confusion
    this.selectedNumPieces = config.totalNumberOfPieces;

    this.boardWidth = config.boardWidth;
    this.boardHeight = config.boardHeight;

    this.pieces = config.pieces as JigsawPieceData[];

    this.complete = config.complete;

    this.puzzleId = puzzleId;

    this.noDispersal = config?.debugOptions?.noDispersal;

    this.currentZIndex = config.zIndex || 3;

    this.solvedGroupId = 1111;

    this.puzzleId = puzzleId;

    this.puzzleImage = new Image();
    this.puzzleImage.src = this.puzzleImagePath;

    console.log(this);

    this.previewImageType = SolvedPuzzlePreviewType.AlwaysOn;

    this.stage = document.querySelector(`#${ELEMENT_IDS.STAGE}`);
    this.playBoundary = document.querySelector(`#${ELEMENT_IDS.PLAY_BOUNDARY}`);
    this.piecesContainer = document.querySelector(
      `#${ELEMENT_IDS.PIECES_CONTAINER}`
    );

    loadAssets([this.puzzleImage]).then(() => {
      this.init();
    });
  }

  init() {
    this.zoomLevel = 1;

    this.shadowOffset = this.pieceSize * SHADOW_OFFSET_RATIO;

    this.connectorTolerance =
      (this.connectorSize / 100) * ((100 - CONNECTOR_TOLERANCE_AMOUNT) / 2);

    this.floatTolerance = (this.pieceSize / 100) * FLOAT_TOLERANCE_AMOUNT;

    this.largestPieceSpan = this.pieceSize + this.connectorSize * 2;

    this.playBoundary = document.querySelector("#play-boundary");

    this.PlayBoundaryMovable = new PlayBoundaryMovable(this);
    this.SolvingArea = new SolvingArea(this.boardWidth, this.boardHeight, this.puzzleImage.src)

    this.Zoom = new Zoom(this);

    this.Pockets = new Pockets(this);
    // this.DragAndSelect = new DragAndSelect(this);
    this.SolvedPuzzlePreview = new SolvedPuzzlePreview(this);
    this.PocketMovable = new PocketMovable(this);
    this.PieceLayouts = new PieceLayouts(this);
    this.PersistenceOperations = new PersistenceOperations(this);
    this.Sounds = new Sounds();
    this.CanvasOperations = new CanvasOperations(this);

    const storage = this.PersistenceOperations.getPersistence(
      this.pieces,
      this.groups,
      this.lastSaveDate
    );

    this.pieceInstances = [];
    this.groupInstances = [];

    if (storage && storage.pieces.length > 0) {
      // console.log("Getting pieces from storage", storage)
      storage.pieces.forEach((p) => {
        const data = {
          ...p,
          spritePath: this.spritePath,
        };
        const pieceInstance = new SingleMovable({
          puzzleData: this,
          pieceData: data,
        });

        this.pieceInstances.push(pieceInstance);
      });

      // console.log("groups from persistence", this.groups);
      if (Object.keys(this.groups).length) {
        for (let g in this.groups) {
          const group = this.groups[g];
          const pieceInstances = this.pieceInstances.filter((pieceInstance) => {
            return pieceInstance.groupId === group._id;
          });
          // console.log("piece instances found for group", pieceInstances);
          const groupInstance = new GroupMovable({
            Puzzly: this,
            _id: group._id,
            pieces: pieceInstances,
            zIndex: group.zIndex,
            position: group.position,
            isSolved: group.isSolved,
          });
          this.groupInstances.push(groupInstance);
          // console.log("group instances", this.groupInstances);
        }
      }

      if (this.complete) {
        this.CanvasOperations.drawMovableInstancesOntoCanvas(
          this.solvedCnv as HTMLCanvasElement,
          this.pieceInstances,
          this.puzzleImage,
          this.shadowOffset
        );
      }
    } else {
      console.log("pieces", this.pieces);
      this.pieces.forEach((piece, index) => {
        const pieceInstance = new SingleMovable({
          puzzleData: this,
          pieceData: {
            ...piece,
            index,
          },
        });
        this.pieceInstances.push(pieceInstance);
      });
      if (!this.noDispersal) {
        this.PieceLayouts.arrangePiecesAroundEdge(
          this.largestPieceSpan,
          this.SolvingArea.element as HTMLDivElement
        );
      } else {
        // NOTE: Initial save once all pieces have been rendered
        // Only necessary when loading puzzle without disperal (for debug)
        // else the save would be called elsewhere
        window.dispatchEvent(new CustomEvent(EVENT_TYPES.SAVE));
      }
    }

    this.timeStarted = new Date().getTime();

    addEventListener(
      "beforeunload",
      function () {
        this.updateElapsedTime();
      }.bind(this)
    );

    const newPuzzleBtn = document.getElementById("js-create-new-puzzle");
    (newPuzzleBtn as HTMLElement).addEventListener("mousedown", () => {
      window.location.href = "/";
    });

    (this.stage as HTMLDivElement).classList.add("loaded");

    window.dispatchEvent(
      new CustomEvent(EVENT_TYPES.PUZZLE_LOADED, { detail: this })
    );

    const integrationTestDragHelper = document.querySelector(
      "#integration-test-drag-helper"
    ) as HTMLDivElement;
    integrationTestDragHelper.style.position = "absolute";
    integrationTestDragHelper.style.top = window.innerHeight / 2 + "px";
    integrationTestDragHelper.style.top =
      parseInt((this.playBoundary as HTMLDivElement).style.left) / 2 + "px";
    integrationTestDragHelper.style.width = "100px";
    integrationTestDragHelper.style.height = "100px";
  }

  updateSolvedCanvas() {
    const solvedPieces = this.pieceInstances.filter(
      (instance) => instance.isSolved
    );
    console.log("updateSolvedCanvas with solved pieces", solvedPieces);
    this.CanvasOperations.drawMovableInstancesOntoCanvas(
      this.solvedCnv as HTMLCanvasElement,
      solvedPieces,
      this.puzzleImage,
      this.shadowOffset
    );
  }

  removeGroupInstance(groupInstance: GroupMovable) {
    this.groupInstances = this.groupInstances.filter(
      (instance) => instance._id !== groupInstance._id
    );
  }

  bootstrap(puzzleConfig: Pick<PuzzleConfig, "imageWidth" | "imageHeight" | "numberOfPiecesHorizontal" | "numberOfPiecesVertical">) {
    const { imageWidth, imageHeight, numberOfPiecesHorizontal, numberOfPiecesVertical } = puzzleConfig;
    const smallerLength = Math.min(imageWidth, imageHeight);
    const largerLength = Math.max(imageWidth, imageHeight);

    const isSquare = numberOfPiecesHorizontal === numberOfPiecesVertical;
    const aspectRatio = smallerLength / largerLength;

    let width: number, height: number;
    if (window.innerWidth < window.innerHeight) {
      height = window.innerHeight / 100 * SOLVING_AREA_SCREEN_PORTION;
      return {
        height,
        width: isSquare ? height : height * aspectRatio,
        // pieceSize: height / numberOfPiecesVertical,
        connectorSize: height / 100 * CONNECTOR_SIZE_PERC,
      }

    } else if (window.innerHeight < window.innerWidth) {
      width = window.innerWidth / 100 * SOLVING_AREA_SCREEN_PORTION;
      return {
        width,
        height: isSquare ? width : width * aspectRatio,
        // pieceSize: width / numberOfPiecesHorizontal,
        connectorSize: width / 100 * CONNECTOR_SIZE_PERC,
      }
    }
  }

  updateElapsedTime(isComplete = false) {
    const now = new Date().getTime();
    const elapsedTime = now - this.timeStarted;

    return fetch(`/api/puzzle/updateTime/${this.puzzleId}`, {
      method: "put",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify({
        time: elapsedTime,
        isComplete,
      }),
    });
  }

  keepOnTop(el: MovableElement) {
    el.style.zIndex =
      (this.currentZIndex = (this.currentZIndex as number) + 1) + "";
  }
}
