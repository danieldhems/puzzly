export default class CanvasOperations {
  shadowOffset;

  constructor(puzzly) {
    shadowOffset = puzzly.shadowOffset;
  }

  setShadowOffset(value) {
    this.shadowOffset = value;
  }

  makeCanvas(id, width, height) {
    // console.log(this.boardWidth, this.boardHeight);
    const el = document.createElement("canvas");
    el.id = id;

    const widthWithShadowOffset = width + this.shadowOffset;
    const heightWithShadowOffset = height + this.shadowOffset;

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

  drawPiecesIntoGroup(groupId, pieces) {
    const cnv = document.querySelector(`#group-canvas-${groupId}`);
    const ctx = cnv.getContext("2d");
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
