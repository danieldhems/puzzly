import arrangePiecesAroundEdge from "./pieceLayoutsNeaten";
import randomisePiecePositions from "./pieceLayoutsShuffle";
import Pockets from "./Pockets";
import { PieceSectors } from "./types";
import Utils from "./utils";

export interface PieceLayoutsProperties {
  largestPieceSpan: number;
  selectedNumPieces: number;
  solvingAreaElement: HTMLDivElement;
  Pockets: Pockets;
}

export default interface PieceLayouts extends PieceLayoutsProperties {}

export default class PieceLayouts {
  playBoundary: HTMLDivElement;
  selectedNumberOfPieces: number;
  pieceSectors: PieceSectors;
  sendToEdgeNeatenBtn: HTMLSpanElement | null;
  controlsHandle: HTMLElement | null;
  controlsPanel: HTMLElement | null;
  sendToEdgeShuffleBtn: HTMLElement | null;
  gatherPiecesBtn: HTMLSpanElement | null;
  controlsPanelIsOpen: boolean;
  solvingAreaBoundingBox: {
    width: number;
    height: number;
    top: number;
    left: number;
  };

  constructor({
    largestPieceSpan,
    selectedNumPieces,
    solvingAreaElement,
    Pockets,
  }: PieceLayoutsProperties) {
    this.largestPieceSpan = largestPieceSpan;
    this.solvingAreaElement = solvingAreaElement;
    this.selectedNumberOfPieces = selectedNumPieces;

    this.sendToEdgeNeatenBtn = document.getElementById("shuffle-pieces");
    this.controlsHandle = document.getElementById("controls-handle");
    this.controlsPanel = document.getElementById("controls-panel");
    this.gatherPiecesBtn = document.getElementById("gather-pieces");

    this.Pockets = Pockets;

    this.controlsPanelIsOpen = false;
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
  }

  onArrangePiecesAroundEdge() {
    arrangePiecesAroundEdge(this.largestPieceSpan, this.solvingAreaElement);
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
    const box = Utils.getStyleBoundingBox(this.playBoundary);
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
}
