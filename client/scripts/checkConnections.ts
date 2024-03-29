import {
  Connection,
  DomBox,
  JigsawPieceData,
  MovableElement,
  SideNames,
} from "./types";
import Utils from "./utils";

export const getOppositeSide = (sideName: SideNames) => {
  const map: Partial<Record<SideNames, SideNames>> = {
    [SideNames.Top]: SideNames.Bottom,
    [SideNames.Right]: SideNames.Left,
    [SideNames.Bottom]: SideNames.Top,
    [SideNames.Left]: SideNames.Right,
  };

  return map[sideName];
};

export function checkConnections(
  element: MovableElement,
  solvingAreaBox: DomBox,
  connectorTolerance: number
) {
  let connection: Connection | undefined;

  const piece = {
    id: parseInt(element.dataset.pieceId as string),
    group: element.dataset.groupId,
    isSolved: element.dataset.isSolved,
    type: Utils.getPieceType(element),
    connectsTo: element.dataset.connectsTo,
  };

  console.log("checkConnections", piece);

  const shouldCompare = (targetPiece: Partial<JigsawPieceData>) =>
    (piece.group === undefined && targetPiece.groupId === undefined) ||
    piece.group !== targetPiece.groupId;

  if (Utils.isCornerPiece(piece.type)) {
    console.log("piece is corner", piece);
    const cornerConnections = [
      SideNames.TopRight,
      SideNames.BottomRight,
      SideNames.BottomLeft,
      SideNames.TopLeft,
    ];

    let i = 0;
    while (i < cornerConnections.length) {
      const connectionToCheck = cornerConnections[i];

      let elBBWithinTolerance = {
        top: parseInt(element.style.top),
        right: parseInt(element.style.left) + element.offsetWidth,
        bottom: parseInt(element.style.top) + element.offsetHeight,
        left: parseInt(element.style.left),
        width: element.offsetWidth,
        height: element.offsetHeight,
      };

      console.log("solving area box", solvingAreaBox);

      const cornerBoundingBox = Utils.getCornerBoundingBox(
        connectionToCheck,
        solvingAreaBox,
        connectorTolerance
      );

      console.log("checking corner", connectionToCheck);
      console.log("elBBWithinTolerance", elBBWithinTolerance);
      console.log("cornerBoundingBox", cornerBoundingBox);

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

    if (targetElement) {
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

        console.log("source element", element);
        console.log("target element", targetElement);

        console.log(
          `checking ${key}`,
          thisPieceConnectorBoundingBox,
          targetPieceConnectorBoundingBox
        );

        // Utils.drawBox(thisPieceConnectorBoundingBox);
        // Utils.drawBox(targetPieceConnectorBoundingBox, null, "blue");

        if (
          Utils.hasCollision(
            thisPieceConnectorBoundingBox,
            targetPieceConnectorBoundingBox
          )
        ) {
          connection = {
            type: key,
            sourceElement: element,
            targetElement,
            isSolving: targetElement.dataset.isSolved === "true",
          };
        }
      }
    }
  });

  console.log("connection result", connection);
  if (connection) return connection;
}
