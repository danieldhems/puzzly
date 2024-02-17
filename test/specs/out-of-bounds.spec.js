import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import { dragOutOfBounds, getPiece } from "../piece-commands.js";

describe("Out of bounds", () => {
  beforeEach(async () => {
    await createPuzzle();
  });
  afterEach(async () => {
    await cleanup();
  });
  describe("Single pieces", () => {
    describe("When dragged and dropped out of bounds", () => {
      it("Should reset the piece to its starting position", async () => {
        const piece = await getPiece(0);
        const startingLocation = await piece.getLocation();
        await dragOutOfBounds(piece);
        expect(await piece.getLocation()).toEqual(startingLocation);
      });
    });
  });
  describe("Groups", () => {
    describe("When dragged and dropped out of bounds", () => {
      it("Should reset the group to its starting position", async () => {
        const piece = await getPiece(0);
        const adjacentPiece = await getAdjacentPieceBySide(sourcePiece, 0);
        await dragNearPieceAndConnect(sourcePiece, adjacentPiece);
        const group = await piece.parentElement();
        const groupLocation = await group.getLocation();
        await dragOutOfBounds(piece);
        expect(await group.getLocation()).toEqual(groupLocation);
      });
    });
  });
  describe("Pocket movable", () => {
    describe("When dragged and dropped out of bounds", () => {
      it("should return the dragged pieces to the pocket they came from", async () => {});
    });
  });
});
