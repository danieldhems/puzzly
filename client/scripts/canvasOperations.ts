import { EVENT_TYPES, SHADOW_OFFSET_RATIO } from "./constants.js";
import Puzzly from "./puzzly.js";
import SingleMovable from "./SingleMovable.js";
import { MovableElement } from "./types.js";
import Utils from "./utils.js";

export default class CanvasOperations {
  shadowOffset: Puzzly["shadowOffset"];
  puzzleImage: Puzzly["puzzleImage"];
  width: Puzzly["boardWidth"];
  height: Puzzly["boardHeight"];

  constructor(
    args: Pick<
      Puzzly,
      "boardWidth" | "boardHeight" | "puzzleImage" | "shadowOffset"
    >
  ) {
    this.width = args.boardWidth;
    this.height = args.boardHeight;
    this.puzzleImage = args.puzzleImage;
    this.shadowOffset = args.shadowOffset;

    window.addEventListener(
      EVENT_TYPES.PUZZLE_LOADED,
      this.onPuzzleLoaded.bind(this)
    );
  }

  makeCanvas() {
    const el = document.createElement("canvas");

    const widthWithShadowOffset = this.width + this.shadowOffset;
    const heightWithShadowOffset = this.height + this.shadowOffset;

    // Include the shadow offset in the canvas' width and height, else its drawing coordinates won't match the alignment of the pieces
    el.width = widthWithShadowOffset;
    el.height = heightWithShadowOffset;

    el.style.width = Utils.getPxString(widthWithShadowOffset);
    el.style.height = Utils.getPxString(heightWithShadowOffset);
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.left = "0";
    el.style.pointerEvents = "none";

    return el;
  }

  drawPiecesOntoCanvas(
    canvas: HTMLCanvasElement,
    pieces: SingleMovable[],
    puzzleImage: Puzzly["puzzleImage"],
    shadowOffset: Puzzly["shadowOffset"]
  ) {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    // ctx.imageSmoothingEnabled = false;
    pieces.forEach((piece) => {
      const data = piece.element.dataset;
      // console.log("drawPiecesOntoCanvas", data, shadowOffset);
      if (
        data.spriteshadowx &&
        data.spriteshadowy &&
        data.imgw &&
        data.imgh &&
        data.solvedx &&
        data.solvedy
      ) {
        ctx.drawImage(
          puzzleImage,
          parseInt(data.spriteshadowx),
          parseInt(data.spriteshadowy),
          parseInt(data.imgw),
          parseInt(data.imgh),
          parseInt(data.solvedx) + shadowOffset,
          parseInt(data.solvedy) + shadowOffset,
          parseInt(data.imgw),
          parseInt(data.imgh)
        );
      }

      piece.element.childNodes.forEach(
        (element: HTMLDivElement) => (element.style.visibility = "hidden")
      );
    });

    pieces.forEach((piece) => {
      const data = piece.element.dataset;
      if (
        data.spritex &&
        data.spritey &&
        data.imgw &&
        data.imgh &&
        data.solvedx &&
        data.solvedy
      ) {
        ctx.drawImage(
          puzzleImage,
          parseInt(data.spritex),
          parseInt(data.spritey),
          parseInt(data.imgw),
          parseInt(data.imgh),
          parseInt(data.solvedx),
          parseInt(data.solvedy),
          parseInt(data.imgw),
          parseInt(data.imgh)
        );
      }
    });
  }

  onPuzzleLoaded(event: CustomEvent) {
    const config = event.detail;
    this.puzzleImage = config.puzzleImage;
    this.shadowOffset = config.pieceSize * SHADOW_OFFSET_RATIO;
    this.width = config.boardWidth;
    this.height = config.boardHeight;
  }

  getCanvas(id: string) {
    console.log("id", id);
    const container = Array.from(
      document.querySelectorAll(`.group-container`)
    ).filter((el) => {
      if (el instanceof HTMLDivElement) {
        console.log(el.dataset);
        return el.dataset?.groupId === id;
      }
    })[0];
    console.log("found", container);
    return container.querySelector("canvas");
  }
}
