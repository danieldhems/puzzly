import {
  Connection,
  DomBox,
  DomBoxWithoutDimensions,
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

  // console.log("checkConnections", piece);

  const shouldCompare = (targetPiece: Partial<JigsawPieceData>) =>
    (piece.group === undefined && targetPiece.groupId === undefined) ||
    piece.group !== targetPiece.groupId;

  if (Utils.isCornerPiece(piece.type)) {
    // console.log("piece is corner", piece);

    const cornerToCheck = Utils.getCornerNameForPiece(piece.type);

    const elementBoundingBox = Utils.getElementBoundingBox(element);
    const elementBoundingBoxToTolerance = Utils.narrowBoundingBoxToTolerance(
      elementBoundingBox,
      connectorTolerance
    );

    const cornerBoundingBox = Utils.getCornerBoundingBox(
      cornerToCheck as SideNames,
      { width: element.offsetWidth, height: element.offsetHeight },
      solvingAreaBox
    ) as DomBoxWithoutDimensions;

    const cornerBoundingBoxToTolerance = Utils.narrowBoundingBoxToTolerance(
      cornerBoundingBox,
      connectorTolerance
    );

    // console.log("checking corner", cornerToCheck);
    // console.log("elBBWithinTolerance", elementBoundingBoxToTolerance);
    // console.log("cornerBoundingBox", cornerBoundingBoxToTolerance);

    // Utils.drawBox({
    //   width: element.offsetWidth,
    //   height: element.offsetHeight,
    //   ...elementBoundingBoxToTolerance,
    // });

    if (
      Utils.hasCollision(
        elementBoundingBoxToTolerance,
        cornerBoundingBoxToTolerance
      )
    ) {
      return {
        type: cornerToCheck,
        sourceElement: element,
        isSolving: true,
      };
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

        // console.log("source element", element);
        // console.log("target element", targetElement);

        // console.log(
        //   `checking ${key}`,
        //   thisPieceConnectorBoundingBox,
        //   targetPieceConnectorBoundingBox
        // );

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
