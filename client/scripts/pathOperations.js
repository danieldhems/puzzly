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

  static getConnectorStringFromPathParts(shapeType) {
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
  }

  // 'Side' is currently treated as top, right, bottom, left, but it should be treated as an indexed portion of a path in order to support
  // irregular shapes that have a minimum of 3 sides.
  static getConnectorBoundingBoxFromPath(sideIndex, path) {
    const pathParts = PathOperations.extractPathParts(path);
    console.log("path parts", pathParts);
    // Once we have the path parts, we can get the side we need from the pathParts array by pointing to the requested index.
    // Increment the index by 1 because the first path part will always be the SVG's moveto command
    const connector = pathParts[1 + sideIndex].connector;
    const controlPoints = [
      { x: connector[1], y: connector[2] },
      { x: connector[3], y: connector[4] },
      { x: connector[5], y: connector[6] },
    ];
    return Utils.getCurveBoundingBox(controlPoints);
  }
}
