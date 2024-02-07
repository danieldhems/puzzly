import { createPuzzle } from "../commands.js";
import { getPiece, makeConnection } from "../piece-commands.js";

describe("Piece connections", () => {
  beforeEach(async () => {
    await createPuzzle();
  });
  describe("Single pieces", () => {
    it("should connect to each other", async () => {
      const sourcePiece = await getPiece(0);
      await makeConnection(sourcePiece, 0);
    });
  });
});
