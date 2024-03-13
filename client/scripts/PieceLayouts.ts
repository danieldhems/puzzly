import arrangePiecesAroundEdge from "./pieceLayoutsNeaten";
import randomisePiecePositions from "./pieceLayoutsShuffle";
import Pockets from "./Pockets";
import { MovableElement, PieceSectors } from "./types";
import Utils from "./utils";

export interface PieceLayoutsProperties {
  largestPieceSpan: number;
  selectedNumPieces: number;
  solvingArea: HTMLDivElement | null;
  playBoundary: HTMLDivElement | null;
  Pockets: Pockets;
}

export default interface PieceLayouts extends PieceLayoutsProperties {}

export default class PieceLayouts {
  playBoundary: HTMLDivElement | null;
  solvingArea: HTMLDivElement | null;
  selectedNumberOfPieces: number;
  pieceSectors: PieceSectors;
  sendToEdgeNeatenBtn: HTMLSpanElement | null;
  controlsHandle: HTMLElement | null;
  controlsPanel: HTMLElement | null;
  sendToEdgeShuffleBtn: HTMLElement | null;
  gatherPiecesBtn: HTMLSpanElement | null;
  controlsPanelIsOpen: boolean;
  innerPiecesVisible: boolean;
  filterBtnOnLabel: HTMLSpanElement | null;
  filterBtnOffLabel: HTMLSpanElement | null;
  filterBtn: HTMLElement | null;
  solvingAreaBoundingBox: {
    width: number;
    height: number;
    top: number;
    left: number;
  };
  arrangePiecesAroundEdge: typeof arrangePiecesAroundEdge;

  constructor({
    largestPieceSpan,
    selectedNumPieces,
    solvingArea,
    playBoundary,
    Pockets,
  }: PieceLayoutsProperties) {
    this.largestPieceSpan = largestPieceSpan;
    this.solvingArea = solvingArea;
    this.playBoundary = playBoundary;
    this.selectedNumberOfPieces = selectedNumPieces;

    this.sendToEdgeNeatenBtn = document.getElementById("shuffle-pieces");
    this.controlsHandle = document.getElementById("controls-handle");
    this.controlsPanel = document.getElementById("controls-panel");
    this.gatherPiecesBtn = document.getElementById("gather-pieces");
    this.filterBtn = document.getElementById("filter-pieces");
    this.filterBtnOffLabel = document.getElementById("inner-pieces-on");
    this.filterBtnOnLabel = document.getElementById("inner-pieces-off");

    this.Pockets = Pockets;

    this.controlsPanelIsOpen = false;

    this.arrangePiecesAroundEdge = arrangePiecesAroundEdge;
  }

  getSolvingAreaBoundingBox() {
    if (this.solvingArea) {
      return {
        top: parseInt(this.solvingArea.style.top),
        left: parseInt(this.solvingArea.style.left),
        right:
          parseInt(this.solvingArea.style.left) +
          parseInt(this.solvingArea.style.width),
        bottom:
          parseInt(this.solvingArea.style.top) +
          parseInt(this.solvingArea.style.height),
        width: parseInt(this.solvingArea.style.width),
        height: parseInt(this.solvingArea.style.height),
      };
    }
  }

  getPlayBoundaryBoundingBox() {
    if (this.playBoundary) {
      return {
        top: parseInt(this.playBoundary.style.top),
        left: parseInt(this.playBoundary.style.left),
        right:
          parseInt(this.playBoundary.style.left) +
          parseInt(this.playBoundary.style.width),
        bottom:
          parseInt(this.playBoundary.style.top) +
          parseInt(this.playBoundary.style.height),
        width: parseInt(this.playBoundary.style.width),
        height: parseInt(this.playBoundary.style.height),
      };
    }
  }

  attachEventListeners() {
    if (this.sendToEdgeNeatenBtn) {
      this.sendToEdgeNeatenBtn.addEventListener(
        "mousedown",
        this.onArrangePiecesAroundEdge.bind(this)
      );
    }

    if (this.controlsHandle) {
      this.controlsHandle.addEventListener(
        "mousedown",
        this.onControlsHandleClick.bind(this)
      );
    }

    if (this.sendToEdgeShuffleBtn) {
      this.sendToEdgeShuffleBtn.addEventListener("mousedown", () => {
        randomisePiecePositions(this.pieceSectors);
        this.onControlsHandleClick();
      });
    }

    if (this.gatherPiecesBtn) {
      this.gatherPiecesBtn.addEventListener(
        "mousedown",
        this.gatherPieces.bind(this)
      );
    }

    if (this.filterBtn) {
      this.filterBtn.addEventListener(
        "mousedown",
        this.toggleInnerPieces.bind(this)
      );
    }
  }

  toggleInnerPieces(piecesVisible: boolean) {
    if (piecesVisible) {
      Utils.getAllPieces().forEach((piece: MovableElement) => {
        const p = Utils.getPieceFromElement(piece);
        if (Utils.isInnerPiece(p.type) && !p.isSolved && !p.groupId) {
          window.Puzzly.hidePiece(piece);
        }
      });
      this.innerPiecesVisible = false;
      (this.filterBtnOnLabel as HTMLSpanElement).style.display = "block";
      (this.filterBtnOffLabel as HTMLSpanElement).style.display = "none";
    } else {
      Utils.getAllPieces().forEach((piece: MovableElement) => {
        const p = Utils.getPieceFromElement(piece);
        if (Utils.isInnerPiece(p.type)) {
          window.Puzzly.showPiece(piece);
        }
      });
      this.innerPiecesVisible = true;
      (this.filterBtnOffLabel as HTMLSpanElement).style.display = "block";
      (this.filterBtnOnLabel as HTMLSpanElement).style.display = "none";
    }
  }

  onArrangePiecesAroundEdge() {
    arrangePiecesAroundEdge(
      this.largestPieceSpan,
      this.solvingArea as HTMLDivElement
    );
    this.onControlsHandleClick();
  }

  gatherPieces() {
    const pieces = Utils.getAllPieces();
    const pocket = document.querySelector("#pocket-0") as HTMLDivElement;
    this.Pockets.addManyToPocket(pocket, pieces);
  }

  onControlsHandleClick() {
    if (this.controlsPanelIsOpen) {
      (this.controlsPanel as HTMLElement).classList.add("is-hidden");
      this.controlsPanelIsOpen = false;
    } else {
      (this.controlsPanel as HTMLElement).classList.remove("is-hidden");
      this.controlsPanelIsOpen = true;
    }
  }

  // Generate map of sectors that can be used for even dispersal of pieces around outside of puzzle board
  generatePieceSectorMap() {
    const box = Utils.getStyleBoundingBox(this.playBoundary as HTMLDivElement);
    const totalArea = box.width * box.height;
    const pieceSectorSize = totalArea / this.selectedNumberOfPieces;

    const sqr = Math.abs(Math.sqrt(pieceSectorSize));
    const area = { width: sqr, height: sqr };

    let currX = 0,
      currY = 0;

    for (let i = 0, l = this.selectedNumberOfPieces; i < l; i++) {
      this.pieceSectors[i] = {
        left: currX,
        top: currY,
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

  getRandomCoordsFromSectorMap() {
    return this.pieceSectors.map((s) => ({
      x: Utils.getRandomInt(s.left, s.left + s.width),
      y: Utils.getRandomInt(s.top, s.top + s.height),
    }));
  }

  getSectorBoundingBox(sectorIndex: number) {
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
    const chosen = sectors[sectorIndex];
    const solvingAreaBoundingBox = this.getSolvingAreaBoundingBox() as DOMRect;
    const playBoundaryBoundingBox =
      this.getPlayBoundaryBoundingBox() as DOMRect;
    switch (chosen) {
      case "top-first-half":
        return {
          top: 0,
          right: solvingAreaBoundingBox.width / 2,
          bottom: solvingAreaBoundingBox.bottom,
          left: solvingAreaBoundingBox.left,
        };
      case "top-second-half":
        return {
          top: 0,
          right: solvingAreaBoundingBox.right,
          bottom: solvingAreaBoundingBox.left,
          left: solvingAreaBoundingBox.left + solvingAreaBoundingBox.width / 2,
        };
      case "top-left":
        return {
          top: 0,
          right: solvingAreaBoundingBox.left,
          bottom: solvingAreaBoundingBox.left,
          left: 0,
        };
      case "right-first-half":
        return {
          top: solvingAreaBoundingBox.left,
          right: playBoundaryBoundingBox.width,
          bottom:
            solvingAreaBoundingBox.left + solvingAreaBoundingBox.height / 2,
          left: solvingAreaBoundingBox.right,
        };
      case "right-second-half":
        return {
          top: solvingAreaBoundingBox.left + solvingAreaBoundingBox.height / 2,
          right: playBoundaryBoundingBox.width,
          bottom: solvingAreaBoundingBox.bottom,
          left: solvingAreaBoundingBox.right,
        };
      case "top-right":
        return {
          top: 0,
          right: playBoundaryBoundingBox.width,
          bottom: solvingAreaBoundingBox.left,
          left: solvingAreaBoundingBox.right,
        };
      case "bottom-first-half":
        return {
          top: solvingAreaBoundingBox.bottom,
          right: solvingAreaBoundingBox.right,
          bottom: playBoundaryBoundingBox.height,
          left: solvingAreaBoundingBox.left + solvingAreaBoundingBox.width / 2,
        };
      case "bottom-second-half":
        return {
          top: solvingAreaBoundingBox.bottom,
          right: solvingAreaBoundingBox.left + solvingAreaBoundingBox.width / 2,
          bottom: playBoundaryBoundingBox.height,
          left: solvingAreaBoundingBox.left,
        };
      case "bottom-right":
        return {
          top: solvingAreaBoundingBox.bottom,
          right: playBoundaryBoundingBox.width,
          bottom: playBoundaryBoundingBox.height,
          left: solvingAreaBoundingBox.right,
        };
      case "left-first-half":
        return {
          top: solvingAreaBoundingBox.left + solvingAreaBoundingBox.height / 2,
          right: solvingAreaBoundingBox.left,
          bottom: solvingAreaBoundingBox.bottom,
          left: 0,
        };
      case "left-second-half":
        return {
          top: solvingAreaBoundingBox.left,
          right: solvingAreaBoundingBox.left,
          bottom:
            solvingAreaBoundingBox.top + solvingAreaBoundingBox.height / 2,
          left: 0,
        };
      case "bottom-left":
        return {
          top: solvingAreaBoundingBox.bottom,
          right: solvingAreaBoundingBox.left,
          bottom: playBoundaryBoundingBox.height,
          left: 0,
        };
    }
  }

  getRandomPositionOutsideBoardArea(sectorIndex: number) {
    const randSectorBoundingBox = this.getSectorBoundingBox(sectorIndex);

    if (randSectorBoundingBox) {
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
  }
}
