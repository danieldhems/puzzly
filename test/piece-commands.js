export async function getPiece(id) {
  return await $(`#piece-${id}`);
}

export async function makeConnection(element, side) {
  const firstPieceLocation = await element.getLocation();
  const sourceSolvedX = parseInt(await element.getAttribute("data-solvedx"));
  const sourceSolvedY = parseInt(await element.getAttribute("data-solvedy"));

  const adjacentPiece = await getAdjacentPieceBySide(element, side);

  const solvedX = parseInt(await adjacentPiece.getAttribute("data-solvedx"));
  const solvedY = parseInt(await adjacentPiece.getAttribute("data-solvedy"));

  const { x, y } = await adjacentPiece.getLocation();

  const dragReferenceFrame = {
    top: y - solvedY,
    left: x - solvedX,
  };

  const dragDest = {
    y: parseInt(dragReferenceFrame.top + sourceSolvedY - firstPieceLocation.y),
    x: parseInt(dragReferenceFrame.left + sourceSolvedX - firstPieceLocation.x),
  };

  element.dragAndDrop(dragDest);
}

export async function getAdjacentPieceBySide(element, sideIndex) {
  const connectsToString = await element.getAttribute("data-connects-to");
  const connectsTo = JSON.parse(connectsToString);
  const keys = Object.keys(connectsTo);
  return await $(`#piece-${connectsTo[keys[sideIndex]]}`);
}
