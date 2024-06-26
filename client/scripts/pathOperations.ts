import { SHAPE_TYPES } from "./constants.js";
import Utils from "./utils.js";

export default class PathOperations {
  // Example path
  // M 37 37
  // h 43.4
  // c -19 -44, 56 -44, 37 0
  // h 43.4
  // v 43.4
  // c -44 -18.999999999999996, -44 56, 2.2655965784226034e-15 37
  // v 43.4 h -43.4
  // c 19.000000000000007 44, -55.99999999999999 44.00000000000001, -37 4.531193156845207e-15
  // h -43.4 v -43.4
  // c -44 19.000000000000007, -44.00000000000001 -55.99999999999999, -6.79678973526781e-15 -37
  // z

  static extractPathParts(path: string) {
    let currIndex = 0;
    let currPart = "";

    const result = [];
    const stringParts = path.split(" ");

    while (currIndex < stringParts.length) {
      if (/[Mhvcz]/.test(stringParts[currIndex])) {

        if (currPart !== "") {
          result.push(currPart);
        }

        currPart = stringParts[currIndex].trim();

        // FIX: This loop omits the last element in the array, so ensure it gets added
        if (stringParts[currIndex] === "z") {
          result.push(currPart);
        }
      } else {
        currPart += " " + stringParts[currIndex];
      }

      currIndex++;
    }

    return result;
  }

  static getCurvesFromPathParts(pathParts: string[]) {
    // Bounding boxes need to be absolute values to be useful
    // so extract the "M" part for a point of reference
    // and derive all curve coords from this
    const startingPoint = pathParts[0].substring(2).split(", ");

    const curves = [];
    let currentPart: string;

    for (let n = 0, l = pathParts.length; n < l; n++) {
      currentPart = pathParts[n];
      const firstChar = currentPart[0];

      if (firstChar === "c") {
        // Strip the "c " and take the rest of the curve as an
        // array for space-separated coordinate pairs
        curves.push(currentPart.substring(2).split(", "));
      }
    }

    return curves;
  }

  // static getConnectorFromPathPartsForRequestedSide(
  //   shapeType,
  //   pathParts,
  //   connectorIndex,
  //   pieceType
  // ) {
  //   console.log("getConnectorFromPathPartsForRequestedSide");
  //   // console.log("shapeType", shapeType);
  //   console.log("connectorIndex", connectorIndex);
  //   console.log("pieceType", pieceType);

  //   /**
  //    * Given an array of path parts each beginning with a lettered command (h, v or c),
  //    * we should be able to extrapolate the parts for the desired connector by either filtering
  //    * or employing a simple search algorithm.
  //    *
  //    * For plain shapes which comprise of straight horizontal and vertical lines,
  //    * we can filter the parts by those beginning with 'c'.
  //    *
  //    * For natural shapes which comprise of almost all curves,
  //    * we can perform a simple count to get the 'c' for the connector we want
  //    * (every other 'c' part will be for a spline).
  //    */

  //   if (shapeType === SHAPE_TYPES.PLAIN) {
  //     const pos = { x: 0, y: 0 };
  //     const connectors = [];

  //     // Iterate over the pathParts and do two operations:
  //     // 1. Get the absolute position of the desired connector by summing the x and y values in the path that lead to it
  //     // 2. Get the information for the desired connector itself
  //     for (let i = 0, l = pathParts.length; i < l; i++) {
  //       const partArray = pathParts[i].split(" ");
  //       if (/[M]/.test(partArray[0])) {
  //         pos.x = parseInt(partArray[1]);
  //         pos.y = parseInt(partArray[2]);
  //       }
  //       if (/[h]/.test(partArray[0])) {
  //         pos.x += parseInt(partArray[1]);
  //       }
  //       if (/[v]/.test(partArray[0])) {
  //         pos.y += parseInt(partArray[1]);
  //       }
  //       if (/[c]/.test(partArray[0])) {
  //         connectors.push(pathParts[i]);
  //         if (connectors.length === connectorIndex + 1) {
  //           break;
  //         }
  //       }
  //     }

  //     // console.log("position", pos);
  //     // console.log("connectors", connectors);

  //     const requiredConnector = connectors[connectorIndex];
  //     // console.log("required connector", requiredConnector);

  //     const connectorParts = requiredConnector.substring(1).split(", ");
  //     // console.log("connectorParts", connectorParts);
  //     const controlPointsStringConvertedToAbsolute = connectorParts.map(
  //       (connectorPart) => {
  //         const parts = connectorPart.trim().split(" ");
  //         const x = parseInt(parts[0]) + pos.x;
  //         const y = parseInt(parts[1]) + pos.y;
  //         return `${x} ${y}`;
  //       }
  //     );

  //     // console.log("converted", controlPointsStringConvertedToAbsolute);

  //     // Prepend the control points array with the starting position
  //     const originControlPoint = { x: pos.x, y: pos.y };

  //     // Convert all values to number
  //     const absoluteControlPoints = controlPointsStringConvertedToAbsolute.map(
  //       (cp) => {
  //         const arr = cp.split(" ");
  //         return {
  //           x: Math.floor(parseInt(arr[0])),
  //           y: Math.floor(parseInt(arr[1])),
  //         };
  //       }
  //     );

  //     return PathOperations.reorientControlPointCoordinates(
  //       [originControlPoint, ...absoluteControlPoints],
  //       connectorIndex,
  //       pieceType
  //     );
  //   }

  //   if (shapeType === SHAPE_TYPES.NATURAL) {
  //     // TODO: Implement
  //   }
  // }

  // static reorientControlPointCoordinates(
  //   controlPoints,
  //   connectorIndex,
  //   pieceType
  // ) {
  //   console.log("reorientControlPointCoordinates");
  //   console.log("connector index", connectorIndex);
  //   console.log("piece type", pieceType);

  //   const connectorType = pieceType.filter((t) => t !== 0)[connectorIndex];
  //   console.log("connector type", connectorType);
  //   controlPoints.forEach((cp) => console.log(cp));

  //   const lowestX = Math.min(...controlPoints.map((cp) => cp.x));
  //   const lowestY = Math.min(...controlPoints.map((cp) => cp.y));
  //   const highestX = Math.min(...controlPoints.map((cp) => cp.x));
  //   const highestY = Math.min(...controlPoints.map((cp) => cp.y));

  //   const reoriented = [];

  //   // if(connectorType === -1){
  //   //   if(controlPoints[1].)
  //   //   reoriented.push({
  //   //     x: Math.
  //   //   })
  //   // }

  //   return controlPoints;
  // }

  // // 'Side' is currently treated as top, right, bottom, left, but it should be treated as an indexed portion of a path in order to support
  // // irregular shapes that have a minimum of 3 sides.
  // static getConnectorBoundingBoxFromPath(connectorIndex, pieceData, shapeType) {
  //   const { svgPath, type } = pieceData;
  //   const pathParts = PathOperations.extractPathParts(svgPath);
  //   console.log("path parts", pathParts);

  //   const connector = PathOperations.getConnectorFromPathPartsForRequestedSide(
  //     shapeType,
  //     pathParts,
  //     connectorIndex,
  //     type
  //   );
  //   // console.log("connector", connector);

  //   return Utils.getCurveBoundingBox(connector);
  // }
}
