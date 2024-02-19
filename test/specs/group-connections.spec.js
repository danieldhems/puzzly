import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import {
  getPiece,
  createGroupWithPieces,
  getAdjacentPieceBySide,
  getAdjacentPieceNotInGroup,
  dragNearGroupedPieceAndConnect,
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
    await createGroupWithPieces(0, 1);

    // Using the original piece, connect the new group to a single piece
    const otherPiece = await getPiece(3);
    await joinPieces(sourcePiece, otherPiece);
  });

  it("should connect to other groups", async () => {
    // Create a group
    await createGroupWithPieces(0, 1);

    // Create another group
    await createGroupWithPieces(3, 4);

    // Merge the groups
    await joinPieces(await getPiece(0), await getPiece(3));
  });

  describe("Group merge variations", () => {
    // This is for testing that two groups will merge no matter which piece either group is picked up by

    beforeEach(async () => {
      // Create a group
      await createGroupWithPieces(0, 1);

      // Create another group
      await createGroupWithPieces(3, 4);
    });

    describe("First piece from first group", () => {
      it("should merge the groups", async () => {
        await dragNearGroupedPieceAndConnect(
          await getPiece(0),
          await getPiece(3)
        );
      });
    });
    describe("Second piece from first group", () => {
      it("should merge the groups", async () => {
        await dragNearGroupedPieceAndConnect(
          await getPiece(1),
          await getPiece(4)
        );
      });
    });
    describe("First piece from second group", () => {
      it("should merge the groups", async () => {
        await dragNearGroupedPieceAndConnect(
          await getPiece(3),
          await getPiece(0)
        );
      });
    });
    describe("Second piece from second group", () => {
      it("should merge the groups", async () => {
        await dragNearGroupedPieceAndConnect(
          await getPiece(4),
          await getPiece(2)
        );
      });
    });
  });
});
