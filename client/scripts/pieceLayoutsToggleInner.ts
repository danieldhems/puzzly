import { MovableElement } from "./types";
import Utils from "./utils";

export default function toggleInnerPieces(piecesVisible: boolean) {
  if (piecesVisible) {
    Utils.getAllPieces().forEach((piece: MovableElement) => {
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
    Utils.getAllPieces().forEach((piece: MovableElement) => {
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
