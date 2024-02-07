import { URL } from "url";
import { PuzzleSizes } from "../client/scripts/constants.js";
import path from "path";

const uploadsPathAndPrefix = "./uploads/preview_";
const testImagePath = "./puzzleImages/";

const __dirname = new URL(".", import.meta.url).pathname;

export const createPuzzle = async function () {
  await browser.url("");

  const fileInput = await $("#upload-fld");
  const imageName = "book.jpg";
  const filePath = path.join(__dirname, testImagePath, imageName);
  const remotePath = await browser.uploadFile(filePath);
  await fileInput.setValue(remotePath);

  const numPiecesField = $("#puzzle-size-input-field");
  const numPiecesFldValue = await numPiecesField.getValue();
  const selectNumberOfPieces = PuzzleSizes[numPiecesFldValue].numPieces;

  const previewEl = $("#puzzle-setup--image_preview-imgEl");
  await expect(previewEl).toHaveAttr("src", uploadsPathAndPrefix + imageName);
  const submitButton = await $("#start-btn");
  await submitButton.click();

  await $(".puzzle-piece").waitForExist();
  const renderedPiecesCount = await $$(".puzzle-piece").length;
  await expect(renderedPiecesCount).toBe(selectNumberOfPieces);
};

export function getRandomPuzzleImagePath() {
  return PUZZLE_IMAGE_PATHS[
    Math.floor(Math.random() * PUZZLE_IMAGE_PATHS.length - 1)
  ];
}

export async function waitForPieces(page) {
  expect(await page.locator(".puzzle-piece").count()).toBeGreaterThan(0);
}
