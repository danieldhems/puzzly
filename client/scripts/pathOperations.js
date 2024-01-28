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

  static extractPathParts(path) {
    let currIndex = 0;
    let currPart = "";
    const result = [];

    while (currIndex < path.length) {
      const currCharacter = path.charAt(currIndex);
      if (/^[Mhvc]$/.test(currCharacter)) {
        if (currPart !== "") {
          result.push(currPart.trim());
        }
        currPart = currCharacter;
      } else {
        currPart += currCharacter;
      }
      currIndex++;
    }

    return result;
  }

  static getConnectorFromPathPartsForRequestedSide(
    shapeType,
    pathParts,
    sideIndex
  ) {
    // console.log("getConnectorFromPathPartsForRequestedSide", sideIndex);

    /**
     * Given an array of path parts each beginning with a lettered command (h, v or c),
     * we should be able to extrapolate the parts for the desired connector by either filtering
     * or employing a simple search algorithm.
     *
     * For plain shapes which comprise of straight horizontal and vertical lines,
     * we can filter the parts by those beginning with 'c'.
     *
     * For natural shapes which comprise of almost all curves,
     * we can perform a simple count to get the 'c' for the connector we want
     * (every other 'c' part will be for a spline).
     */

    // const filteredParts = pathParts.filter((part) => /[c]/.test(part));
    // console.log("filteredParts", filteredParts);

    if (shapeType === SHAPE_TYPES.PLAIN) {
      const pos = { x: 0, y: 0 };
      const connectors = [];

      // Iterate over the pathParts and do two operations:
      // 1. Get the absolute position of the desired connector by summing the x and y values in the path that lead to it
      // 2. Get the information for the desired connector itself
      for (let i = 0, l = pathParts.length; i < l; i++) {
        const partArray = pathParts[i].split(" ");
        if (/[M]/.test(partArray[0])) {
          pos.x = parseInt(partArray[1]);
          pos.y = parseInt(partArray[2]);
        }
        if (/[h]/.test(partArray[0])) {
          pos.x += parseInt(partArray[1]);
        }
        if (/[v]/.test(partArray[0])) {
          pos.y += parseInt(partArray[1]);
        }
        if (/[c]/.test(partArray[0])) {
          connectors.push(pathParts[i]);
          if (connectors.length === sideIndex + 1) {
            break;
          }
        }
      }

      // console.log("position", pos);
      // console.log("connectors", connectors);

      const requiredConnector = connectors[sideIndex];

      const connectorParts = requiredConnector.substring(1).split(", ");
      // console.log("connectorParts", connectorParts);
      const controlPointsStringConvertedToAbsolute = connectorParts.map(
        (connectorPart) => {
          const parts = connectorPart.trim().split(" ");
          const x = parseInt(parts[0]) + pos.x;
          const y = parseInt(parts[1]) + pos.y;
          return `${x} ${y}`;
        }
      );

      // console.log("converted", controlPointsStringConvertedToAbsolute);

      // Prepend the control points array with the starting position
      const originControlPoints = { x: pos.x, y: pos.y };

      // Convert all values to number and
      const absoluteControlPoints = controlPointsStringConvertedToAbsolute.map(
        (cp) => {
          const arr = cp.split(" ");
          return { x: parseInt(arr[0]), y: parseInt(arr[1]) };
        }
      );

      return [originControlPoints, ...absoluteControlPoints];
    }

    if (shapeType === SHAPE_TYPES.NATURAL) {
      // TODO: Implement
      return filteredParts[1 + sideIndex];
    }
  }

  // 'Side' is currently treated as top, right, bottom, left, but it should be treated as an indexed portion of a path in order to support
  // irregular shapes that have a minimum of 3 sides.
  static getConnectorBoundingBoxFromPath(sideIndex, path, shapeType) {
    const pathParts = PathOperations.extractPathParts(path);
    // console.log("path parts", pathParts);

    const connector = PathOperations.getConnectorFromPathPartsForRequestedSide(
      shapeType,
      pathParts,
      sideIndex
    );
    // console.log("connector", connector);

    return Utils.getCurveBoundingBox(connector);
  }
}
