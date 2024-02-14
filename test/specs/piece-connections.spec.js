import { WaitUntil } from "@serenity-js/core";
import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import {
  getPiece,
  getAdjacentPieceBySide,
  getAdjacentPieceNotInGroup,
  dragNearPiece,
  dragNearGroupedPiece,
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
    describe("when dragged and dropped near adjacent pieces", () => {
      describe("when dropped within the connector tolerance", () => {
        it("should connect to each other", async () => {
          const sourcePiece = await getPiece(0);
          const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);
          await (await dragNearPiece(sourcePiece, adjacentPiece)).andConnect();
          await browser.debug();
        });

        it("should connect to groups", async () => {
          // Create a group
          const sourcePiece = await getPiece(0);
          const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);

          await (await dragNearPiece(sourcePiece, adjacentPiece)).andConnect();

          const adjacentPieceNotInGroup = await getAdjacentPieceNotInGroup(
            sourcePiece
          );

          // Connect a single piece to the new group
          await (
            await dragNearGroupedPiece(adjacentPieceNotInGroup, sourcePiece)
          ).andConnect();
        });
      });

      describe("when dropped NOT within the connector tolerance", () => {
        it("should NOT connect to each other", async () => {
          const sourcePiece = await getPiece(0);
          const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);
          await dragNearPiece(sourcePiece, adjacentPiece);
        });

        it("should NOT connect to groups", async () => {
          // Create a group
          const sourcePiece = await getPiece(0);
          const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);

          await dragNearPiece(sourcePiece, adjacentPiece);

          // Drag an adjacent single piece near the group, but not close enough to connect
          const adjacentPieceNotInGroup = await getAdjacentPieceNotInGroup(
            sourcePiece
          );
          await dragNearGroupedPiece(adjacentPieceNotInGroup, sourcePiece);
        });
      });
    });

    it("should be solvable", async () => {
      const sourcePiece = await getPiece(0);
      await solve(sourcePiece);
    });
  });
});
