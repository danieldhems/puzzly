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

  static makeCanvas() {
    const el = document.createElement("canvas");

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

  static drawPiecesOntoCanvas(canvas, pieces, puzzleImage, shadowOffset) {
    const ctx = canvas.getContext("2d");
    // ctx.imageSmoothingEnabled = false;
    pieces.forEach((p) => {
      const data = p.element.dataset;
      // console.log("drawPiecesOntoCanvas", data, shadowOffset);
      ctx.drawImage(
        puzzleImage,
        data.spriteshadowx,
        data.spriteshadowy,
        data.imgw,
        data.imgh,
        parseInt(data.solvedx) + shadowOffset,
        parseInt(data.solvedy) + shadowOffset,
        data.imgw,
        data.imgh
      );

      if (p instanceof HTMLDivElement) {
        p.element.childNodes.forEach((n) => (n.style.visibility = "hidden"));
      } else {
        p.element.childNodes.forEach((n) => (n.style.visibility = "hidden"));
      }
    });

    pieces.forEach((p) => {
      const data = p.element.dataset;
      ctx.drawImage(
        puzzleImage,
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

  onPuzzleLoaded(event) {
    const config = event.detail;
    this.puzzleImage = config.puzzleImage;
    this.shadowOffset = config.pieceSize * SHADOW_OFFSET_RATIO;
    this.width = config.boardWidth;
    this.height = config.boardHeight;
  }

  static getCanvas(id) {
    console.log("id", id);
    const container = Array.from(
      document.querySelectorAll(`.group-container`)
    ).filter((el) => {
      console.log(el.dataset);
      return el.dataset?.groupId === id;
    })[0];
    console.log("found", container);
    return container.querySelector("canvas");
  }
}
