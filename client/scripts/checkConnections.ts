import BaseMovable from "./BaseMovable";
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
  const baseMovable = new BaseMovable(window.Puzzly);

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

    const cornerBoundingBox = Utils.getCornerBoundingBox(
      cornerToCheck as SideNames,
      { width: element.offsetWidth, height: element.offsetHeight },
      solvingAreaBox
    ) as DomBox;

    // console.log("checking corner", cornerToCheck);
    // console.log("elBBWithinTolerance", elementBoundingBox);
    // console.log("cornerBoundingBox", cornerBoundingBox);

    // Utils.drawBox({
    //   width: element.offsetWidth,
    //   height: element.offsetHeight,
    //   ...elementBoundingBoxToTolerance,
    // });

    if (
      Utils.hasCollision(
        elementBoundingBox,
        cornerBoundingBox
      )
    ) {
      return {
        type: cornerToCheck,
        sourceElement: element,
        isSolving: true,
      };
    }
  }

  let connection: Connection | undefined;
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

      if (shouldCompare(targetPiece)) {
        const thisPieceInstance = baseMovable.getMovableInstanceFromElement(element);
        const thisPieceConnectorBoundingBoxes = thisPieceInstance.getConnectorBoundingBoxes();

        const targetPieceInstance = baseMovable.getMovableInstanceFromElement(targetElement);
        const targetPieceConnectorBoundingBoxes = targetPieceInstance.getConnectorBoundingBoxes();

        let collisionDetected = false;

        // console.log("source bounding boxes", thisPieceConnectorBoundingBoxes.length)
        // console.log("target bounding boxes", targetPieceConnectorBoundingBoxes.length)

        collisionDetected = thisPieceConnectorBoundingBoxes.some(sourceBox => {
          // Utils.drawBox(sourceBox)
          return targetPieceConnectorBoundingBoxes.some(targetBox => {
            // Utils.drawBox(targetBox)
            // console.log("compare", sourceBox, targetBox)
            if (Utils.hasCollision(sourceBox, targetBox)) {
              // console.log("collision detected")
              return true;
            }
          })
        })

        if (collisionDetected) {
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

  return connection;
}
