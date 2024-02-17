import { cleanup } from "../cleanup.js";
import { createPuzzle } from "../commands.js";
import {
  getPiece,
  dragOutOfBounds,
  putPieceInPocket,
} from "../piece-commands.js";

describe("Single pieces", () => {
  beforeEach(async () => {
    await createPuzzle();
  });
  afterEach(async () => {
    await cleanup();
  });

  describe("When rendered", () => {
    describe("Its child elements", () => {
      it("should exist", async () => {
        const piece = await getPiece(0);
        await piece.$(".puzzle-piece-fg");
        await piece.$(".puzzle-piece-bg");
      });
    });
    describe("Its data attributes", () => {
      it("should be as expected", async () => {
        const piece = await getPiece(0);
        expect(await piece.getAttribute("data-jigsaw-type")).not.toBeNull();
        expect(
          await piece.getAttribute("data-connector-distance-from-corner")
        ).not.toBeNull();
        expect(await piece.getAttribute("data-connector-size")).not.toBeNull();
        expect(await piece.getAttribute("data-shadow-offset")).not.toBeNull();
        expect(await piece.getAttribute("data-piece-id")).not.toBeNull();
        expect(
          await piece.getAttribute("data-piece-id-in-persistence")
        ).not.toBeNull();
        expect(await piece.getAttribute("data-puzzle-id")).not.toBeNull();
        expect(await piece.getAttribute("data-imgX")).not.toBeNull();
        expect(await piece.getAttribute("data-imgy")).not.toBeNull();
        expect(await piece.getAttribute("data-solvedX")).not.toBeNull();
        expect(await piece.getAttribute("data-solvedY")).not.toBeNull();
        expect(await piece.getAttribute("data-pageX")).not.toBeNull();
        expect(await piece.getAttribute("data-pageY")).not.toBeNull();
        expect(await piece.getAttribute("data-spriteX")).not.toBeNull();
        expect(await piece.getAttribute("data-spriteY")).not.toBeNull();
        expect(await piece.getAttribute("data-spriteshadowx")).not.toBeNull();
        expect(await piece.getAttribute("data-spriteshadowy")).not.toBeNull();
        expect(await piece.getAttribute("data-imgW")).not.toBeNull();
        expect(await piece.getAttribute("data-imgH")).not.toBeNull();
        expect(await piece.getAttribute("data-svgPath")).not.toBeNull();
        expect(await piece.getAttribute("data-is-inner-piece")).not.toBeNull();
        expect(
          await piece.getAttribute("data-connector-tolerance")
        ).not.toBeNull();
        expect(await piece.getAttribute("data-connects-to")).not.toBeNull();
        expect(await piece.getAttribute("data-connections")).not.toBeNull();
        expect(
          await piece.getAttribute("data-num-pieces-from-top-edge")
        ).not.toBeNull();
        expect(
          await piece.getAttribute("data-num-pieces-from-left-edge")
        ).not.toBeNull();
        expect(await piece.getAttribute("data-is-solved")).not.toBeNull();
      });
    });
  });
});
