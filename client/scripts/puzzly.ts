import SingleMovable from "./SingleMovable.js";
import GroupMovable from "./GroupMovable.js";
import Pockets from "./pockets.js";
import DragAndSelect from "./dragAndSelect.js";
import Utils from "./utils.js";
import {
  CONNECTOR_TOLERANCE_AMOUNT,
  ELEMENT_IDS,
  EVENT_TYPES,
  FLOAT_TOLERANCE_AMOUNT,
  SHADOW_OFFSET_RATIO,
} from "./constants.js";
import { PocketMovable } from "./PocketMovable.js";
import PersistenceOperations from "./persistence.js";
import CanvasOperations from "./canvasOperations.js";
import Zoom from "./zoom.js";
import PlayBoundaryMovable from "./PlayBoundaryMovable.js";
import SolvedPuzzlePreview from "./SolvedPuzzlePreview.js";
import {
  JigsawPieceData,
  PuzzleCreationResponse,
  PuzzleShapes,
  SolvedPuzzlePreviewType,
} from "./types.js";
import PieceLayouts from "./PieceLayouts.js";
import loadAssets from "./assetLoader.js";
import Sounds from "./Sounds.js";
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
  Sounds: Sounds;
  puzzleId: string;
  pieces: JigsawPieceData[];
  pieceSize: number;
  piecesPerSideHorizontal: number;
  piecesPerSideVertical: number;
  selectedNumPieces: number;
  shadowOffset: number;
  Pockets: Pockets;
  pocketId: number;
  puzzleImage: HTMLImageElement;
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
  solvingArea: HTMLDivElement;
  filterBtn: HTMLSpanElement | null;
  filterBtnOffLabel: HTMLSpanElement | null;
  filterBtnOnLabel: HTMLSpanElement | null;
  integration: boolean;

  constructor(puzzleId: string, config: PuzzleCreationResponse) {
    Object.assign(this, {
      ...config,
      debug: true,
      showDebugInfo: false,
      jigsawSpriteConnectorSize: 42,
      jigsawSpriteConnectorDistanceFromCorner: 43,
      piecesPerSideHorizontal:
        config.selectedShape === PuzzleShapes.Rectangle
          ? config.piecesPerSideHorizontal
          : Math.sqrt(config.selectedNumPieces),
      piecesPerSideVertical:
        config.selectedShape === PuzzleShapes.Rectangle
          ? config.piecesPerSideVertical
          : Math.sqrt(config.selectedNumPieces),
      drawOutlines: config.drawOutlines || false,
      drawSquares: false,
    });

    window.Puzzly = this;

    this.pieces = config.pieces as JigsawPieceData[];
    this.connectorSize = config.connectorSize as number;

    this.complete = config.complete;

    this.puzzleId = puzzleId;

    this.noDispersal = config.debugOptions.noDispersal;

    this.currentZIndex = config.zIndex || 3;

    this.solvedGroupId = 1111;

    this.puzzleId = puzzleId;

    this.previewImage = new Image();
    this.previewImage.src = this.puzzleImagePath;
    this.puzzleImage = new Image();
    this.puzzleImage.src = this.spritePath;
    console.log(this);

    this.previewImageType = SolvedPuzzlePreviewType.AlwaysOn;

    this.stage = document.querySelector(`#${ELEMENT_IDS.STAGE}`);
    this.playBoundary = document.querySelector(`#${ELEMENT_IDS.PLAY_BOUNDARY}`);
    if (this.solvingArea) {
      this.solvingArea = document.querySelector(
        `#${ELEMENT_IDS.SOLVED_PUZZLE_AREA}`
      ) as HTMLDivElement;
    }
    this.piecesContainer = document.querySelector(
      `#${ELEMENT_IDS.PIECES_CONTAINER}`
    );

    loadAssets([this.previewImage, this.puzzleImage]).then(() => {
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

    this.setupSolvingArea();

    const solvingAreaBoundingBox = (
      this.solvingArea as HTMLDivElement
    ).getBoundingClientRect();

    this.boardWidth = solvingAreaBoundingBox.width;
    this.boardHeight = solvingAreaBoundingBox.height;

    this.Pockets = new Pockets(this);
    this.DragAndSelect = new DragAndSelect(this);
    this.SolvedPuzzlePreview = new SolvedPuzzlePreview(this.previewImageType);
    this.PocketMovable = new PocketMovable(this);
    this.PieceLayouts = new PieceLayouts(this);
    this.PersistenceOperations = new PersistenceOperations(this);
    this.Sounds = new Sounds();

    const storage = this.PersistenceOperations.getPersistence(
      this.pieces,
      this.groups,
      this.lastSaveDate
    );

    this.pieceInstances = [];
    this.groupInstances = [];

    if (storage?.pieces?.length > 0) {
      storage.pieces.forEach((p) => {
        this.initiatePiece.call(this, p);
      });

      console.log("groups from persistence", this.groups);
      if (Object.keys(this.groups).length) {
        for (let g in this.groups) {
          const group = this.groups[g];
          const pieceInstances = this.pieceInstances.filter((pieceInstance) => {
            return pieceInstance.groupId === group._id;
          });
          // console.log("piece instances found for group", pieceInstances);
          const groupInstance = new GroupMovable({
            puzzleData: this,
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
        CanvasOperations.drawPiecesOntoCanvas(
          this.solvedCnv,
          this.pieceInstances,
          this.puzzleImage,
          this.shadowOffset
        );
      }
    } else {
      this.piecePositionMap = Utils.shuffleArray(
        this.PieceLayouts.getRandomCoordsFromSectorMap()
      );
      // console.log("pieces", this.pieces);
      this.renderPieces(this.pieces);
      if (!this.noDispersal) {
        this.PieceLayouts.arrangePiecesAroundEdge(
          this.largestPieceSpan,
          this.solvingArea as HTMLDivElement
        );
      }
      // this.assignPieceConnections();
    }

    this.timeStarted = new Date().getTime();

    addEventListener(
      "beforeunload",
      function () {
        this.updateElapsedTime();
      }.bind(this)
    );

    const newPuzzleBtn = document.getElementById("js-create-new-puzzle");
    newPuzzleBtn.addEventListener("mousedown", () => {
      window.location = "/";
    });

    window.addEventListener(
      EVENT_TYPES.CONNECTION_MADE,
      this.onConnectionMade.bind(this)
    );

    this.Zoom = new Zoom(this);
    new PlayBoundaryMovable(this);

    this.stage.classList.add("loaded");
    window.dispatchEvent(
      new CustomEvent(EVENT_TYPES.PUZZLE_LOADED, { detail: this })
    );

    const integrationTestDragHelper = document.querySelector(
      "#integration-test-drag-helper"
    );
    integrationTestDragHelper.style.position = "absolute";
    integrationTestDragHelper.style.top = window.innerHeight / 2 + "px";
    integrationTestDragHelper.style.top =
      parseInt(this.playBoundary.style.left) / 2 + "px";
    integrationTestDragHelper.style.width = "100px";
    integrationTestDragHelper.style.height = "100px";
  }

  updateSolvedCanvas() {
    const solvedPieces = this.pieceInstances.filter(
      (instance) => instance.isSolved
    );
    console.log("updateSolvedCanvas with solved pieces", solvedPieces);
    CanvasOperations.drawPiecesOntoCanvas(
      this.solvedCnv,
      solvedPieces,
      this.puzzleImage,
      this.shadowOffset
    );
  }

  removeGroupInstance(groupInstance) {
    this.groupInstances = this.groupInstances.filter(
      (instance) => instance._id !== groupInstance._id
    );
  }

  initiatePiece(pieceData) {
    const data = {
      ...pieceData,
      spritePath: this.spritePath,
    };
    const pieceInstance = new SingleMovable({
      puzzleData: this,
      pieceData: data,
    });

    this.pieceInstances.push(pieceInstance);
  }

  initiateGroup(event) {
    const pieces = event.detail;
    const groupInstance = new GroupMovable({
      puzzleData: this,
      pieces,
    });
    this.groupInstances.push(groupInstance);
  }

  onConnectionMade() {
    if (this.soundsEnabled) {
      this.clickSound.play();
    }
  }

  renderPieces(pieces) {
    pieces.forEach((piece) => this.initiatePiece.call(this, piece));
  }

  showPiece(el) {
    el.style.display = "block";
  }

  hidePiece(el) {
    el.style.display = "none";
  }

  setupSolvingArea() {
    const playBoundaryWidth =
      window.innerWidth > window.innerHeight
        ? window.innerHeight
        : window.innerWidth;
    const playBoundaryHeight =
      window.innerHeight > window.innerWidth
        ? window.innerWidth
        : window.innerHeight;

    this.playBoundary.style.width = Utils.getPxString(playBoundaryWidth);
    this.playBoundary.style.height = Utils.getPxString(playBoundaryHeight);

    this.solvingArea.style.width = Utils.getPxString(this.boardSize);
    this.solvingArea.style.height = Utils.getPxString(this.boardSize);
    this.solvingArea.style.top = Utils.getPxString(
      playBoundaryHeight / 2 - this.solvingArea.offsetHeight / 2
    );
    this.solvingArea.style.left = Utils.getPxString(
      playBoundaryWidth / 2 - this.solvingArea.offsetWidth / 2
    );

    const solvedCnvContainer = document.getElementById(
      `group-container-${this.solvedGroupId}`
    );
    solvedCnvContainer.style.pointerEvents = "none";
    solvedCnvContainer.style.top = Utils.getPxString(this.boardTop);
    solvedCnvContainer.style.left = Utils.getPxString(this.boardLeft);
    solvedCnvContainer.style.width = Utils.getPxString(
      this.boardWidth + this.shadowOffset
    );
    solvedCnvContainer.style.height = Utils.getPxString(
      this.boardHeight + this.shadowOffset
    );

    this.solvedCnv = document.getElementById(
      `group-canvas-${this.solvedGroupId}`
    );
    // solvedCnv.style.pointerEvents = 'none';
    const solvingAreaBox = Utils.getStyleBoundingBox(this.solvingArea);
    this.solvedCnv.width = solvingAreaBox.width + this.shadowOffset;
    this.solvedCnv.height = solvingAreaBox.height + this.shadowOffset;
    this.solvedCnv.style.width = Utils.getPxString(
      solvingAreaBox.width + this.shadowOffset
    );
    this.solvedCnv.style.height = Utils.getPxString(
      solvingAreaBox.height + this.shadowOffset
    );
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

  keepOnTop(el) {
    el.style.zIndex = this.currentZIndex = this.currentZIndex + 1;
  }

  loadAssets(assets) {}

  loadAsset(asset) {
    return new Promise((resolve, reject) => {
      asset.onload = (asset) => {
        resolve(asset);
      };
      asset.onerror = (err) => {
        reject(err);
      };
    });
  }
}