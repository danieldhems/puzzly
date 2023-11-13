import { EVENT_TYPES, SHADOW_OFFSET_RATIO } from "./constants.js";
import Utils from "./utils.js";

export default class CanvasOperations {
  shadowOffset;
  puzzleImage;
  width;
  height;

  constructor() {
    window.addEventListener(
      EVENT_TYPES.PUZZLE_LOADED,
      this.onPuzzleLoaded.bind(this)
    );
  }

  onPuzzleLoaded(event) {
    const config = event.detail;
    this.puzzleImage = config.puzzleImage;
    this.shadowOffset = config.pieceSize * SHADOW_OFFSET_RATIO;
    this.width = config.boardWidth;
    this.height = config.boardHeight;
  }

  makeCanvas(id) {
    const el = document.createElement("canvas");
    el.id = `canvas-${id}`;

    const widthWithShadowOffset = this.width + this.shadowOffset;
    const heightWithShadowOffset = this.height + this.shadowOffset;

    // Include the shadow offset in the canvas' width and height, else its drawing coordinates won't match the alignment of the pieces
    el.width = widthWithShadowOffset;
    el.height = heightWithShadowOffset;

    el.style.width = Utils.getPxString(widthWithShadowOffset);
    el.style.height = Utils.getPxString(heightWithShadowOffset);
    el.style.position = "absolute";
    el.style.top = 0;
    el.style.left = 0;
    el.style.pointerEvents = "none";
    return el;
  }

  getCanvas(id) {
    return document.querySelector(`#group-canvas-${id}`);
  }

  drawPiecesOntoCanvas(canvas, pieces) {
    const ctx = canvas.getContext("2d");
    // ctx.imageSmoothingEnabled = false;
    pieces.forEach((p) => {
      const data = p.dataset;
      ctx.drawImage(
        this.puzzleImage,
        data.spriteshadowx,
        data.spriteshadowy,
        data.imgw,
        data.imgh,
        parseInt(data.solvedx) + this.shadowOffset,
        parseInt(data.solvedy) + this.shadowOffset,
        data.imgw,
        data.imgh
      );

      if (p instanceof HTMLDivElement) {
        p.childNodes.forEach((n) => (n.style.visibility = "hidden"));
      } else {
        const el = Utils.getElementByPieceId(p.id);
        el.childNodes.forEach((n) => (n.style.visibility = "hidden"));
      }
    });

    pieces.forEach((p) => {
      const data = p.dataset;
      ctx.drawImage(
        this.puzzleImage,
        data.spritex,
        data.spritey,
        data.imgw,
        data.imgh,
        parseInt(data.solvedx),
        parseInt(data.solvedy),
        data.imgw,
        data.imgh
      );
    });
  }
}
