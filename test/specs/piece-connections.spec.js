import { WaitUntil } from "@serenity-js/core";
import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import {
  getPiece,
  joinPieces,
  getAdjacentPieceBySide,
  getAdjacentPieceNotInGroup,
  connectToGroupedPiece,
  solve,
} from "../piece-commands.js";

describe("Piece connections", () => {
  beforeEach(async () => {
    await createPuzzle();
  });
  afterEach(async () => {
    await cleanup();
  });

  describe("Single pieces", () => {
    it("should connect to each other", async () => {
      const sourcePiece = await getPiece(0);
      const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);
      await joinPieces(sourcePiece, adjacentPiece);
    });

    it("should connect to groups", async () => {
      // Create a group
      const sourcePiece = await getPiece(0);
      const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);

      await joinPieces(sourcePiece, adjacentPiece);
      const adjacentPieceNotInGroup = await getAdjacentPieceNotInGroup(
        sourcePiece
      );

      // Connect a single piece to the new group
      await connectToGroupedPiece(adjacentPieceNotInGroup, sourcePiece);
    });

    it("should be solvable", async () => {
      const sourcePiece = await getPiece(0);
      await solve(sourcePiece);
    });
  });
});
