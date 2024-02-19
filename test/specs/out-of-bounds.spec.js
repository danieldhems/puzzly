import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import {
  createGroupWithPieces,
  dragOutOfBounds,
  getPiece,
} from "../piece-commands.js";

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
        await expect(false).toBeTruthy();

        const piece = await getPiece(0);
        const startingLocation = await piece.getLocation();
        await dragOutOfBounds(piece);
        await expect(await piece.getLocation()).toEqual(startingLocation);
      });
    });
  });
  describe("Groups", () => {
    describe("When dragged and dropped out of bounds", () => {
      it("Should reset the group to its starting position", async () => {
        const el = await (await $("#dfgsdfsdfgsdfg")).click();
        await createGroupWithPieces(0, 1);
        const piece = await getPiece(0);
        const group = await piece.parentElement();
        const groupLocation = await group.getLocation();
        await dragOutOfBounds(piece, 2000);
        const newLocation = await group.getLocation();
        await expect(newLocation).toEqual(groupLocation);
      });
    });
  });
});
