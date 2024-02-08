import { $, browser, expect } from "@wdio/globals";

export async function getPiece(id) {
  return await $(`#piece-${id}`);
}

export async function getAdjacentPieceBySide(element, sideIndex) {
  const connectsToString = await element.getAttribute("data-connects-to");
  const connectsTo = JSON.parse(connectsToString);
  const keys = Object.keys(connectsTo);
  return await $(`#piece-${connectsTo[keys[sideIndex]]}`);
}

export async function makeConnection(element, side) {
  const firstPieceLocation = await element.getLocation();
  const sourceSolvedX = parseInt(await element.getAttribute("data-solvedx"));
  const sourceSolvedY = parseInt(await element.getAttribute("data-solvedy"));

  const adjacentPiece = await getAdjacentPieceBySide(element, side);

  const targetSolvedX = parseInt(
    await adjacentPiece.getAttribute("data-solvedx")
  );
  const targetSolvedY = parseInt(
    await adjacentPiece.getAttribute("data-solvedy")
  );

  const { x, y } = await adjacentPiece.getLocation();

  const dragReferenceFrame = {
    top: y - targetSolvedY,
    left: x - targetSolvedX,
  };

  const relativeDragDest = {
    y: parseInt(dragReferenceFrame.top + sourceSolvedY),
    x: parseInt(dragReferenceFrame.left + sourceSolvedX),
  };

  const selectionCoords = {
    x: parseInt(firstPieceLocation.x),
    y: parseInt(firstPieceLocation.y),
  };

  const dragCoords = {
    x: parseInt(relativeDragDest.x + 10),
    y: parseInt(relativeDragDest.y + 10),
  };

  browser
    .action("pointer")
    .move(selectionCoords.x, selectionCoords.y)
    .down({ button: 0 }, element)
    .move(dragCoords.x, dragCoords.y)
    .up({ button: 0 }, element)
    .perform();

  await expect(element).toHaveElementClass("grouped");

  const parentElement = await element.parentElement();
  await expect(parentElement).toHaveElementClass("group-container");
  await expect(await parentElement.getAttribute("id")).not.toBe(
    "pieces-container"
  );
  return parentElement;
}
