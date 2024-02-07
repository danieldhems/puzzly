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

  const relativeDragDest = {
    y: parseInt(dragReferenceFrame.top + sourceSolvedY),
    x: parseInt(dragReferenceFrame.left + sourceSolvedX),
  };

  // element.dragAndDrop(dragDest);

  // browser.performActions([
  //   {
  //     type: "pointer",
  //     id: "finger1",
  //     parameters: { pointerType: "mouse" },
  //     actions: [
  //       {
  //         type: "pointerDown",
  //         button: 0,
  //         x: firstPieceLocation.x + 10,
  //         y: firstPieceLocation.y + 10,
  //       },
  //       { type: "pointerMove", duration: 5000, origin: element, ...dragDest },
  //       // { type: 'pause', duration: 10 },
  //       // { type: 'pointerMove', duration, origin: $('#droppable'), x: 0, y: 0 },
  //       { type: "pointerUp", button: 0 },
  //     ],
  //   },
  // ]);

  await browser.actions([
    await browser
      .action("pointer")
      .move(
        parseInt(firstPieceLocation.x + 10),
        parseInt(firstPieceLocation.y + 10)
      )
      .down()
      .move(
        parseInt(relativeDragDest.x + 10),
        parseInt(relativeDragDest.y + 10)
      )
      .up(),
  ]);
}

export async function getAdjacentPieceBySide(element, sideIndex) {
  const connectsToString = await element.getAttribute("data-connects-to");
  const connectsTo = JSON.parse(connectsToString);
  const keys = Object.keys(connectsTo);
  return await $(`#piece-${connectsTo[keys[sideIndex]]}`);
}
