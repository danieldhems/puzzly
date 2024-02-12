import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import {
  getPiece,
  connectToSinglePiece,
  getAdjacentPieceNotInGroup,
  connectSinglePieceToGroupedPiece,
  solve,
} from "../piece-commands.js";

describe("Piece connections", () => {
  beforeEach(async () => {
    await createPuzzle();
  });
  afterEach(() => {
    cleanup();
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
      await connectToSinglePiece(sourcePiece, 0);
      const adjacentPieceNotInGroup = await getAdjacentPieceNotInGroup(
        sourcePiece
      );
      await connectSinglePieceToGroupedPiece(
        adjacentPieceNotInGroup,
        sourcePiece
      );
    });
    // it("should reset their position if dragged out of bounds", () => {});
  });
});
