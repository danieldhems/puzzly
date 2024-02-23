import {
  Connection,
  DomBox,
  JigsawPieceData,
  MovableElement,
  SideNames,
} from "./types";
import Utils from "./utils.js";

export const getOppositeSide = (sideName: SideNames) => {
  const map: Partial<Record<SideNames, SideNames>> = {
    [SideNames.Top]: SideNames.Bottom,
    [SideNames.Right]: SideNames.Left,
    [SideNames.Bottom]: SideNames.Top,
    [SideNames.Left]: SideNames.Right,
  };

  return map[sideName];
};

export function checkConnections(element: MovableElement) {
  let connection: Connection | undefined;

  const piece = {
    id: parseInt(element.dataset.pieceId as string),
    group: element.dataset.groupId,
    isSolved: element.dataset.isSolved,
    type: Utils.getPieceType(element),
    connectsTo: element.dataset.connectsTo,
  };

  const shouldCompare = (targetPiece: Partial<JigsawPieceData>) =>
    (piece.group === undefined && targetPiece.groupId === undefined) ||
    piece.group !== targetPiece.groupId;

  if (Utils.isCornerPiece(piece.type)) {
    const cornerConnections = [
      SideNames.TopRight,
      SideNames.BottomRight,
      SideNames.BottomLeft,
      SideNames.TopLeft,
    ];

    let i = 0;
    while (!connection && i < cornerConnections.length) {
      const connectionToCheck = cornerConnections[i];

      const elBB = element.getBoundingClientRect();
      let elBBWithinTolerance = {
        top: elBB.top,
        right: elBB.right,
        bottom: elBB.bottom,
        left: elBB.left,
        width: elBB.width,
        height: elBB.height,
      };

      elBBWithinTolerance = Utils.getElementBoundingBoxRelativeToCorner.call(
        this,
        elBBWithinTolerance,
        connectionToCheck
      );

      const cornerBoundingBox = Utils.getCornerBoundingBox.call(
        this,
        connectionToCheck
      );

      // console.log("checking", connectionToCheck);
      // console.log("elBBWithinTolerance", elBBWithinTolerance);
      // console.log("cornerBoundingBox", cornerBoundingBox);

      if (Utils.hasCollision(elBBWithinTolerance, cornerBoundingBox)) {
        return {
          type: connectionToCheck,
          sourceElement: element,
          isSolving: true,
        };
      }

      i++;
    }
  }

  const connectsTo = JSON.parse(element.dataset.connectsTo as string);

  Object.keys(connectsTo).some((key: SideNames) => {
    // console.log("key", key);
    const targetElement = Utils.getElementByPieceId(connectsTo[key]);
    const { pieceId, groupId, isSolved } = targetElement.dataset;
    const targetPiece = {
      pieceId: parseInt(pieceId as string),
      groupId: groupId,
      isSolved: isSolved === "true",
    };

    let thisPieceConnectorBoundingBox;

    if (shouldCompare(targetPiece)) {
      thisPieceConnectorBoundingBox = Utils.getConnectorBoundingBox(
        element,
        key
      ) as DomBox;

      const oppositeConnection = getOppositeSide(key);

      const targetPieceConnectorBoundingBox = Utils.getConnectorBoundingBox(
        targetElement,
        oppositeConnection as SideNames
      ) as DomBox;

      // console.log("source element", element);
      // console.log("target element", targetElement);

      // console.log(
      // `checking ${key}`,
      // thisPieceConnectorBoundingBox,
      // targetPieceConnectorBoundingBox
      // );

      // Utils.drawBox(thisPieceConnectorBoundingBox);
      // Utils.drawBox(targetPieceConnectorBoundingBox, null, "blue");

      if (
        Utils.hasCollision(
          thisPieceConnectorBoundingBox,
          targetPieceConnectorBoundingBox
        )
      ) {
        return {
          type: key,
          sourceElement: element,
          targetElement,
          isSolving: targetElement.dataset.isSolved === "true",
        };
      }
    }
  });
}
