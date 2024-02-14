import { WaitUntil } from "@serenity-js/core";
import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import {
  getPiece,
  getAdjacentPieceBySide,
  getAdjacentPieceNotInGroup,
  dragNearPiece,
  dragNearPieceAndConnect,
  dragNearGroupedPiece,
  dragNearGroupedPieceAndConnect,
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
      describe("within the connector tolerance", () => {
        it("should connect to each other", async () => {
          const sourcePiece = await getPiece(0);
          const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);
          await dragNearPieceAndConnect(sourcePiece, adjacentPiece);
        });

        it("should connect to groups", async () => {
          // Create a group
          const sourcePiece = await getPiece(0);
          const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);

          await dragNearPieceAndConnect(sourcePiece, adjacentPiece);

          const adjacentPieceNotInGroup = await getAdjacentPieceNotInGroup(
            sourcePiece
          );

          // Connect a single piece to the new group
          await dragNearGroupedPieceAndConnect(
            adjacentPieceNotInGroup,
            sourcePiece
          );
        });
      });

      describe("NOT within the connector tolerance", () => {
        it("should NOT connect to each other", async () => {
          const sourcePiece = await getPiece(0);
          const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);
          await dragNearPiece(sourcePiece, adjacentPiece);
        });

        it("should NOT connect to groups", async () => {
          // Create a group
          const sourcePiece = await getPiece(0);
          const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);

          await dragNearPieceAndConnect(sourcePiece, adjacentPiece);

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
