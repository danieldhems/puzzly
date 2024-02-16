import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import { getPiece, dragOutOfBounds } from "../piece-commands.js";

describe("Single pieces", () => {
  beforeEach(async () => {
    await createPuzzle();
  });
  afterEach(async () => {
    await cleanup();
  });
  describe("When dragged and dropped out-of-bounds", () => {
    it("should have their position reset", async () => {
      const piece = await getPiece(0);
      const startingLocation = await piece.getLocation();
      await dragOutOfBounds(piece, { partial: false });
      expect(await piece.getLocation()).toEqual(startingLocation);
    });
  });
});
