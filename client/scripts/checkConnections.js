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

  const connections = element.dataset.connections || [];

  const piece = {
    id: parseInt(element.dataset.pieceId),
    group: parseInt(element.dataset.group),
    isSolved: element.dataset.isSolved,
    type: Utils.getPieceType(element),
    connectsTo: element.dataset.connectsTo,
    connections,
  };

  const shouldCompare = (targetPiece) =>
    piece.group === undefined ||
    piece.group === null ||
    piece.group !== targetPiece.group;

  let elBoundingBox = element.getBoundingClientRect();
  let elBBWithinTolerance = { ...elBoundingBox };

  if (Utils.isCornerPiece(piece)) {
    let container;

    if (GroupOperations.hasGroup(piece)) {
      container = GroupOperations.getGroupContainer(element);
    }

    elBBWithinTolerance.top = container
      ? container.offsetTop
      : elBoundingBox.top;
    elBBWithinTolerance.left = container
      ? container.offsetLeft
      : elBoundingBox.left;
    elBBWithinTolerance.right = container
      ? container.offsetLeft + container.offsetWidth
      : elBoundingBox.right;
    elBBWithinTolerance.bottom = container
      ? container.offsetTop + container.offsetHeight
      : elBoundingBox.bottom;

    if (Utils.isTopLeftCorner(piece)) {
      elBBWithinTolerance.right = elBoundingBox.left + this.connectorTolerance;
      elBBWithinTolerance.bottom = elBoundingBox.top + this.connectorTolerance;

      if (
        Utils.hasCollision(
          elBBWithinTolerance,
          Utils.getTopLeftCornerBoundingBox.call(this)
        )
      ) {
        return "top-left";
      }
    }
    if (Utils.isTopRightCorner(piece)) {
      elBBWithinTolerance.left = elBoundingBox.right - this.connectorTolerance;
      elBBWithinTolerance.bottom = elBoundingBox.top + this.connectorTolerance;
      if (
        Utils.hasCollision(
          elBBWithinTolerance,
          Utils.getTopRightCornerBoundingBox.call(this)
        )
      ) {
        return "top-right";
      }
    }
    if (Utils.isBottomRightCorner(piece)) {
      elBBWithinTolerance.left = elBoundingBox.right - this.connectorTolerance;
      elBBWithinTolerance.top = elBoundingBox.bottom - this.connectorTolerance;
      if (
        Utils.hasCollision(
          elBBWithinTolerance,
          Utils.getBottomRightCornerBoundingBox.call(this)
        )
      ) {
        return "bottom-right";
      }
    }
    if (Utils.isBottomLeftCorner(piece)) {
      elBBWithinTolerance.right = elBoundingBox.left + this.connectorTolerance;
      elBBWithinTolerance.top = elBoundingBox.bottom - this.connectorTolerance;
      if (
        Utils.hasCollision(
          elBBWithinTolerance,
          Utils.getBottomLeftCornerBoundingBox.call(this)
        )
      ) {
        return "bottom-left";
      }
    }
  }

  console.log(element.dataset);
  const connectsTo = JSON.parse(element.dataset.connectsTo);
  let connection;

  const hasConnectionWithAnotherPiece = Object.keys(connectsTo).some(
    (key, i) => {
      console.log("key", key);
      const targetElement = Utils.getElementByPieceId(connectsTo[key]);
      const { pieceId, group, isSolved } = targetElement.dataset;
      const targetPiece = {
        pieceId: parseInt(pieceId),
        group: parseInt(group) || undefined,
        isSolved: isSolved === "true",
      };

      let thisPieceConnectorBoundingBoxRight;

      if (shouldCompare(targetPiece)) {
        if (GroupOperations.hasGroup(piece)) {
          const container = GroupOperations.getGroupTopContainer(element);
          const containerBoundingBox = Utils.getStyleBoundingBox(container);
          thisPieceConnectorBoundingBoxRight =
            Utils.getConnectorBoundingBoxInGroup.call(
              this,
              element,
              key,
              containerBoundingBox
            );
        } else {
          thisPieceConnectorBoundingBoxRight =
            Utils.getConnectorBoundingBox.call(this, key);
        }

        let targetPieceConnectorBoundingBox;

        const oppositeConnection = getOppositeSide(key);
        if (GroupOperations.hasGroup(targetPiece)) {
          const targetContainer =
            GroupOperations.getGroupTopContainer(targetElement);
          const targetContainerBoundingBox =
            Utils.getStyleBoundingBox(targetContainer);
          targetPieceConnectorBoundingBox =
            Utils.getConnectorBoundingBoxInGroup.call(
              this,
              targetElement,
              oppositeConnection,
              targetContainerBoundingBox
            );
        } else {
          targetPieceConnectorBoundingBox = Utils.getConnectorBoundingBox.call(
            this,
            oppositeConnection,
            targetElement
          );
        }

        // console.log(
        //   `checking ${key}`,
        //   thisPieceConnectorBoundingBoxRight,
        //   targetPieceConnectorBoundingBox
        // );
        if (
          Utils.hasCollision(
            thisPieceConnectorBoundingBoxRight,
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
          };
          return true;
        }
      }
    }
  );

  if (hasConnectionWithAnotherPiece) {
    return connection;
  }
}
