import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import {
  getPiece,
  joinPieces,
  getAdjacentPieceBySide,
  getAdjacentPieceNotInGroup,
  connectToGroupedPiece,
} from "../piece-commands.js";

describe("Group connections", () => {
  beforeEach(async () => {
    await createPuzzle();
  });
  afterEach(async () => {
    await cleanup();
  });

  it("should connect to single pieces", async () => {
    // Create a group
    const sourcePiece = await getPiece(0);
    const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);
    await joinPieces(sourcePiece, adjacentPiece);

    // Using the original piece, connect the new group to a single piece
    const adjacentPieceNotInGroup = await getAdjacentPieceNotInGroup(
      sourcePiece
    );
    await joinPieces(sourcePiece, adjacentPieceNotInGroup);
  });

  it("should connect to other groups", async () => {
    // Create a group
    const sourcePieceA = await getPiece(0);
    const adjacentPieceA = await getAdjacentPieceBySide(sourcePieceA, 0);
    await joinPieces(sourcePieceA, adjacentPieceA);

    // Create another group
    const sourcePieceB = await getPiece(3);
    const adjacentPieceB = await getAdjacentPieceBySide(sourcePieceB, 0);
    await joinPieces(sourcePieceB, adjacentPieceB);

    // Merge the groups
    await joinPieces(sourcePieceA, sourcePieceB);
  });

  describe("Group merge variations", () => {
    // This is for testing that two groups will merge no matter which piece either group is picked up by

    let firstSourcePiece,
      firstTargetPiece,
      secondSourcePiece,
      secondTargetPiece;

    beforeEach(async () => {
      // Create a group
      firstSourcePiece = await getPiece(0);
      firstTargetPiece = await getPiece(1);
      await joinPieces(firstSourcePiece, firstTargetPiece);

      // Create another group
      secondSourcePiece = await getPiece(3);
      secondTargetPiece = await getPiece(4);
      await joinPieces(secondSourcePiece, secondTargetPiece);
    });

    describe("FIrst piece from first group", () => {
      it("should merge the groups", async () => {
        await connectToGroupedPiece(firstSourcePiece, secondSourcePiece);
      });
    });
    describe("Second piece from first group", () => {
      it("should merge the groups", async () => {
        await connectToGroupedPiece(firstTargetPiece, secondSourcePiece);
      });
    });
    describe("First piece from second group", () => {
      it("should merge the groups", async () => {
        await connectToGroupedPiece(secondSourcePiece, firstSourcePiece);
      });
    });
    describe("Second piece from second group", () => {
      it("should merge the groups", async () => {
        await connectToGroupedPiece(secondTargetPiece, firstSourcePiece);
      });
    });
  });
});
