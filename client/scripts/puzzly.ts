import SingleMovable from "./SingleMovable.js";
import GroupMovable from "./GroupMovable.js";
import Pockets from "./pockets.js";
import DragAndSelect from "./dragAndSelect.js";
import Utils from "./utils.js";
import { ELEMENT_IDS, EVENT_TYPES } from "./constants.js";
import { PocketMovable } from "./PocketMovable.js";
import PersistenceOperations from "./persistence.js";
import CanvasOperations from "./canvasOperations.js";
import Zoom from "./zoom.js";
import PlayBoundaryMovable from "./PlayBoundaryMovable.js";
import SolvedPuzzlePreview from "./SolvedPuzzlePreview.js";
import {
  PuzzleCreationResponse,
  PuzzleShapes,
  SolvedPuzzlePreviewType,
} from "./types.js";
import PieceLayouts from "./PieceLayouts.js";
/**
 * Puzzly
 *
 */

export default class Puzzly {
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

    this.pieces = config.pieces;
    this.connectorSize = config.connectorSize;

    this.complete = config.complete;

    this.animationDuration = 200;

    this.puzzleId = puzzleId;
    this.movingPiece = null;

    this.dragAndSelectActive = false;

    this.highlightConnectingPieces =
      config.debugOptions.highlightConnectingPieces;
    this.noDispersal = config.debugOptions.noDispersal;

    this.currentZIndex = config.zIndex || 3;

    this.usedPieceSectors = [];
    this.sectors = {};

    this.solvedGroupId = 1111;

    this.isMovingSinglePiece = false;
    this.movingElement = null;
    this.puzzleId = puzzleId;
    this.progress = config.pieces || [];

    this.innerPiecesVisible =
      config.innerPiecesVisible !== undefined
        ? config.innerPiecesVisible
        : true;
    this.movingPieces = [];
    this.loadedAssets = [];
    this.previewImage = new Image();
    this.previewImage.src = this.puzzleImagePath;
    this.puzzleImage = new Image();
    this.puzzleImage.src = this.spritePath;
    console.log(this);

    this.previewImageType = SolvedPuzzlePreviewType.AlwaysOn;

    this.stage = document.querySelector(`#${ELEMENT_IDS.STAGE}`);
    this.playBoundary = document.querySelector(`#${ELEMENT_IDS.PLAY_BOUNDARY}`);
    this.solvingArea = document.querySelector(
      `#${ELEMENT_IDS.SOLVED_PUZZLE_AREA}`
    );
    this.piecesContainer = document.querySelector(
      `#${ELEMENT_IDS.PIECES_CONTAINER}`
    );

    this.interactionEventDown = "mousedown";
    this.interactionEventUp = "mouseup";
    this.interactionEventMove = "mousemove";

    this.clickSound = new Audio("./mixkit-plastic-bubble-click-1124.wav");

    this.filterBtn = document.getElementById("filter-pieces");
    this.filterBtnOffLabel = document.getElementById("inner-pieces-on");
    this.filterBtnOnLabel = document.getElementById("inner-pieces-off");

    this.soundsBtn = document.getElementById("sound-toggle");
    this.soundsBtnOnLabel = document.getElementById("sounds-on");
    this.soundsBtnOffLabel = document.getElementById("sounds-off");
    this.debugInfoWindow = document.getElementById("debug-info");

    if (this.innerPiecesVisible) {
      this.filterBtnOnLabel.style.display = "block";
      this.filterBtnOffLabel.style.display = "none";
    } else {
      this.filterBtnOffLabel.style.display = "block";
      this.filterBtnOnLabel.style.display = "none";
    }

    this.soundsEnabled = true;
    this.soundsBtnOnLabel.style.display = "none";

    this.filterBtn.addEventListener(
      this.interactionEventDown,
      this.toggleInnerPieces.bind(this)
    );
    this.soundsBtn.addEventListener(
      this.interactionEventDown,
      this.toggleSounds.bind(this)
    );

    const assets = [this.previewImage, this.puzzleImage];

    this.loadAssets(assets).then(() => {
      this.init(this);
    });

    return this;
  }

  init(puzzly) {
    this.zoomLevel = 1;

    this.shadowOffsetRatio = 0.025;
    this.shadowOffset = this.pieceSize * this.shadowOffsetRatio;

    this.connectorToleranceAmount = 40;
    this.connectorTolerance =
      (this.connectorSize / 100) * ((100 - this.connectorToleranceAmount) / 2);

    this.floatToleranceAmount = 20;
    this.floatTolerance = (this.pieceSize / 100) * this.floatToleranceAmount;
    this.collisionBoxWidth = this.pieceSize - this.floatTolerance;

    this.largestPieceSpan = this.pieceSize + this.connectorSize * 2;
    this.pieceSeparationDistance = this.largestPieceSpan + 20;

    this.playBoundary = document.querySelector("#play-boundary");

    this.setupSolvingArea();

    const solvingAreaBoundingBox = this.solvingArea.getBoundingClientRect();

    this.boardWidth = solvingAreaBoundingBox.width;
    this.boardHeight = solvingAreaBoundingBox.height;

    this.isFullImageViewerActive = false;

    this.Pockets = new Pockets(puzzly);
    this.DragAndSelect = new DragAndSelect(puzzly);
    this.SolvedPuzzlePreview = new SolvedPuzzlePreview(this.previewImageType);
    this.PocketMovable = new PocketMovable(puzzly);
    this.PieceLayouts = new PieceLayouts(puzzly);
    this.PersistenceOperations = new PersistenceOperations(puzzly);

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
      function (e) {
        this.updateElapsedTime();
      }.bind(this)
    );

    this.innerPieces = document.querySelectorAll(".inner-piece");

    const newPuzzleBtn = document.getElementById("js-create-new-puzzle");
    newPuzzleBtn.addEventListener(this.interactionEventDown, () => {
      window.location = "/";
    });

    window.addEventListener(EVENT_TYPES.DRAGANDSELECT_ACTIVE, (e) => {
      this.dragAndSelectActive = e.detail;
    });

    window.addEventListener(
      EVENT_TYPES.CONNECTION_MADE,
      this.onConnectionMade.bind(this)
    );

    this.Zoom = new Zoom(this);
    new PlayBoundaryMovable(this);

    this.stage.classList.add("loaded");
    Events.notify(EVENT_TYPES.PUZZLE_LOADED, this);

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

  toggleSounds() {
    this.soundsEnabled = this.soundsEnabled ? false : true;
    this.soundsBtnOffLabel.style.display = this.soundsEnabled
      ? "block"
      : "none";
    this.soundsBtnOnLabel.style.display = this.soundsEnabled ? "none" : "block";
  }

  showPiece(el) {
    el.style.display = "block";
  }

  hidePiece(el) {
    el.style.display = "none";
  }

  toggleInnerPieces() {
    if (this.innerPiecesVisible) {
      this.allPieces().forEach((piece) => {
        const p = this.getPieceFromElement(piece, [
          "jigsaw-type",
          "is-solved",
          "group",
        ]);
        if (Utils.isInnerPiece(p.type) && !p.isSolved && !p.group) {
          this.hidePiece(piece);
        }
      });
      this.innerPiecesVisible = false;
      this.filterBtnOffLabel.style.display = "block";
      this.filterBtnOnLabel.style.display = "none";
    } else {
      this.allPieces().forEach((piece) => {
        const p = this.getPieceFromElement(piece, ["jigsaw-type"]);
        if (Utils.isInnerPiece(p.type)) {
          this.showPiece(piece);
        }
      });
      this.innerPiecesVisible = true;
      this.filterBtnOffLabel.style.display = "none";
      this.filterBtnOnLabel.style.display = "block";
    }
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

  loadAssets(assets) {
    let promises = [];
    for (let i = 0, l = assets.length; i < l; i++) {
      promises.push(
        this.loadAsset(assets[i]).then((assetData) =>
          this.loadedAssets.push(assetData)
        )
      );
    }

    return Promise.all(promises);
  }

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
