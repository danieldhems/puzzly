import GroupOperations from "./GroupOperations.js";
import Utils from "./utils.js";

export const getOppositeSide = (connection) => {
  const map = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  };

  return map[connection];
};

export function checkConnections(element) {
  let cornerConnectionFound;
  let connection;

  const piece = {
    id: parseInt(element.dataset.pieceId),
    group: element.dataset.groupId,
    isSolved: element.dataset.isSolved,
    type: Utils.getPieceType(element),
    connectsTo: element.dataset.connectsTo,
  };

  const shouldCompare = (targetPiece) =>
    piece.group === undefined ||
    piece.group === null ||
    piece.group !== targetPiece.group;

  if (Utils.isCornerPiece(piece)) {
    const cornerConnections = [
      "top-right",
      "bottom-right",
      "bottom-left",
      "top-left",
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
        connection = {
          type: connectionToCheck,
          sourceElement: element,
          isSolving: true,
        };
      }

      i++;
    }
  }

  const connectsTo = JSON.parse(element.dataset.connectsTo);

  Object.keys(connectsTo).some((key, i) => {
    // console.log("key", key);
    const targetElement = Utils.getElementByPieceId(connectsTo[key]);
    const { pieceId, groupId, isSolved } = targetElement.dataset;
    const targetPiece = {
      pieceId: parseInt(pieceId),
      group: groupId || undefined,
      isSolved: isSolved === "true",
    };

    let thisPieceConnectorBoundingBox;

    if (shouldCompare(targetPiece)) {
      thisPieceConnectorBoundingBox = Utils.getConnectorBoundingBox.call(
        this,
        element,
        key
      );

      const oppositeConnection = getOppositeSide(key);

      const targetPieceConnectorBoundingBox =
        Utils.getConnectorBoundingBox.call(
          this,
          targetElement,
          oppositeConnection
        );

      // console.log("source element", element);
      // console.log("target element", targetElement);

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
          targetPieceConnectorBoundingBox,
          element,
          targetElement
        )
      ) {
        connection = {
          type: key,
          sourceElement: element,
          targetElement:
            cornerConnectionFound !== "float" &&
            !Utils.isCornerConnection(cornerConnectionFound) &&
            targetElement,
          isSolving: GroupOperations.isGroupSolved(
            GroupOperations.getGroup(targetElement)
          ),
        };
        return true;
      }
    }
  });

  return connection;
}
