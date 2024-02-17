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

export async function getDragCoordsForSinglePiece(element, adjacentPiece) {
  const firstPieceLocation = await element.getLocation();
  const sourceSolvedX = parseInt(await element.getAttribute("data-solvedx"));
  const sourceSolvedY = parseInt(await element.getAttribute("data-solvedy"));

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

  return {
    x: parseInt(dragDest.x - firstPieceLocation.x),
    y: parseInt(dragDest.y - firstPieceLocation.y),
  };
}

export async function getDragCoordsForGroupConnection(
  sourceElement,
  targetElement
) {
  const sourceElementLocation = await sourceElement.getLocation();
  const sourceSolvedX = parseInt(
    await sourceElement.getAttribute("data-solvedx")
  );
  const sourceSolvedY = parseInt(
    await sourceElement.getAttribute("data-solvedy")
  );

  const groupContainerLocation = await targetElement
    .parentElement()
    .getLocation();

  return {
    x: parseInt(
      groupContainerLocation.x + sourceSolvedX - sourceElementLocation.x
    ),
    y: parseInt(
      groupContainerLocation.y + sourceSolvedY - sourceElementLocation.y
    ),
  };
}

export async function dragNearPiece(element, adjacentPiece) {
  const dragCoords = await getDragCoordsForSinglePiece(element, adjacentPiece);
  const tolerance = parseInt(
    await element.getAttribute("data-connector-tolerance")
  );
  console.log("TEST dragCoords", dragCoords);
  dragCoords.x -= parseInt(tolerance + 2);
  dragCoords.y += parseInt(tolerance + 2);
  console.log("TEST deviated dragCoords", dragCoords);

  await element.dragAndDrop(dragCoords);
  await verifyElementHasNotConnected(element);
}

export async function dragNearPieceAndConnect(element, adjacentPiece) {
  const dragCoords = await getDragCoordsForSinglePiece(element, adjacentPiece);
  const tolerance = parseInt(
    await element.getAttribute("data-connector-tolerance")
  );
  dragCoords.x -= parseInt(tolerance - 2);
  dragCoords.y += parseInt(tolerance - 2);
  await element.dragAndDrop(dragCoords);
  await verifyElementHasConnected(element);
}

export async function dragNearGroupedPiece(sourceElement, targetElement) {
  const dragCoords = await getDragCoordsForGroupConnection(
    sourceElement,
    targetElement
  );
  // How close the pieces have to be to each other to connect
  const tolerance = parseInt(
    await sourceElement.getAttribute("data-connector-tolerance")
  );
  dragCoords.x -= parseInt(tolerance + 2);
  dragCoords.y += parseInt(tolerance + 2);
  await sourceElement.dragAndDrop(dragCoords);
  await verifyElementHasNotConnected(sourceElement);
}

export async function dragNearGroupedPieceAndConnect(
  sourceElement,
  targetElement
) {
  const dragCoords = await getDragCoordsForGroupConnection(
    sourceElement,
    targetElement
  );
  // How close the pieces have to be to each other to connect
  const tolerance = parseInt(
    await sourceElement.getAttribute("data-connector-tolerance")
  );
  dragCoords.x -= parseInt(tolerance - 2);
  dragCoords.y += parseInt(tolerance - 2);
  await sourceElement.dragAndDrop(dragCoords);
  await verifyElementHasConnected(sourceElement);
}

export async function dragOutOfBounds(element, opts) {
  const dragTarget = await $("#integration-test-drag-helper");
  await element.dragAndDrop(dragTarget, {
    duration: opts?.duration || 0,
  });
}

export async function getOutOfBoundsCoords(element, opts = null) {
  const playBoundary = $("#play-boundary");

  const elementSize = await element.getSize();
  const elementLocation = await element.getLocation();
  const elementParent = await element.parentElement();
  const elementParentLocation = await elementParent.getLocation();

  const elementClass = await element.getAttribute("class");
  const isGrouped = elementClass.indexOf("grouped") > -1;
  console.log("TEST isGrouped", isGrouped);

  const { width: windowWidth, height: windowHeight } =
    await browser.getWindowSize();

  const { x: playBoundaryX, y: playBoundaryY } =
    await playBoundary.getLocation();

  const dragCoords = {};

  const partial = opts?.partial;

  if (windowWidth > windowHeight) {
    const elementOffset = partial
      ? elementSize.width / 2
      : elementSize.width + 10;

    dragCoords.x = elementLocation.x - playBoundaryX - elementOffset;
    dragCoords.y = elementLocation.y;
  } else if (windowHeight > windowWidth) {
    const elementOffset = partial
      ? elementSize.height / 2
      : elementSize.height + 10;

    dragCoords.x = elementLocation.x;
    dragCoords.y = elementLocation.y - playBoundaryY - elementOffset;
  }

  return dragCoords;
}

export async function verifyElementHasConnected(element) {
  await expect(element).toHaveElementClass("grouped");
  const parentElement = await element.parentElement();
  await expect(parentElement).toHaveElementClass("group-container");
  await expect(await parentElement.getAttribute("id")).not.toBe(
    "pieces-container"
  );
}

export async function verifyElementHasNotConnected(element) {
  await expect(element).not.toHaveElementClass("grouped");
  const parentElement = await element.parentElement();
  await expect(parentElement).not.toHaveElementClass("group-container");
  await expect(await parentElement.getAttribute("id")).toBe("pieces-container");
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

export async function createGroupWithPieces(firstPieceId, secondPieceId) {
  const sourcePiece = await getPiece(firstPieceId);
  const targetPiece = await getPiece(secondPieceId);
  await dragNearPieceAndConnect(sourcePiece, targetPiece);
}

export async function putPieceInPocket(element, pocketId) {
  const pocket = $("¢pocket-0");
  await dragAndDrop(element, pocket, { duration: 2000 });
  await verifyElementIsInPocket(element, pocketId);
}

export async function verifyElementIsInPocket(element, pocketId) {
  expect(element).toHaveElementClass("in-pocket");
  const elementParent = await element.parentElement();
  expect(elementParent.getAttribute("id")).toBe(`pocket-${pocketId}`);
}
