import Pockets from "./pockets.js";
import DragAndSelect from "./dragAndSelect.js";
import Utils from "./utils.js";
import Events from "./events.js";
import { ELEMENT_IDS, EVENT_TYPES, SIDES } from "./constants.js";
import { SingleMovable } from "./SingleMovable.js";
import GroupMovable from "./GroupMovable.js";
import { PocketMovable } from "./PocketMovable.js";
import { DragAndSelectMovable } from "./DragAndSelectMovable.js";
import { checkConnections } from "./checkConnections.js";
import GroupOperations from "./GroupOperations.js";
import PersistenceOperations from "./persistence.js";
import BaseMovable from "./BaseMovable.js";

/**
 * Puzzly
 *
 */

const ZOOM_INTERVAL = 0.1;
const INITIAL_ZOOM_LEVEL = 1;

class Puzzly {
  constructor(canvasId, puzzleId, config) {
    Object.assign(this, {
      ...config,
      debug: true,
      showDebugInfo: false,
      jigsawSpriteConnectorSize: 42,
      jigsawSpriteConnectorDistanceFromCorner: 43,
      piecesPerSideHorizontal:
        config.selectedShape === "Rectangle"
          ? config.piecesPerSideHorizontal
          : Math.sqrt(config.selectedNumPieces),
      piecesPerSideVertical:
        config.selectedShape === "Rectangle"
          ? config.piecesPerSideVertical
          : Math.sqrt(config.selectedNumPieces),
      drawOutlines: config.drawOutlines || false,
      drawSquares: false,
    });

    this.pieces = config.pieces;
    this.connectorSize = config.connectorSize;

    this.animationDuration = 200;

    this.puzzleId = puzzleId;
    this.movingPiece = null;

    this.dragAndSelectActive = false;

    this.highlightConnectingPieces =
      config.debugOptions.highlightConnectingPieces;
    this.noDispersal = config.debugOptions.noDispersal;

    this.currentZIndex = 3;

    this.pieceSectors = [];
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

    this.previewImageAlwaysOn = true;

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

    this.ControlsEl = document.getElementById("controls");
    this.ControlsEl.style.display = "block";

    this.fullImageViewerEl = document.getElementById("solved-preview");
    this.previewBtn = document.getElementById("preview");
    this.previewBtnShowLabel = document.getElementById("preview-show");
    this.previewBtnHideLabel = document.getElementById("preview-hide");

    this.filterBtn = document.getElementById("filter-pieces");
    this.filterBtnOffLabel = document.getElementById("inner-pieces-on");
    this.filterBtnOnLabel = document.getElementById("inner-pieces-off");

    this.soundsBtn = document.getElementById("sound-toggle");
    this.soundsBtnOnLabel = document.getElementById("sounds-on");
    this.soundsBtnOffLabel = document.getElementById("sounds-off");
    this.debugInfoWindow = document.getElementById("debug-info");

    this.sendToEdgeShuffleBtn = document.getElementById("shuffle-pieces");
    this.sendToEdgeNeatenBtn = document.getElementById("neaten-pieces");
    this.gatherPiecesBtn = document.getElementById("gather-pieces");

    this.ControlsElHandle = document.getElementById("controls-handle");
    this.ControlsElPanel = document.getElementById("controls-panel");
    this.ControlsElPanelIsOpen = false;

    this.ControlsElHandle.addEventListener(
      this.interactionEventDown,
      this.onControlsHandleClick.bind(this)
    );

    this.sendToEdgeShuffleBtn.addEventListener(
      this.interactionEventDown,
      (e) => {
        this.randomisePiecePositions();
        this.onControlsHandleClick();
      }
    );

    this.sendToEdgeNeatenBtn.addEventListener(
      this.interactionEventDown,
      (e) => {
        this.arrangePieces();
        this.onControlsHandleClick();
      }
    );

    window.addEventListener("resize", this.setPlayBoundaryPosition.bind(this));

    if (this.innerPiecesVisible) {
      this.filterBtnOnLabel.style.display = "block";
      this.filterBtnOffLabel.style.display = "none";
    } else {
      this.filterBtnOffLabel.style.display = "block";
      this.filterBtnOnLabel.style.display = "none";
    }

    this.soundsEnabled = true;
    this.soundsBtnOnLabel.style.display = "none";
    this.isPreviewActive = false;

    if (this.imagePreviewType === "alwaysOn") {
      this.previewBtn.style.display = "none";
    } else {
      this.previewBtn.addEventListener(
        this.interactionEventDown,
        this.togglePreviewer.bind(this)
      );
    }

    this.filterBtn.addEventListener(
      this.interactionEventDown,
      this.toggleInnerPieces.bind(this)
    );
    this.soundsBtn.addEventListener(
      this.interactionEventDown,
      this.toggleSounds.bind(this)
    );
    this.gatherPiecesBtn.addEventListener(
      this.interactionEventDown,
      this.gatherPieces.bind(this)
    );

    const assets = [this.previewImage, this.puzzleImage];

    this.loadAssets(assets).then(() => {
      this.init();
    });

    return this;
  }

  init() {
    this.zoomLevel = 1;

    this.shadowOffsetRatio = 0.01;
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
    this.setupFullImagePreviewer();

    const solvingAreaBoundingBox = this.solvingArea.getBoundingClientRect();

    this.boardWidth = solvingAreaBoundingBox.width;
    this.boardHeight = solvingAreaBoundingBox.height;

    this.isFullImageViewerActive = false;

    this.Pockets = new Pockets(this);
    this.DragAndSelect = new DragAndSelect(this);

    this.setPlayBoundaryPosition();
    this.resetPlayBoundaryPosition();
    this.generatePieceSectorMap();

    this.PocketMovable = new PocketMovable(this);
    this.DragAndSelectMovable = new DragAndSelectMovable(this);
    this.PersistenceOperations = new PersistenceOperations(this);

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

      // console.log("groups from persistence", this.groups);
      if (Object.keys(this.groups).length) {
        for (let g in this.groups) {
          const group = this.groups[g];
          // console.log("group data", group);
          const pieceInstances = this.pieceInstances.filter((pieceInstance) => {
            // console.log("piece data", pieceInstance.pieceData);
            // console.log("ids", pieceInstance.pieceData.groupId, group._id);
            return pieceInstance.pieceData.groupId === group._id;
          });
          // console.log("piece instances found for group", pieceInstances);
          const groupInstance = new GroupMovable({
            puzzleData: this,
            _id: group._id,
            pieces: pieceInstances,
            position: group.position,
          });
          this.groupInstances.push(groupInstance);
          // console.log("group instances", this.groupInstances);
        }
      }

      // this.initGroupContainerPositions(storage.pieces);
    } else {
      this.piecePositionMap = this.shuffleArray(
        this.getRandomCoordsFromSectorMap()
      );
      // console.log("pieces", this.pieces);
      this.renderPieces(this.pieces);
      if (!this.noDispersal) {
        this.arrangePieces();
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

    // window.addEventListener(
    //   this.interactionEventDown,
    //   this.onMouseDown.bind(this)
    // );

    const newPuzzleBtn = document.getElementById("js-create-new-puzzle");
    newPuzzleBtn.addEventListener(this.interactionEventDown, () => {
      window.location = "/";
    });

    // window.addEventListener(this.interactionEventUp, this.onMouseUp.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener(EVENT_TYPES.RETURN_TO_CANVAS, (e) => {
      this.handleDrop(e.detail);
    });

    window.addEventListener(EVENT_TYPES.DRAGANDSELECT_ACTIVE, (e) => {
      this.dragAndSelectActive = e.detail;
    });

    window.addEventListener(
      EVENT_TYPES.CONNECTION_MADE,
      this.onConnectionMade.bind(this)
    );

    Events.notify(EVENT_TYPES.PUZZLE_LOADED, this);
  }

  getMovableInstanceFromElement(element) {
    let movables;
    if (BaseMovable.isGroupedPiece(element)) {
      movables = this.groupInstances;
    } else {
      movables = this.pieceInstances;
    }
    return movables.find((instance) => instance.isElementOwned(element));
  }

  getGroupInstanceById(groupId) {
    return this.groupInstances.find((group) => group._id === groupId);
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

  onConnectionMade(event) {
    const connection = event.detail;
    if (this.soundsEnabled) {
      this.clickSound.play();
    }
  }

  setPlayBoundaryPosition() {
    const stageRect = this.stage.getBoundingClientRect();
    const playBoundaryRect = this.playBoundary.getBoundingClientRect();

    this.playBoundary.style.top = Utils.getPxString(
      stageRect.height / 2 - playBoundaryRect.height / 2
    );
    this.playBoundary.style.left = Utils.getPxString(
      stageRect.width / 2 - playBoundaryRect.width / 2
    );

    Events.notify(EVENT_TYPES.RESIZE);
  }

  resetPlayBoundaryPosition() {
    this.playBoundary.style.left = this.initialPlayBoundaryPositionLeft;
    this.playBoundary.style.top = Utils.getPxString(
      this.initialPlayBoundaryPositionTop
    );
  }

  onControlsHandleClick(e) {
    if (this.ControlsElPanelIsOpen) {
      this.ControlsElPanel.classList.add("is-hidden");
      this.ControlsElPanelIsOpen = false;
    } else {
      this.ControlsElPanel.classList.remove("is-hidden");
      this.ControlsElPanelIsOpen = true;
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

  togglePreviewer() {
    if (this.isPreviewActive) {
      this.fullImageViewerEl.style.display = "none";
      this.previewBtnShowLabel.style.display = "block";
      this.previewBtnHideLabel.style.display = "none";
      this.isPreviewActive = false;
    } else {
      this.fullImageViewerEl.style.display = "block";
      this.previewBtnShowLabel.style.display = "none";
      this.previewBtnHideLabel.style.display = "block";
      this.isPreviewActive = true;
    }
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
        if (Utils.isInnerPiece(p) && !p.isSolved && !p.group) {
          this.hidePiece(piece);
        }
      });
      this.innerPiecesVisible = false;
      this.filterBtnOffLabel.style.display = "block";
      this.filterBtnOnLabel.style.display = "none";
    } else {
      this.allPieces().forEach((piece) => {
        const p = this.getPieceFromElement(piece, ["jigsaw-type"]);
        if (Utils.isInnerPiece(p)) {
          this.showPiece(piece);
        }
      });
      this.innerPiecesVisible = true;
      this.filterBtnOffLabel.style.display = "none";
      this.filterBtnOnLabel.style.display = "block";
    }

    this.saveInnerPieceVisibility(this.innerPiecesVisible);
  }

  saveInnerPieceVisibility(visible) {
    fetch(`/api/toggleVisibility/${this.puzzleId}`, {
      method: "put",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify({ piecesVisible: visible }),
    });
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

    const solvedCnv = document.getElementById(
      `group-canvas-${this.solvedGroupId}`
    );
    // solvedCnv.style.pointerEvents = 'none';
    const solvingAreaBox = Utils.getStyleBoundingBox(this.solvingArea);
    solvedCnv.width = solvingAreaBox.width + this.shadowOffset;
    solvedCnv.height = solvingAreaBox.height + this.shadowOffset;
    solvedCnv.style.width = Utils.getPxString(
      solvingAreaBox.width + this.shadowOffset
    );
    solvedCnv.style.height = Utils.getPxString(
      solvingAreaBox.height + this.shadowOffset
    );
  }

  onKeyDown(event) {
    // https://stackoverflow.com/questions/995914/catch-browsers-zoom-event-in-javascript

    if (
      (event.ctrlKey || event.metaKey) &&
      (event.which === 61 ||
        event.which === 107 ||
        event.which === 173 ||
        event.which === 109 ||
        event.which === 187 ||
        event.which === 189 ||
        event.which === 48)
    ) {
      event.preventDefault();

      this.prevZoomLevel = this.zoomLevel;
      const canZoomOut = this.zoomLevel > this.INITIAL_ZOOM_LEVEL;

      // Plus key
      if (event.which === 187) {
        this.increaseZoomLevel(ZOOM_INTERVAL);
      }

      // Minus key
      if (event.which === 189 && canZoomOut) {
        this.decreaseZoomLevel(ZOOM_INTERVAL);
        if (ZOOM_INTERVAL === INITIAL_ZOOM_LEVEL) {
          this.resetPlayBoundaryPosition();
        }
      }

      // "0" Number key
      if (event.which === 48) {
        this.resetZoomLevel();
        this.resetPlayBoundaryPosition();
      }
    }
  }

  setInitialZoomLevel(zoomLevel) {
    this.INITIAL_ZOOM_LEVEL = zoomLevel;
    return this.INITIAL_ZOOM_LEVEL;
  }

  // Might want an observer of some kind for the scalePlayBoundary method calls here, instead of manually calling it in all of these helper methods.
  resetZoomLevel() {
    this.zoomLevel = this.INITIAL_ZOOM_LEVEL;
    this.scalePlayBoundary(this.zoomLevel);
  }

  setZoomLevel(zoomLevel) {
    this.zoomLevel = zoomLevel;
    this.scalePlayBoundary(this.zoomLevel);
  }

  increaseZoomLevel(increment) {
    this.zoomLevel += increment;
    this.scalePlayBoundary(this.zoomLevel);
  }

  decreaseZoomLevel(increment) {
    this.zoomLevel -= increment;
    this.scalePlayBoundary(this.zoomLevel);
  }

  scalePlayBoundary(scale) {
    this.playBoundary.style.transform = `scale(${scale})`;

    if (this.zoomLevel !== this.prevZoomLevel) {
      // this.Pockets.setScale(this.zoomLevel);
      // this.DragAndSelect.setScale(this.zoomLevel);
      Events.notify(EVENT_TYPES.CHANGE_SCALE, this.zoomLevel);
    }

    if (this.isPreviewActive) {
      this.updatePreviewerSizeAndPosition();
    }
  }

  gatherPieces() {
    const pieces = this.allPieces();
    Events.notify(EVENT_TYPES.ADD_TO_POCKET, pieces);
  }

  getRandomCoordsFromSectorMap() {
    return this.pieceSectors.map((s) => ({
      x: Utils.getRandomInt(s.x, s.x + s.w),
      y: Utils.getRandomInt(s.y, s.y + s.h),
    }));
  }

  getSequentialArray(start, end, shuffle = false) {
    let arr = [];
    for (let i = start, l = end - start; i < l; i++) {
      arr.push(i);
    }

    if (shuffle) {
      arr = this.shuffleArray(arr);
    }

    return arr;
  }

  animatePiece(el, x, y) {
    el.keyframes = {
      top: Utils.getPxString(y),
      left: Utils.getPxString(x),
    };

    el.animProps = {
      duration: 300,
      easing: "ease-out",
      iterations: 1,
    };

    var animationPlayer = el.animate(el.keyframes, el.animProps);
    animationPlayer.onfinish = () => {
      el.style.top = Utils.getPxString(y);
      el.style.left = Utils.getPxString(x);
    };
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

  renderJigsawPiece(piece) {
    console.log("rendering piece", piece);
    let el, fgEl, bgEl;

    const solvedCnvContainer = document.getElementById(
      `group-container-${this.solvedGroupId}`
    );

    el = document.createElement("div");
    el.classList.add("puzzle-piece");
    el.id = "piece-" + piece.id;

    el.style.position = "absolute";
    el.width = piece.imgW;
    el.height = piece.imgH;
    el.style.width = piece.imgW + "px";
    el.style.height = piece.imgH + "px";

    if (piece.pocketId === undefined || piece.pocketId === null) {
      el.style.top = (!!piece.group ? piece.solvedY : piece.pageY) + "px";
      el.style.left = (!!piece.group ? piece.solvedX : piece.pageX) + "px";
    }
    el.style.pointerEvents = "auto";
    el.style.zIndex = 1;

    el.setAttribute("data-jigsaw-type", piece.type.join(","));
    el.setAttribute("data-piece-id", piece.id);
    el.setAttribute("data-piece-id-in-persistence", piece._id);
    el.setAttribute("data-puzzle-id", piece.puzzleId);
    el.setAttribute("data-imgX", piece.imgX);
    el.setAttribute("data-imgy", piece.imgY);
    el.setAttribute("data-solvedX", piece.solvedX);
    el.setAttribute("data-solvedY", piece.solvedY);
    el.setAttribute("data-pageX", piece.pageX);
    el.setAttribute("data-pageY", piece.pageY);
    el.setAttribute("data-spriteX", piece.spriteX);
    el.setAttribute("data-spriteY", piece.spriteY);
    el.setAttribute("data-spriteshadowx", piece.spriteShadowX);
    el.setAttribute("data-spriteshadowy", piece.spriteShadowY);
    el.setAttribute("data-imgW", piece.imgW);
    el.setAttribute("data-imgH", piece.imgH);
    el.setAttribute("data-is-inner-piece", piece.isInnerPiece);
    el.setAttribute(
      "data-connects-to",
      JSON.stringify(this.getConnectingPieceIds(el))
    );
    el.setAttribute("data-connections", GroupOperations.getConnections(el));
    el.setAttribute(
      "data-num-pieces-from-top-edge",
      piece.numPiecesFromTopEdge
    );
    el.setAttribute(
      "data-num-pieces-from-left-edge",
      piece.numPiecesFromLeftEdge
    );
    el.setAttribute("data-is-solved", piece.isSolved);

    fgEl = document.createElement("div");
    fgEl.classList.add("puzzle-piece-fg");
    fgEl.style.backgroundImage = `url(${this.spritePath}`;
    fgEl.style.backgroundPositionX =
      piece.spriteX === 0 ? 0 : "-" + piece.spriteX + "px";
    fgEl.style.backgroundPositionY =
      piece.spriteY === 0 ? 0 : "-" + piece.spriteY + "px";
    fgEl.style.position = "absolute";
    fgEl.width = piece.imgW;
    fgEl.height = piece.imgH;
    fgEl.style.width = piece.imgW + "px";
    fgEl.style.height = piece.imgH + "px";
    fgEl.style.top = 0;
    fgEl.style.left = 0;
    fgEl.style.zIndex = 2;
    // fgEl.style.pointerEvents = "none";

    bgEl = document.createElement("div");
    bgEl.classList.add("puzzle-piece-bg");
    bgEl.style.position = "absolute";
    bgEl.width = piece.imgW;
    bgEl.height = piece.imgH;
    bgEl.style.width = piece.imgW + "px";
    bgEl.style.height = piece.imgH + "px";
    bgEl.style.top = this.shadowOffset + "px";
    bgEl.style.left = this.shadowOffset + "px";
    bgEl.style.backgroundImage = `url(${this.spritePath}`;
    bgEl.style.backgroundPositionX =
      piece.spriteShadowX === 0 ? 0 : "-" + piece.spriteShadowX + "px";
    bgEl.style.backgroundPositionY =
      piece.spriteShadowY === 0 ? 0 : "-" + piece.spriteShadowY + "px";
    bgEl.style.zIndex = 1;
    // bgEl.style.pointerEvents = "none";

    el.appendChild(fgEl);
    el.appendChild(bgEl);

    if (!!piece.group) {
      el.setAttribute("data-group", piece.group);
      el.classList.add("grouped");
    }

    if (piece.pocketId) {
      el.setAttribute("data-pocket-id", piece.pocketId);
    }

    if (Number.isInteger(piece.pocketId)) {
      this.Pockets.addToPocket(piece.pocketId, el);
    } else if (!GroupOperations.hasGroup(piece) && !piece.isSolved) {
      this.addToPlayBoundary(el);
    } else {
      if (piece.isSolved === undefined) {
        let groupContainer = document.querySelector(
          `#group-container-${piece.group}`
        );

        if (!groupContainer) {
          groupContainer = document.createElement("div");
          groupContainer.classList.add("group-container");
          groupContainer.dataset.groupId = piece.group;
          groupContainer.style.pointerEvents = "none";
          groupContainer.setAttribute("id", `group-container-${piece.group}`);
          groupContainer.style.width = Utils.getPxString(this.boardSize);
          groupContainer.style.height = Utils.getPxString(this.boardSize);
          groupContainer.style.position = "absolute";
          groupContainer.style.top = piece.containerY + "px";
          groupContainer.style.left = piece.containerX + "px";
          this.addToPlayBoundary(groupContainer);
        }

        groupContainer.appendChild(el);

        let groupCanvas = groupContainer.querySelector(
          `#group-canvas-${piece.group}`
        );
        if (!groupCanvas) {
          groupCanvas = document.createElement("canvas");
          groupCanvas.id = `group-canvas-${piece.group}`;
          groupCanvas.style.pointerEvents = "none";
          groupCanvas.classList.add("group-canvas");
          groupCanvas.width = this.boardSize + this.shadowOffset;
          groupCanvas.height = this.boardSize + this.shadowOffset;
          groupCanvas.style.width = Utils.getPxString(
            this.boardSize + this.shadowOffset
          );
          groupCanvas.style.height = Utils.getPxString(
            this.boardSize + this.shadowOffset
          );
          groupContainer.appendChild(groupCanvas);
        }

        if (
          piece.isSolved &&
          !this.getDataAttributeValue(groupContainer, "data-is-solved")
        ) {
          this.setElementAttribute(groupContainer, "data-is-solved", true);
        }
      } else {
        solvedCnvContainer.append(el);
        el.dataset.isSolved = true;
      }
    }
  }

  addToPlayBoundary(piece) {
    this.piecesContainer.prepend(piece);
  }

  initGroupContainerPositions(piecesFromPersistence) {
    let groupContainers = document.querySelectorAll("[id^=group-container-]");
    groupContainers = Array.from(groupContainers).filter(
      (c) => c.id !== `group-container-${this.solvedGroupId}`
    );

    if (groupContainers.length > 0) {
      groupContainers.forEach((container) => {
        let id = parseInt(container.getAttribute("id").split("-")[2]);
        let piece = piecesFromPersistence.filter((p) => p.group === id)[0];

        container.style.top = Utils.getPxString(piece.containerY);
        container.style.left = Utils.getPxString(piece.containerX);
      });
    }
  }

  getType(el) {
    const attrValue = this.getDataAttributeValue(el, "jigsaw-type");
    return attrValue.split(",").map((n) => parseInt(n));
  }

  applyHighlightToConnectingPieces(connections) {
    for (let id in connections) {
      let el = Utils.getElementByPieceId(connections[id]);
      el.classList.add("js-highlight");
    }
  }

  removeHighlightFromConnectingPieces(connections) {
    for (let id in connections) {
      let el = Utils.getElementByPieceId(connections[id]);
      el.classList.remove("js-highlight");
    }
  }

  onMouseDown(e) {
    let element, thisPiece;
    e.preventDefault();

    if (e.which === 1) {
      const clientPos = {
        x: e.clientX,
        y: e.clientY,
      };

      const isPuzzlePiece = Utils.isPuzzlePiece(e.target);
      const isStage =
        e.target.id === ELEMENT_IDS.SOLVED_PUZZLE_AREA ||
        e.target.id === ELEMENT_IDS.PLAY_BOUNDARY ||
        e.target.dataset.groupId === this.solvedGroupId ||
        e.target.dataset.issolved;

      if (isPuzzlePiece) {
        element = Utils.getPuzzlePieceElementFromEvent(e);

        Events.notify(EVENT_TYPES.PIECE_PICKUP, {
          element,
          position: { top: e.clientY, left: e.clientX },
        });

        // Remember last position of moving element / moving group
        let elementBoundingBox;
        if (element.classList.contains("grouped")) {
          const container = getGroupContainer(element);
          elementBoundingBox = {
            y: container.offsetTop * this.zoomLevel,
            x: container.offsetLeft * this.zoomLevel,
          };

          this.lastPosition = elementBoundingBox;
        } else {
          elementBoundingBox = element.getBoundingClientRect();
          this.lastPosition = Utils.getPositionRelativeToContainer(
            elementBoundingBox,
            this.playBoundary.getBoundingClientRect(),
            this.zoomLevel
          );
        }
      }

      if (isStage && this.zoomLevel > INITIAL_ZOOM_LEVEL) {
        this.isMovingStage = true;
        element = this.playBoundary;
      }

      if (!element) {
        this.isMouseDown = false;
        return;
      } else {
        this.movingPiece = element;
      }

      thisPiece = Utils.getPieceFromElement(element);

      if (this.highlightConnectingPieces) {
        // TODO: FIX
        this.applyHighlightToConnectingPieces(JSON.parse(thisPiece.connectsTo));
      }

      if (thisPiece.isSolved) {
        return;
      }

      if (GroupOperations.hasGroup(thisPiece)) {
        const isGroupSolved = element.parentNode.dataset.isSolved === "true";
        if (isGroupSolved) {
          return;
        }

        this.isMovingSinglePiece = false;
        this.movingElement = getGroupTopContainer(element);
      } else {
        this.isMovingSinglePiece = true;
        this.movingElement = this.movingPiece = element;
      }

      if (isStage) {
        this.diffX = clientPos.x - this.movingElement.offsetLeft;
        this.diffY = clientPos.y - this.movingElement.offsetTop;
      } else {
        this.diffX =
          clientPos.x - this.movingElement.offsetLeft * this.zoomLevel;
        this.diffY =
          clientPos.y - this.movingElement.offsetTop * this.zoomLevel;
      }

      this.isMouseDown = true;

      // window.addEventListener(
      //   this.interactionEventMove,
      //   this.onMouseMove.bind(this)
      // );
    }
  }

  onMouseMove(e) {
    e.preventDefault();
    let eventX, eventY;

    if (this.movingElement) {
      eventX = e.clientX;
      eventY = e.clientY;

      if (!this.dragAndSelectActive) {
        if (this.isMovingStage) {
          const projectedPosition = {
            top: eventY - this.diffY,
            left: eventX - this.diffX,
          };
          const updatedPlayBoundaryPosition =
            this.getUpdatedPlayBoundaryPosition(
              this.playBoundary,
              projectedPosition
            );

          this.movingElement.style.left =
            updatedPlayBoundaryPosition.left + "px";
          this.movingElement.style.top = updatedPlayBoundaryPosition.top + "px";
        } else if (!this.movingElement.classList.contains("in-pocket")) {
          const newPosTop =
            eventY / this.zoomLevel - this.diffY / this.zoomLevel;
          const newPosLeft =
            eventX / this.zoomLevel - this.diffX / this.zoomLevel;
          this.movingElement.style.top = newPosTop + "px";
          this.movingElement.style.left = newPosLeft + "px";
        }
      }
    }
  }

  handleDrop(element) {
    if (!this.dragAndSelectActive) {
      const connection = checkConnections(element);

      if (connection) {
        const { targetEl } = connection;

        let connectionType =
          typeof connection == "string" ? connection : connection.type;
        const isSolvedConnection =
          Utils.isCornerConnection(connectionType) ||
          connectionType === "float";

        if (isSolvedConnection) {
          this.addToGroup(element, this.solvedGroupId);
        } else {
          this.group(element, targetEl);
        }

        Utils.updateConnections(element);

        if (this.shouldMarkAsSolved(element, connectionType)) {
          this.markAsSolved([element]);
          if (this.isPuzzleComplete()) {
            this.updateElapsedTime(true);
          }
        }

        if (this.getGroup(element)) {
          Events.notify(
            EVENT_TYPES.SAVE,
            Utils.getPiecesInGroup(Utils.getGroup(element))
          );
        }
      }

      Events.notify(EVENT_TYPES.SAVE, [element]);
    }
  }

  onMouseUp(e) {
    // console.log("onmouseup", e)

    if (this.isMovingStage) {
      Events.notify(EVENT_TYPES.RESIZE);
    }

    if (!this.isMouseDown || this.isMovingStage) return;

    const element = this.movingPiece;

    const elementBox = element.getBoundingClientRect();
    const playBoundaryBox = this.playBoundary.getBoundingClientRect();
    const eventBox = Utils.getEventBox(e);

    const dragContainer = Utils.getContainerFromEvent(e);

    if (dragContainer && Utils.isPocketDragContainer(dragContainer)) {
      // Dragging piece(s) out of pockets

      if (Utils.isOverPockets(eventBox)) {
        const pocket = this.Pockets.getPocketByCollision(eventBox);
        // Put pieces in pocket
        // Empty the current active pocket if we have one
        //salmon
        this.Pockets.reset();
        this.Pockets.addPiecesToPocket(pocket, dragContainer.childNodes);
      } else if (Utils.isOutOfBounds(dragContainer)) {
        // Reset pieces back to active pocket
        console.log("reset pieces back to pocket");

        this.Pockets.reset();
        this.Pockets.addPiecesToPocket(
          this.Pockets.activePocket,
          dragContainer.childNodes
        );
      } else {
        this.Pockets.returnToCanvas(dragContainer.childNodes);
      }
    }

    if (dragContainer && Utils.isDragAndSelectDragContainer(dragContainer)) {
      if (Utils.isOutOfBounds(dragContainer)) {
        this.resetPieceToLastPosition(dragContainer);
      }
      if (Utils.isOverPockets(dragContainer)) {
        this.Pockets.addPiecesToPocket(
          this.Pockets.activePocket,
          dragContainer.childNodes
        );
      }
    }

    if (Utils.isInside(elementBox, playBoundaryBox)) {
      // Mouse event is INSIDE play area

      const thisPiece = this.getPieceFromElement(element, ["connects-to"]);

      if (this.highlightConnectingPieces) {
        this.removeHighlightFromConnectingPieces(
          JSON.parse(thisPiece.connectsTo)
        );
      }

      let hasConnection = false;

      let group = getGroup(element);
      if (group) {
        const piecesToCheck = getCollisionCandidatesInGroup(group);

        const connection = piecesToCheck
          .map((p) => this.checkConnections(p))
          .filter((e) => e)[0];
        // console.log('connection', connection)

        if (connection) {
          let connectionType = connection.type || connection;

          if (this.soundsEnabled) {
            this.clickSound.play();
          }

          const isCornerConnection = Utils.isCornerConnection(connectionType);

          if (isCornerConnection || connectionType === "float") {
            addToGroup(connection.sourceEl, this.solvedGroupId);
          } else {
            group(connection.sourceEl, connection.targetEl);
          }

          const updatedGroup = getGroup(element);

          if (!isCornerConnection) {
            Utils.updateConnections(updatedGroup);
          }

          if (this.shouldMarkAsSolved(element, connectionType)) {
            const piecesInGroup = this.getPiecesInGroup(updatedGroup);
            this.markAsSolved(piecesInGroup);
            if (this.isPuzzleComplete()) {
              this.updateElapsedTime(true);
            }
          }

          hasConnection = true;
        }

        const piecesInCurrentGroup = this.getPiecesInGroup(group);
        const piecesInNewGroup = this.getPiecesInGroup(this.getGroup(element));

        if (hasConnection) {
          this.save(piecesInNewGroup);
        } else {
          this.save(piecesInCurrentGroup);
        }
      } else {
        // single piece
        if (Utils.isDragAndSelectDragContainer(dragContainer)) {
          this.Pockets.returnToCanvas(dragContainer.childNodes);
        } else {
          this.handleDrop(element);
        }
      }

      Events.notify(EVENT_TYPES.PIECE_DROP);
    } else {
      // outside play boundary
      if (dragContainer) {
        if (Utils.isPocketDragContainer(dragContainer)) {
          if (Utils.isOutOfBounds(dragContainer.getBoundingClientRect())) {
            this.resetPieceToLastPosition(dragContainer);
          }
        }
        if (Utils.isDragAndSelectDragContainer(dragContainer)) {
          if (Utils.isOutOfBounds(dragContainer.getBoundingClientRect())) {
            this.resetPieceToLastPosition(dragContainer);
          } else {
            const pocket = this.Pockets.getPocketByCollision(
              element.getBoundingClientRect()
            );
            this.Pockets.addPiecesToPocket(pocket, dragContainer.childNodes);
          }
        }
      }

      if (Utils.isOverPockets(element)) {
        const pocket = this.Pockets.getPocketByCollision(
          element.getBoundingClientRect()
        );
        this.Pockets.addToPocket(pocket, element);
      }
    }

    this.isMouseDown = false;
    this.movingElement = null;
    this.movingPiece = null;
    this.movingPieces = [];
    this.isMovingStage = false;

    window.removeEventListener(this.interactionEventMove, this.mouseMoveFunc);
    // window.removeEventListener(this.interactionEventUp, this.onMouseUp);
  }

  isViewportInsidePlayBoundary() {
    const box = this.playBoundary.getBoundingClientRect();
    const sbox = this.stage.getBoundingClientRect();
    return (
      box.top < sbox.top &&
      box.right > sbox.right &&
      box.bottom > sbox.bottom &&
      box.left < sbox.left
    );
  }

  getUpdatedPlayBoundaryPosition(element, projectedPosition) {
    const ebox = element.getBoundingClientRect();
    const sbox = this.stage.getBoundingClientRect();
    let top, left;
    if (this.zoomLevel > this.INITIAL_ZOOM_LEVEL) {
      top =
        ebox.top < sbox.top && projectedPosition.top > sbox.top
          ? sbox.top
          : projectedPosition.top;
      left =
        ebox.left < sbox.left && projectedPosition.left > sbox.left
          ? sbox.left
          : projectedPosition.left;
      return { top, left };
    } else {
      return false;
    }
  }

  resetPieceToLastPosition(element) {
    console.log("resetPieceToLastPosition");
    if (element.classList.contains("grouped")) {
      const container = getGroupContainer(element);
      container.style.top = this.lastPosition.y + "px";
      container.style.left = this.lastPosition.x + "px";
    } else {
      element.style.top = this.lastPosition.y + "px";
      element.style.left = this.lastPosition.x + "px";
    }
    Events.notify(EVENT_TYPES.CLEAR_BRIDGE);
  }

  getDataAttributeRaw(el, key) {
    // console.log('getDataAttributeRaw', el)
    return el.getAttribute(`data-${key}`) || undefined;
  }

  getDataAttributeValue(el, key) {
    const value = this.getDataAttributeRaw(el, key);
    return value && value !== "undefined" ? value : undefined;
  }

  keepOnTop(el) {
    console.log("keeping on top", el);
    el.style.zIndex = this.currentZIndex++;
  }

  getConnectingElement(el, connection) {
    const p = this.getPieceFromElement(el, ["piece-id"]);
    switch (connection) {
      case "right":
        return Utils.getElementByPieceId(p.id + 1);
      case "bottom":
        return Utils.getElementByPieceId(p.id + this.piecesPerSideHorizontal);
      case "left":
        return Utils.getElementByPieceId(p.id - 1);
      case "top":
        return Utils.getElementByPieceId(p.id - this.piecesPerSideHorizontal);
    }
  }

  getConnectingElements(el, asArray = false, unconnectedOnly = false) {
    const p = this.getPieceFromElement(el, ["piece-id", "connections"]);

    const arr = [];
    const obj = {};

    const rightPiece = p.id + 1;
    const bottomPiece = p.id + this.piecesPerSideHorizontal;
    const leftPiece = p.id - 1;
    const topPiece = p.id - this.piecesPerSideHorizontal;

    const right = Utils.getElementByPieceId(rightPiece);
    if (right) {
      if (
        (unconnectedOnly && !p.connections.includes("right")) ||
        !unconnectedOnly
      ) {
        arr.push(right);
        obj["right"] = right;
      }
    }
    const bottom = Utils.getElementByPieceId(bottomPiece);
    if (bottom) {
      if (
        (unconnectedOnly && !p.connections.includes("bottom")) ||
        !unconnectedOnly
      ) {
        arr.push(bottom);
        obj["bottom"] = bottom;
      }
    }
    const left = Utils.getElementByPieceId(leftPiece);
    if (left) {
      if (
        (unconnectedOnly && !p.connections.includes("left")) ||
        !unconnectedOnly
      ) {
        arr.push(left);
        obj["left"] = left;
      }
    }
    const top = Utils.getElementByPieceId(topPiece);
    if (top) {
      if (
        (unconnectedOnly && !p.connections.includes("top")) ||
        !unconnectedOnly
      ) {
        arr.push(top);
        obj["top"] = top;
      }
    }

    return asArray ? arr : obj;
  }

  setElementAttribute(el, attr, value) {
    el.setAttribute(attr, value);
  }

  // deprecated
  updatePiecePositionsByDiff(diff, pieces) {
    const pieceIDs = pieces.map((p) => p.id);
    this.pieces = this.pieces.map((p) => {
      if (pieceIDs.includes(p.id)) {
        const diffTopOperand = diff.top.charAt(0);
        const diffTopValue =
          diffTopOperand === "+"
            ? Math.ceil(parseFloat(diff.top.substr(1)))
            : Math.floor(parseFloat(diff.top.substr(1)));
        const diffLeftOperand = diff.left.charAt(0);
        const diffLeftValue =
          diffLeftOperand === "+"
            ? Math.ceil(parseFloat(diff.left.substr(1)))
            : Math.floor(parseFloat(diff.left.substr(1)));

        const element = Utils.getElementByPieceId(p.id);

        const newPosTop =
          diffTopOperand === "+"
            ? parseInt(element.style.top) + diffTopValue
            : parseInt(element.style.top) - diffTopValue;
        const newPosLeft =
          diffLeftOperand === "+"
            ? parseInt(element.style.left) + diffLeftValue
            : parseInt(element.style.left) - diffLeftValue;

        element.style.top = newPosTop + "px";
        element.style.left = newPosLeft + "px";
        element.style.zIndex = 10;

        return {
          ...p,
          pageY: newPosTop,
          pageX: newPosLeft,
        };
      }
      return p;
    });
  }

  isCornerConnection(str) {
    return (
      str === "top-left" ||
      str === "top-right" ||
      str === "bottom-right" ||
      str === "bottom-left"
    );
  }

  shouldMarkAsSolved(piece, connection) {
    const isCornerConnection = Utils.isCornerConnection(connection);
    const group = getGroup(piece);
    let check;

    if (group) {
      check = Array.from(this.getPiecesInGroup(group)).some((p) => {
        let piece = this.getPieceFromElement(p, ["jigsaw-type", "is-solved"]);
        return (
          piece.isSolved ||
          (Utils.isCornerPiece(piece) && connection === "float")
        );
      });
    } else {
      check = isGroupSolved(group);
    }
    return isCornerConnection || check;
  }

  markAsSolved(els) {
    let container;
    if (getGroup(els[0])) {
      container = getGroupTopContainer(els[0]);
      this.setElementAttribute(container, "data-is-solved", true);
      container.style.zIndex = 1;
    }
    els.forEach((piece) => {
      this.setElementAttribute(piece, "data-is-solved", true);
      piece.style.zIndex = 1;
    });
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

  getCompatiblePieces(pieceAbove, pieceBehind, pieces) {
    let pieceAboveHasPlug,
      pieceAboveHasSocket,
      pieceBehindHasPlug,
      pieceBehindHasSocket;

    if (pieceAbove) {
      pieceAboveHasSocket = Utils.has(pieceAbove.type, "socket", "bottom");
      pieceAboveHasPlug = Utils.has(pieceAbove.type, "plug", "bottom");
    }

    if (pieceBehind) {
      pieceBehindHasSocket = Utils.has(pieceBehind.type, "socket", "right");
      pieceBehindHasPlug = Utils.has(pieceBehind.type, "plug", "right");
    }

    let thisPieceHasLeftSocket,
      thisPieceHasLeftPlug,
      thisPieceHasTopSocket,
      thisPieceHasTopPlug;

    const candidatePieces = [];

    for (let i = 0, l = pieces.length; i < l; i++) {
      if (pieceAbove) {
        thisPieceHasTopSocket = Utils.has(pieces[i].type, "socket", "top");
        thisPieceHasTopPlug = Utils.has(pieces[i].type, "plug", "top");
      }

      if (pieceBehind) {
        thisPieceHasLeftSocket = Utils.has(pieces[i].type, "socket", "left");
        thisPieceHasLeftPlug = Utils.has(pieces[i].type, "plug", "left");
      }

      if (pieceAbove && !pieceBehind) {
        if (pieceAboveHasSocket && thisPieceHasTopPlug) {
          candidatePieces.push(pieces[i]);
        } else if (pieceAboveHasPlug && thisPieceHasTopSocket) {
          candidatePieces.push(pieces[i]);
        }
      }

      if (!pieceAbove && pieceBehind) {
        if (pieceBehindHasPlug && thisPieceHasLeftSocket) {
          candidatePieces.push(pieces[i]);
        } else if (pieceBehindHasSocket && thisPieceHasLeftPlug) {
          candidatePieces.push(pieces[i]);
        }
      }

      if (pieceAbove && pieceBehind) {
        if (
          pieceBehindHasSocket &&
          thisPieceHasLeftPlug &&
          pieceAboveHasPlug &&
          thisPieceHasTopSocket
        ) {
          candidatePieces.push(pieces[i]);
        } else if (
          pieceBehindHasPlug &&
          thisPieceHasLeftSocket &&
          pieceAboveHasSocket &&
          thisPieceHasTopPlug
        ) {
          candidatePieces.push(pieces[i]);
        } else if (
          pieceBehindHasSocket &&
          thisPieceHasLeftPlug &&
          pieceAboveHasSocket &&
          thisPieceHasTopPlug
        ) {
          candidatePieces.push(pieces[i]);
        } else if (
          pieceBehindHasPlug &&
          thisPieceHasLeftSocket &&
          pieceAboveHasPlug &&
          thisPieceHasTopSocket
        ) {
          candidatePieces.push(pieces[i]);
        }
      }
    }

    return candidatePieces;
  }

  getCandidatePieces(
    adjacentPieceBehind,
    adjacentPieceAbove,
    endOfRow,
    finalRow
  ) {
    let pieces = [];

    // Top left corner piece
    if (!adjacentPieceBehind && !adjacentPieceAbove) {
      return SpriteMap.filter((piece) => Utils.isTopLeftCorner(piece));
    }

    // First row pieces
    if (!adjacentPieceAbove) {
      pieces = SpriteMap.filter((o) => {
        if (endOfRow) {
          return Utils.isTopRightCorner(o);
        } else {
          return Utils.isTopSide(o);
        }
      });

      return this.getCompatiblePieces(false, adjacentPieceBehind, pieces);
    }
    // All pieces after top row
    else {
      // Last piece of each row, should be right side
      if (
        Utils.isTopRightCorner(adjacentPieceAbove) ||
        (!finalRow && Utils.isRightSide(adjacentPieceAbove))
      ) {
        pieces = SpriteMap.filter((o) => Utils.isRightSide(o));
        return this.getCompatiblePieces(
          adjacentPieceAbove,
          adjacentPieceBehind,
          pieces
        );
      }

      // First piece of each row, should be left side
      if (
        Utils.isTopLeftCorner(adjacentPieceAbove) ||
        (!finalRow && Utils.isLeftSide(adjacentPieceAbove))
      ) {
        pieces = SpriteMap.filter((o) => Utils.isLeftSide(o));
        return this.getCompatiblePieces(adjacentPieceAbove, null, pieces);
      }

      // All middle pieces
      if (
        (!finalRow && Utils.isInnerPiece(adjacentPieceAbove)) ||
        Utils.isTopSide(adjacentPieceAbove)
      ) {
        pieces = SpriteMap.filter((o) => Utils.isInnerPiece(o));
        return this.getCompatiblePieces(
          adjacentPieceAbove,
          adjacentPieceBehind,
          pieces
        );
      }

      if (finalRow && Utils.isLeftSide(adjacentPieceAbove)) {
        pieces = SpriteMap.filter((o) => Utils.isBottomLeftCorner(o));
        return this.getCompatiblePieces(adjacentPieceAbove, null, pieces);
      }

      if (
        finalRow &&
        Utils.isInnerPiece(adjacentPieceAbove) &&
        (Utils.isBottomLeftCorner(adjacentPieceBehind) ||
          Utils.isBottomSide(adjacentPieceBehind))
      ) {
        pieces = SpriteMap.filter((o) => Utils.isBottomSide(o));
        return this.getCompatiblePieces(
          adjacentPieceAbove,
          adjacentPieceBehind,
          pieces
        );
      }

      // Very last piece, should be corner bottom right
      if (
        Utils.isRightSide(adjacentPieceAbove) &&
        Utils.isBottomSide(adjacentPieceBehind)
      ) {
        pieces = SpriteMap.filter((o) => Utils.isBottomRightCorner(o));
        return this.getCompatiblePieces(
          adjacentPieceAbove,
          adjacentPieceBehind,
          pieces
        );
      }
    }
  }

  getSectorBoundingBox(sector) {
    const sectors = [
      "top-first-half",
      "top-second-half",
      "top-right",
      "right-first-half",
      "right-second-half",
      "bottom-right",
      "bottom-first-half",
      "bottom-second-half",
      "bottom-left",
      "left-first-half",
      "left-second-half",
      "top-left",
    ];
    const chosen = sectors[sector];
    switch (chosen) {
      case "top-first-half":
        return {
          top: 0,
          right: this.boardBoundingBox.width / 2,
          bottom: this.boardLeft,
          left: this.boardLeft,
        };
      case "top-second-half":
        return {
          top: 0,
          right: this.boardBoundingBox.right,
          bottom: this.boardLeft,
          left: this.boardLeft + this.boardBoundingBox.width / 2,
        };
      case "top-left":
        return {
          top: 0,
          right: this.boardLeft,
          bottom: this.boardLeft,
          left: 0,
        };
      case "right-first-half":
        return {
          top: this.boardLeft,
          right: this.playBoundaryWidth,
          bottom: this.boardLeft + this.boardBoundingBox.height / 2,
          left: this.boardBoundingBox.right,
        };
      case "right-second-half":
        return {
          top: this.boardLeft + this.boardBoundingBox.height / 2,
          right: this.playBoundaryWidth,
          bottom: this.boardBoundingBox.bottom,
          left: this.boardBoundingBox.right,
        };
      case "top-right":
        return {
          top: 0,
          right: this.playBoundaryWidth,
          bottom: this.boardLeft,
          left: this.boardBoundingBox.right,
        };
      case "bottom-first-half":
        return {
          top: this.boardBoundingBox.bottom,
          right: this.boardBoundingBox.right,
          bottom: this.playBoundaryHeight,
          left: this.boardBoundingBox.left + this.boardBoundingBox.width / 2,
        };
      case "bottom-second-half":
        return {
          top: this.boardBoundingBox.bottom,
          right: this.boardBoundingBox.left + this.boardBoundingBox.width / 2,
          bottom: this.playBoundaryHeight,
          left: this.boardBoundingBox.left,
        };
      case "bottom-right":
        return {
          top: this.boardBoundingBox.bottom,
          right: this.playBoundaryWidth,
          bottom: this.playBoundaryHeight,
          left: this.boardBoundingBox.right,
        };
      case "left-first-half":
        return {
          top: this.boardLeft + this.boardBoundingBox.height / 2,
          right: this.boardBoundingBox.left,
          bottom: this.boardBoundingBox.bottom,
          left: 0,
        };
      case "left-second-half":
        return {
          top: this.boardLeft,
          right: this.boardBoundingBox.left,
          bottom: this.boardBoundingBox.top + this.boardBoundingBox.height / 2,
          left: 0,
        };
      case "bottom-left":
        return {
          top: this.boardBoundingBox.bottom,
          right: this.boardBoundingBox.left,
          bottom: this.playBoundaryHeight,
          left: 0,
        };
    }
  }

  // Generate map of sectors that can be used for even dispersal of pieces around outside of puzzle board
  generatePieceSectorMap() {
    const box = Utils.getStyleBoundingBox(this.playBoundary);
    const totalArea = box.width * box.height;
    const pieceSectorSize = totalArea / this.selectedNumPieces;

    const sqr = Math.abs(Math.sqrt(pieceSectorSize));
    const area = { w: sqr, h: sqr };

    let currX = 0,
      currY = 0;

    for (let i = 0, l = this.selectedNumPieces; i < l; i++) {
      this.pieceSectors[i] = {
        x: currX,
        y: currY,
        ...area,
      };

      if (currX + sqr + sqr < box.width) {
        currX += sqr;
      } else {
        currX = 0;
        currY += sqr;
      }
    }
  }

  // Determine when arrangePieces() should start placing pieces on next side
  shouldProceedToNextSide(currentSide, element, firstPieceOnNextSide) {
    // console.log("shouldProceedToNextSide()", currentSide, element, firstPieceOnNextSide)
    let targetBox;

    targetBox = firstPieceOnNextSide
      ? Utils.getStyleBoundingBox(firstPieceOnNextSide)
      : Utils.getStyleBoundingBox(this.solvingArea);

    const box = Utils.getStyleBoundingBox(element);

    switch (currentSide) {
      case SIDES.TOP:
        return (
          box.left > targetBox.right ||
          box.right - this.connectorSize > targetBox.right
        );
      case SIDES.RIGHT:
        return (
          box.top > targetBox.bottom ||
          box.bottom - this.connectorSize > targetBox.bottom
        );
      case SIDES.BOTTOM:
        return (
          box.right < targetBox.left ||
          box.left + this.connectorSize < targetBox.left
        );
      case SIDES.LEFT:
        return (
          box.bottom < targetBox.top - this.largestPieceSpan ||
          box.top + this.connectorSize < targetBox.top
        );
    }
  }

  // Each time we start the next side, determine where the first piece should go
  getPositionForFirstPieceOnNextSide(
    element,
    nextElement,
    currentSide,
    firstPieceOnNextSideFromPreviousIteration,
    spacing
  ) {
    const targetBox = firstPieceOnNextSideFromPreviousIteration
      ? Utils.getStyleBoundingBox(firstPieceOnNextSideFromPreviousIteration)
      : Utils.getStyleBoundingBox(this.solvingArea);

    const box = Utils.getStyleBoundingBox(element);
    const nextElementBox = nextElement
      ? Utils.getStyleBoundingBox(nextElement)
      : null;

    switch (currentSide) {
      case SIDES.TOP:
        return {
          x: targetBox.right + spacing,
          y: box.bottom + spacing,
        };
      case SIDES.RIGHT:
        return {
          x: box.left - nextElementBox?.width - spacing,
          y: targetBox.bottom + spacing,
        };
      case SIDES.BOTTOM:
        return {
          x: targetBox.left - this.largestPieceSpan - spacing,
          y: box.top - nextElementBox?.height - spacing,
        };
      case SIDES.LEFT:
        return {
          x: box.right + spacing,
          y: targetBox.top - this.largestPieceSpan - spacing,
        };
    }
  }

  arrangePieces() {
    const sides = [SIDES.TOP, SIDES.RIGHT, SIDES.BOTTOM, SIDES.LEFT];
    let i = 0;
    let sideIndex = 0;
    let currentRowAlignmentBaseline = null;

    let currentSide = sides[sideIndex];

    const firstPiecesOnEachSide = {
      top: null,
      right: null,
      bottom: null,
      left: null,
    };

    const spacing = (this.largestPieceSpan / 100) * 5;

    const piecesInPlay = this.shuffleArray(Utils.getIndividualPiecesOnCanvas());

    let currentX = this.solvingArea.offsetLeft;
    let currentY = this.solvingArea.offsetTop - this.largestPieceSpan;
    let verticalSpace = currentY;

    while (i < piecesInPlay.length) {
      const currentPiece = piecesInPlay[i];
      const pieceData = Utils.getPieceFromElement(currentPiece, [
        "jigsaw-type",
      ]);

      if (currentSide === SIDES.TOP) {
      }

      if (currentSide === "top" && pieceData.type[0] !== 1) {
        console.log("pushing piece down");
        // currentY += this.connectorSize;
      }

      const nextPiece = piecesInPlay[i + 1];

      move(currentPiece)
        .x(currentX)
        .y(currentY)
        .duration(this.animationDuration)
        .end();

      if (i === 0) {
        firstPiecesOnEachSide[currentSide] = currentPiece;
      }

      const nextSide = sideIndex < 3 ? sideIndex + 1 : 0;
      const isLastPiece = i === piecesInPlay.length - 1;

      if (
        this.shouldProceedToNextSide(
          currentSide,
          currentPiece,
          firstPiecesOnEachSide[sides[nextSide]]
        )
      ) {
        // console.log("proceeding to next side", i)
        if (currentSide === SIDES.BOTTOM) {
          verticalSpace += this.largestPieceSpan + spacing;
        }

        const nextPos = this.getPositionForFirstPieceOnNextSide(
          currentPiece,
          !isLastPiece ? nextPiece : null,
          currentSide,
          firstPiecesOnEachSide[sides[nextSide]],
          spacing
        );

        sideIndex = nextSide;
        currentSide = sides[nextSide];

        firstPiecesOnEachSide[currentSide] = nextPiece;

        currentX = nextPos.x;
        currentY = nextPos.y;
      } else {
        const currentPieceBoundingBox = Utils.getStyleBoundingBox(currentPiece);
        const nextPieceBoundingBox = nextPiece
          ? Utils.getStyleBoundingBox(nextPiece)
          : null;

        if (currentSide === SIDES.TOP) {
          currentX += currentPieceBoundingBox.width + spacing;
        } else if (currentSide === SIDES.RIGHT) {
          currentY += currentPieceBoundingBox.height + spacing;
        } else if (currentSide === SIDES.BOTTOM) {
          if (!isLastPiece) {
            currentX -= nextPieceBoundingBox.width + spacing;
          }
        } else if (currentSide === SIDES.LEFT) {
          if (!isLastPiece) {
            currentY -= nextPieceBoundingBox.height + spacing;
          }
        }
      }

      i++;
    }

    Events.notify(EVENT_TYPES.SAVE, piecesInPlay);
  }

  randomisePiecePositions() {
    const sectors = this.getSequentialArray(0, this.selectedNumPieces, true);
    const pieces = this.shuffleArray(Utils.getIndividualPiecesOnCanvas());

    let i = 0;
    while (i < pieces.length - 1) {
      const el = pieces[i];
      const box = Utils.getStyleBoundingBox(el);
      const sector = this.pieceSectors[sectors[i]];
      const pos = {
        x: Utils.getRandomInt(sector.x, sector.x + sector.w - box.width),
        y: Utils.getRandomInt(sector.y, sector.y + sector.h - box.height),
      };
      move(el).x(pos.x).y(pos.y).duration(this.animationDuration).end();
      i++;
    }

    // this.save(this.allPieces());
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  getRandomPositionOutsideBoardArea(sector) {
    const randSectorBoundingBox = this.getSectorBoundingBox(sector);

    return {
      left: Utils.getRandomInt(
        randSectorBoundingBox.left,
        randSectorBoundingBox.right - this.largestPieceSpan
      ),
      top: Utils.getRandomInt(
        randSectorBoundingBox.top,
        randSectorBoundingBox.bottom - this.largestPieceSpan
      ),
    };
  }

  assignPieceConnections() {
    console.log("assigning piece connections");
    this.allPieces().forEach((p) => {
      p.dataset.connectsTo = JSON.stringify(this.getConnectingPieceIds(p));
    });
  }

  drawBoundingBox(box, className) {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = box.top + "px";
    div.style.left = box.left + "px";
    div.style.width = box.right - box.left + "px";
    div.style.height = box.bottom - box.top + "px";
    div.style.backgroundColor = "black";
    if (className) {
      div.classList.add(className);
    }
    document.body.appendChild(div);
  }

  getPieceBoundingBox(piece) {
    return {
      top: piece.pageY,
      right: piece.pageX + piece.imgW,
      left: piece.pageX,
      bottom: piece.pageY + piece.imgH,
    };
  }

  allPieces() {
    return document.querySelectorAll(".puzzle-piece");
  }

  filterPiecesByDataAttribute(els, key, value) {
    return els.map((el) => this.getDataAttributeValue(el, key) === value);
  }

  // stout
  getElementBoundingBoxRelativeToTopContainer(el) {
    let top = 0,
      left = 0;
    const recurse = (el) => {
      if (
        el.classList.contains("subgroup") ||
        el.classList.contains("puzzle-piece")
      ) {
        left += el.offsetLeft;
        top += el.offsetTop;
        return recurse(el.parentNode);
      } else {
        return {
          top,
          left,
        };
      }
    };

    return recurse(el);
  }

  getBoundingBox(el) {
    return {
      top: el.offsetTop,
      right: el.offsetLeft + el.offsetWidth,
      bottom: el.offsetTop + el.offsetHeight,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight,
    };
  }

  getElementBoundingBox(el) {
    let pos = this.getElementBoundingBoxRelativeToTopContainer(el);
    return {
      top: pos.top,
      right: pos.left + el.offsetWidth,
      bottom: pos.top + el.offsetHeight,
      left: pos.left,
    };
  }

  setupFullImagePreviewer() {
    this.fullImageViewerEl.style.background = `url(${this.previewImage.src}) no-repeat`;

    if (this.imagePreviewType === "alwaysOn") {
      this.fullImageViewerEl.style.opacity = 0.2;
    } else {
      this.fullImageViewerEl.style.display = "none";
    }
  }

  isPuzzleComplete() {
    return (
      Array.from(this.allPieces()).filter((p) => this.isSolved(p)).length ===
      this.selectedNumPieces
    );
  }

  saveToLocalStorage() {
    const payload = [];
    let time = Date.now();

    [...this.allPieces()].forEach((p) => {
      delete p._id;
      payload.push(this.getPieceFromElement(p, this.DATA_ATTR_KEYS));
    });

    const progressKey = this.getUniqueLocalStorageKeyForPuzzle(
      "LOCAL_STORAGE_PUZZLY_PROGRESS_KEY"
    );
    const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle(
      "LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY"
    );

    console.info(
      `[Puzzly] Saving to local storage, key ${progressKey}:`,
      payload
    );
    localStorage.setItem(progressKey, JSON.stringify(payload));
    console.info(`[Puzzly] Saving to local storage, key ${lastSaveKey}:`, time);
    localStorage.setItem(lastSaveKey, time);
  }

  setElementIdsFromPersistence(pieces) {
    const allPieces = this.allPieces();
    pieces.forEach((p) => {
      let { imgX, imgY, _id } = p;
      imgX = "" + imgX;
      imgY = "" + imgY;
      const el = Utils.querySelectorFrom(
        `[data-imgx='${imgX}'][data-imgy='${imgY}']`,
        allPieces
      )[0];
      this.setElementAttribute(el, "data-piece-id-in-persistence", _id);
    });
  }

  async save(pieces) {
    console.log("Saving", pieces);

    if (pieces.length === 0) {
      console.warn("Nothing to save");
      return;
    }
    const payload = [];
    const pieceArray = Array.isArray(pieces) ? pieces : Array.from(pieces);

    pieceArray.forEach((p) => {
      payload.push(Utils.getPieceFromElement(p));
    });

    fetch(`/api/pieces`, {
      method: "put",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          this.saveToLocalStorage();
          return;
        }
        return res.json();
      })
      .then((res) => {
        if (res.status === "failure") {
          console.info(
            "[Puzzly] Save to DB failed, saving to Local Storage instead."
          );
          localStorage.setItem("puzzly", {
            lastSaveDate: Date.now(),
            progress: payload,
          });
        }
      });
  }
}

window.Puzzly = Puzzly;
