import { createPuzzle } from "../commands.js";
import {
  getPiece,
  connectToSinglePiece,
  getAdjacentPieceNotInGroup,
  solve,
} from "../piece-commands.js";

describe("Piece connections", () => {
  beforeEach(async () => {
    await createPuzzle();
  });

  describe("Single pieces", () => {
    it("should connect to each other", async () => {
      const sourcePiece = await getPiece(0);
      await connectToSinglePiece(sourcePiece, 0);
    });
    it("should be solvable", async () => {
      const sourcePiece = await getPiece(0);
      await solve(sourcePiece);
    });
    it("should connect to groups", async () => {
      const sourcePiece = await getPiece(0);
      const { children } = await connectToSinglePiece(sourcePiece, 0);
      const adjacentPieceNotInGroup = await getAdjacentPieceNotInGroup(
        children[0]
      );
      await connectToSinglePiece(adjacentPieceNotInGroup, 0);
    });
  });

  describe("Grouped pieces");
});
