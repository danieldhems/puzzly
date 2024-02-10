import { $, expect } from "@wdio/globals";

export async function getPiece(id) {
  return await $(`#piece-${id}`);
}

export async function getAdjacentPieceBySide(element, sideIndex) {
  const connectsToString = await element.getAttribute("data-connects-to");
  const connectsTo = JSON.parse(connectsToString);
  const keys = Object.keys(connectsTo);
  return await $(`#piece-${connectsTo[keys[sideIndex]]}`);
}

export async function getAdjacentPieceNotInGroup(element) {
  const thisGroup = await element.getAttribute("data-group-id");
  const connectsToString = await element.getAttribute("data-connects-to");
  const connectsTo = JSON.parse(connectsToString);
  const keys = Object.keys(connectsTo);
  console.log("TEST keys", keys);
  for (let key in keys) {
    console.log("TEST key name", key);
    console.log("TEST key value", keys[key]);
    console.log("TEST element id", connectsTo[keys[key]]);
    const piece = await $(`#piece-${connectsTo[keys[key]]}`);
    const pieceGroup = await piece.getAttribute("data-group-id");
    if (!pieceGroup || pieceGroup !== thisGroup) {
      return piece;
    }
  }
}

export async function connectToSinglePiece(element, side) {
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

  const dragDest = {
    y: parseInt(dragReferenceFrame.top + sourceSolvedY),
    x: parseInt(dragReferenceFrame.left + sourceSolvedX),
  };

  const dragCoords = {
    x: parseInt(dragDest.x - firstPieceLocation.x + 10),
    y: parseInt(dragDest.y - firstPieceLocation.y + 10),
  };

  element.dragAndDrop(dragCoords);

  await expect(element).toHaveElementClass("grouped");

  const parentElement = await element.parentElement();
  await expect(parentElement).toHaveElementClass("group-container");
  await expect(await parentElement.getAttribute("id")).not.toBe(
    "pieces-container"
  );

  return {
    container: parentElement,
    children: [element, adjacentPiece],
  };
}

export async function solve(element) {
  const firstPieceLocation = await element.getLocation();
  const sourceSolvedX = parseInt(await element.getAttribute("data-solvedx"));
  const sourceSolvedY = parseInt(await element.getAttribute("data-solvedy"));

  const solvingContainer = await $("#group-container-1111");
  const solvingContainerLocation = await solvingContainer.getLocation();

  const dragCoords = {
    x: parseInt(
      solvingContainerLocation.x + sourceSolvedX - firstPieceLocation.x + 5
    ),
    y: parseInt(
      solvingContainerLocation.y + sourceSolvedY - firstPieceLocation.y + 5
    ),
  };

  element.dragAndDrop(dragCoords);

  await expect(element).toHaveElementClass("grouped");
  const isSolved = await element.getAttribute("data-is-solved");
  await expect(isSolved).toBe("true");

  const parentElement = await element.parentElement();
  await expect(await parentElement.getAttribute("id")).toBe(
    "group-container-1111"
  );
}
