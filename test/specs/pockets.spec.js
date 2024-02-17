import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import { getPiece, putPieceInPocket } from "../piece-commands.js";

describe("Pockets", () => {
  beforeEach(async () => {
    await createPuzzle();
  });
  afterEach(async () => {
    await cleanup();
  });
  describe("Single pieces", () => {
    describe("When dragged and dropped on to a pocket", () => {
      it("Should be placed in that pocket", async () => {
        const piece = await getPiece(0);
        await putPieceInPocket(piece, 0);
      });
    });
  });
  describe("Groups", () => {
    describe("When dragged and dropped on to a pocket", () => {
      it("Should be NOT placed in that pocket", async () => {
        const piece = await getPiece(0);

        await putPieceInPocket(piece, 0);
      });
    });
  });
});
