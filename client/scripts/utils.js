import { ELEMENT_IDS, PUZZLE_PIECE_CLASSES } from "./constants.js";
import GroupOperations from "./GroupOperations.js";

const Utils = {
  hasCollision(source, target) {
    if (
      [
        source.left,
        source.right,
        source.bottom,
        source.top,
        target.left,
        target.top,
        target.right,
        target.bottom,
      ].includes(NaN)
    )
      return false;

    const sourceBB = source;
    const targetBB = target;
    return !(
      sourceBB.left >= targetBB.right ||
      sourceBB.top >= targetBB.bottom ||
      sourceBB.right <= targetBB.left ||
      sourceBB.bottom <= targetBB.top
    );
  },

  isInside(source, target) {
    return (
      source.top >= target.top &&
      source.right <= target.right &&
      source.bottom <= target.bottom &&
      source.left >= target.left
    );
  },

  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   */
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  getQueryStringValue(key) {
    return decodeURIComponent(
      window.location.search.replace(
        new RegExp(
          "^(?:.*[&\\?]" +
            encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
            "(?:\\=([^&]*))?)?.*$",
          "i"
        ),
        "$1"
      )
    );
  },

  getIsSolved(el) {
    return el.dataset.isSolved === "true";
  },

  isTopSide(piece) {
    return (
      piece && piece.type[0] === 0 && piece.type[1] !== 0 && piece.type[3] !== 0
    );
  },

  isTopRightCorner(piece) {
    return piece && piece.type[0] === 0 && piece.type[1] === 0;
  },

  isTopLeftCorner(piece) {
    return piece && piece.type[0] === 0 && piece.type[3] === 0;
  },

  isLeftSide(piece) {
    return (
      piece && piece.type[0] !== 0 && piece.type[2] !== 0 && piece.type[3] === 0
    );
  },

  isInnerPiece(piece) {
    return (
      piece &&
      piece.type[0] !== 0 &&
      piece.type[1] !== 0 &&
      piece.type[2] !== 0 &&
      piece.type[3] !== 0
    );
  },

  isRightSide(piece) {
    return (
      piece && piece.type[0] !== 0 && piece.type[1] === 0 && piece.type[2] !== 0
    );
  },

  isTopEdgePiece(piece) {
    return piece && piece.type[0] === 0;
  },

  isRightEdgePiece(piece) {
    return piece && piece.type[1] === 0;
  },

  isBottomEdgePiece(piece) {
    return piece && piece.type[2] === 0;
  },

  isLeftEdgePiece(piece) {
    return piece && piece.type[3] === 0;
  },

  isBottomLeftCorner(piece) {
    return piece && piece.type[2] === 0 && piece.type[3] === 0;
  },

  isBottomSide(piece) {
    return (
      piece && piece.type[1] !== 0 && piece.type[2] === 0 && piece.type[3] !== 0
    );
  },

  isSidePiece(piece) {
    return piece && piece.type.filter((t) => t === 0).length === 1;
  },

  isBottomRightCorner(piece) {
    return piece && piece.type[1] === 0 && piece.type[2] === 0;
  },

  isCornerPiece(piece) {
    return (
      this.isTopLeftCorner(piece) ||
      this.isTopRightCorner(piece) ||
      this.isBottomRightCorner(piece) ||
      this.isBottomLeftCorner(piece)
    );
  },

  isCornerConnection(str) {
    return (
      str === "top-left" ||
      str === "top-right" ||
      str === "bottom-right" ||
      str === "bottom-left"
    );
  },

  isEdgePiece(piece) {
    return this.isSidePiece(piece) || this.isCornerPiece(piece);
  },

  has(type, connector, side) {
    if (!connector || !side) return false;
    const c = connector === "plug" ? 1 : connector === "socket" ? -1 : null;
    const s =
      side === "top"
        ? 0
        : side === "right"
        ? 1
        : side === "bottom"
        ? 2
        : side === "left"
        ? 3
        : null;
    return type[s] === c;
  },

  getPieceType(element) {
    return element.dataset.jigsawType.split(",").map((t) => parseInt(t));
  },

  getPuzzlePiecesInContainer(element) {
    return element.querySelectorAll(".puzzle-piece");
  },

  isAdjacent(pieceAId, pieceBId, numPiecesHorizontal) {
    const pieceToRightId = pieceAId + 1;
    const pieceToBottomRightId = pieceAId + numPiecesHorizontal + 1;
    const pieceToBottomLefttId = pieceAId + numPiecesHorizontal - 1;
    const pieceToLeftId = pieceAId - 1;
    const pieceToTopId = pieceAId - numPiecesHorizontal;
    const pieceToTopRightId = pieceAId - numPiecesHorizontal + 1;
    const pieceToTopLeftId = pieceAId - numPiecesHorizontal - 1;
    const pieceToBottomId = pieceAId + numPiecesHorizontal;
    return (
      pieceToRightId === pieceBId ||
      pieceToLeftId === pieceBId ||
      pieceToTopId === pieceBId ||
      pieceToBottomId === pieceBId ||
      pieceToBottomLefttId === pieceBId ||
      pieceToBottomRightId === pieceBId ||
      pieceToTopLeftId === pieceBId ||
      pieceToTopRightId === pieceBId
    );
  },

  querySelectorFrom(selector, elements) {
    return [].filter.call(elements, function (element) {
      return element.matches(selector);
    });
  },

  adjustForZoomLevel(obj, zoomLevel) {
    return {
      top: obj.top && obj.top * zoomLevel,
      right: obj.right && obj.right * zoomLevel,
      bottom: obj.bottom && obj.bottom * zoomLevel,
      left: obj.left && obj.left * zoomLevel,
    };
  },

  getPieceFromElement(el) {
    if (!el) return;

    const data = {};
    data.id = parseInt(el.dataset.pieceId);
    data._id = parseInt(el.dataset.pieceIdInPersistence);
    data.puzzleId = parseInt(el.dataset.puzzleId);
    data.imgX = parseFloat(el.dataset.imgX);
    data.imgY = parseFloat(el.dataset.imgY);
    data.imgY = parseFloat(el.dataset.imgY);
    data.imgY = parseFloat(el.dataset.imgY);
    data.solvedX = parseInt(el.dataset.solvedX);
    data.solvedX = parseInt(el.dataset.solvedX);
    data.solvedX = parseInt(el.dataset.solvedX);
    data.solvedY = parseInt(el.dataset.solvedY);
    data.solvedY = parseInt(el.dataset.solvedY);
    data.solvedY = parseInt(el.dataset.solvedY);
    data.imgW = parseInt(el.dataset.imgW);
    data.imgW = parseInt(el.dataset.imgW);
    data.imgW = parseInt(el.dataset.imgW);
    data.imgH = parseInt(el.dataset.imgH);
    data.numPiecesFromTopEdge = parseInt(el.dataset.numPiecesFromTopEdge);
    data.numPiecesFromLeftEdge = parseInt(el.dataset.numPiecesFromLeftEdge);

    const type = el.dataset["jigsawType"];
    if (type) {
      data.type = type.split(",").map((n) => parseInt(n));
    } else {
      console.warn(`Can't get type for piece ${el.toString()}`);
    }

    const connections = el.dataset.connections;
    data.connections = connections
      ? connections.indexOf(",") > 0
        ? connections.split(",")
        : [connections]
      : [];

    data.connectsTo = el.dataset["connectsTo"];

    const isInnerPiece = el.dataset["isInnerPiece"];
    data.isInnerPiece = isInnerPiece == "true" ? true : false;

    let groupIsSolved;
    if (GroupOperations.getGroup(el)) {
      const container = GroupOperations.getGroupContainer(
        parseInt(el.parentNode.dataset.group)
      );
      if (container.dataset["isSolved"]) {
        groupIsSolved = true;
      }
    }
    //stout
    data.isSolved = el.dataset.isSolved === "true" || groupIsSolved;
    data.group = GroupOperations.getGroup(el);
    data.imageUri = el.dataset["imageUri"];
    data.pocketId = parseInt(el.dataset["pocketId"]);

    data.pageX = parseInt(el.style.left);
    data.pageY = parseInt(el.style.top);

    if (GroupOperations.hasGroup({ group: GroupOperations.getGroup(el) })) {
      data.containerX = el.parentNode.offsetLeft;
      data.containerY = el.parentNode.offsetTop;
    }

    return data;
  },

  isMobile() {
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  },

  drawBackground() {
    const path = "./bg-wood.jpg";
    const BgImage = new Image();
    const BackgroundCanvas = document.getElementById("canvas");
    BackgroundCanvas.style.position = "absolute";
    BackgroundCanvas.style.top = 0;
    BackgroundCanvas.style.left = 0;
    BackgroundCanvas.style.width = "100%";
    BackgroundCanvas.style.height = "100%";
    BgImage.addEventListener("load", () => {
      BackgroundCanvas.style.backgroundImage = `url(${path})`;
    });
    BgImage.src = path;
  },

  insertUrlParam(key, value) {
    if (history.pushState) {
      let searchParams = new URLSearchParams(window.location.search);
      searchParams.set(key, value);
      let newurl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?" +
        searchParams.toString();
      window.history.pushState({ path: newurl }, "", newurl);
    }
  },

  getElementByPieceId(id) {
    return document.querySelectorAll(`[data-piece-id='${id}']`)[0];
  },

  isOutOfBounds(element) {
    const elBox = element.getBoundingClientRect();
    return !Utils.isInside(elBox, cnvBox) && !Utils.isOverPockets(element);
  },

  isBoxOutOfBounds(box) {
    const cnvBox = document
      .querySelector(`#${ELEMENT_IDS.PLAY_BOUNDARY}`)
      .getBoundingClientRect();
    const pocketsBox = document
      .querySelector("#pockets")
      .getBoundingClientRect();
    return (
      !Utils.isInside(box, cnvBox) && !Utils.isOverPockets(box, pocketsBox)
    );
  },

  isOverPlayBoundaryAndPockets(element) {
    const cnvBox = document
      .querySelector(`#${ELEMENT_IDS.PLAY_BOUNDARY}`)
      .getBoundingClientRect();
    const pocketsBox = document
      .querySelector("#pockets")
      .getBoundingClientRect();
    const bb = element.getBoundingClientRect();
    return Utils.hasCollision(bb, cnvBox) && Utils.hasCollision(bb, pocketsBox);
  },

  isNumber(val) {
    return val !== undefined && val !== null && Number.isInteger(val);
  },

  getPxString(value) {
    return value + "px";
  },

  getPieceIdFromElement(element) {
    return element.dataset["piece-id"];
  },

  getGroupIdFromElement(element) {
    return element.dataset.group;
  },

  getElementsInGroupByElement(groupedElement) {
    const groupId = this.GroupOperations.getGroupIdByElement(groupedElement);
    return Array.from(document.querySelectorAll(`[data-group='${groupId}']`));
  },

  getTopLeftCornerBoundingBox() {
    const box = this.solvingArea.getBoundingClientRect();
    return {
      top: box.top,
      right: box.left + this.connectorTolerance,
      bottom: box.top + this.connectorTolerance,
      left: box.left,
    };
  },

  getTopRightCornerBoundingBox() {
    const box = this.solvingArea.getBoundingClientRect();
    return {
      top: box.top,
      right: box.right,
      bottom: box.top + this.connectorTolerance,
      left: box.right - this.connectorTolerance,
    };
  },

  getBottomRightCornerBoundingBox() {
    const box = this.solvingArea.getBoundingClientRect();
    return {
      top: box.bottom - this.connectorTolerance,
      right: box.right,
      bottom: box.bottom,
      left: box.right - this.connectorTolerance,
    };
  },

  getBottomLeftCornerBoundingBox() {
    const box = this.solvingArea.getBoundingClientRect();
    return {
      top: box.bottom - this.connectorTolerance,
      right: box.left + this.connectorTolerance,
      bottom: box.bottom,
      left: box.left,
    };
  },

  getConnectorBoundingBox(side, targetElement = null) {
    const element = targetElement || this.element;
    const piece = {
      type: Utils.getPieceType(element),
    };
    const hasLeftPlug = Utils.has(piece.type, "plug", "left");
    const hasTopPlug = Utils.has(piece.type, "plug", "top");

    const tolerance = this.connectorTolerance;
    let box;

    // console.log("connectorsize", this.connectorSize);
    // console.log("tolerance setting", this.connectorTolerance);

    const topBoundary = hasTopPlug
      ? this.connectorDistanceFromCorner + this.connectorSize
      : this.connectorDistanceFromCorner;
    const leftBoundary = hasLeftPlug
      ? this.connectorDistanceFromCorner + this.connectorSize
      : this.connectorDistanceFromCorner;

    switch (side) {
      case "left":
        box = {
          top: element.offsetTop + topBoundary + tolerance,
          right: element.offsetLeft + this.connectorSize - tolerance,
          bottom:
            element.offsetTop + topBoundary + this.connectorSize - tolerance,
          left: element.offsetLeft + tolerance,
        };
        break;
      case "right":
        box = {
          top: element.offsetTop + topBoundary + tolerance,
          right: element.offsetLeft + element.offsetWidth - tolerance,
          bottom:
            element.offsetTop + topBoundary + this.connectorSize - tolerance,
          left:
            element.offsetLeft +
            element.offsetWidth -
            this.connectorSize +
            tolerance,
        };
        break;
      case "bottom":
        box = {
          top:
            element.offsetTop +
            element.offsetHeight -
            this.connectorSize +
            tolerance -
            this.shadowOffset,
          right:
            element.offsetLeft + leftBoundary + this.connectorSize - tolerance,
          bottom:
            element.offsetTop +
            element.offsetHeight -
            tolerance -
            this.shadowOffset,
          left: element.offsetLeft + leftBoundary + tolerance,
        };
        break;
      case "top":
        box = {
          top: element.offsetTop + tolerance,
          right:
            element.offsetLeft + leftBoundary + this.connectorSize - tolerance,
          bottom: element.offsetTop + this.connectorSize - tolerance,
          left: element.offsetLeft + leftBoundary + tolerance,
        };
        break;
    }

    return box;
  },

  getConnectorBoundingBoxInGroup(element, connector, containerBoundingBox) {
    // console.log("getting connector bounding box in group", element, connector, containerBoundingBox)
    const piece = {
      type: Utils.getPieceType(element),
    };

    const hasLeftPlug = Utils.has(piece.type, "plug", "left");
    const hasTopPlug = Utils.has(piece.type, "plug", "top");
    const tolerance = this.connectorTolerance;

    switch (connector) {
      case "right":
        return {
          top:
            containerBoundingBox.top +
            element.offsetTop +
            (hasTopPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            tolerance,
          right:
            containerBoundingBox.left +
            element.offsetLeft +
            element.offsetWidth -
            tolerance,
          bottom:
            containerBoundingBox.top +
            element.offsetTop +
            (hasTopPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            this.connectorSize -
            tolerance,
          left:
            containerBoundingBox.left +
            element.offsetLeft +
            element.offsetWidth -
            this.connectorSize +
            tolerance,
        };

      case "bottom":
        return {
          top:
            containerBoundingBox.top +
            element.offsetTop +
            element.offsetHeight -
            this.connectorSize +
            tolerance,
          right:
            containerBoundingBox.left +
            element.offsetLeft +
            (hasLeftPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            this.connectorSize -
            tolerance,
          bottom:
            containerBoundingBox.top +
            element.offsetTop +
            element.offsetHeight -
            tolerance,
          left:
            containerBoundingBox.left +
            element.offsetLeft +
            (hasLeftPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            tolerance,
        };

      case "left":
        return {
          top:
            containerBoundingBox.top +
            element.offsetTop +
            (hasTopPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            tolerance,
          right:
            containerBoundingBox.left +
            element.offsetLeft +
            this.connectorSize -
            tolerance,
          bottom:
            containerBoundingBox.top +
            element.offsetTop +
            (hasTopPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            this.connectorSize -
            tolerance,
          left: containerBoundingBox.left + element.offsetLeft + tolerance,
        };

      case "top":
        return {
          top: containerBoundingBox.top + element.offsetTop + tolerance,
          right:
            containerBoundingBox.left +
            element.offsetLeft +
            (hasLeftPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            this.connectorSize -
            tolerance,
          bottom:
            containerBoundingBox.top +
            element.offsetTop +
            this.connectorSize -
            tolerance,
          left:
            containerBoundingBox.left +
            element.offsetLeft +
            (hasLeftPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            tolerance,
        };
    }
  },

  getElementBoundingBoxForFloatDetection(element, drawBoundingBox = false) {
    const hasGroup = !!element.dataset.group;

    const diffX = element.offsetWidth / 2 - this.floatTolerance / 2;
    const diffY = element.offsetHeight / 2 - this.floatTolerance / 2;

    const pos = {
      top: hasGroup
        ? element.parentNode.offsetTop + element.offsetTop
        : element.offsetTop,
      right: hasGroup
        ? element.parentNode.offsetLeft + element.offsetLeft + diffX
        : element.offsetLeft + diffX,
      bottom: hasGroup
        ? element.parentNode.offsetTop + element.offsetTop + diffY
        : element.offsetTop + diffY,
      left: hasGroup
        ? element.parentNode.offsetLeft + element.offsetLeft
        : element.offsetLeft,
    };

    // console.log("getElementBoundingBoxForFloatDetection", pos)

    const box = {
      top: pos.top + this.floatTolerance,
      right: pos.right + this.floatTolerance,
      bottom: pos.bottom + this.floatTolerance,
      left: pos.left + this.floatTolerance,
    };

    if (drawBoundingBox) {
      this.drawBoundingBox(box);
    }

    return box;
  },

  getPieceSolvedBoundingBox(el) {
    const solvedX = parseInt(el.dataset.solvedx);
    const solvedY = parseInt(el.dataset.solvedy);

    // const top = this.boardTop + solvedY;
    // const right = this.boardLeft + solvedX + el.offsetLeft + this.collisionBoxWidth;
    // const bottom = this.boardTop + solvedY + el.offsetTop + this.collisionBoxWidth;
    // const left = this.boardLeft + solvedX;

    const boardBox = Utils.getStyleBoundingBox(this.solvingArea);

    const diffX = el.offsetWidth / 2 - this.floatTolerance / 2;
    const diffY = el.offsetHeight / 2 - this.floatTolerance / 2;

    const box = {
      top: boardBox.top + solvedY + diffY,
      right: boardBox.left + solvedX + diffX + this.floatTolerance / 2,
      bottom: boardBox.top + solvedY + diffY + this.floatTolerance / 2,
      left: boardBox.left + solvedX + diffX,
    };

    return box;
  },

  drawBox(box, container = null, borderColor = null) {
    const div = document.createElement("div");
    div.classList.add("bounding-box-indicator");
    div.style.position = "absolute";
    div.style.zIndex = 100;
    div.style.top = (box.top || box.y) + "px";
    div.style.left = (box.left || box.x) + "px";
    div.style.width = (box.width || box.right - box.left || 1) + "px";
    div.style.height = (box.height || box.bottom - box.top || 1) + "px";
    div.style.border = `5px solid ${borderColor || "green"}`;
    div.style.pointerEvents = "none";
    if (container) {
      container.appendChild(div);
    } else {
      document.body.appendChild(div);
    }
  },

  removeAllBoundingBoxIndicators() {
    const elements = document.querySelectorAll(".bounding-box-indicator");
    if (elements.length > 0) {
      elements.forEach((el) => el.remove());
    }
  },

  getBoundingBoxForOffset(element) {
    return element
      ? {
          top: element.offsetTop,
          right: element.offsetLeft + element.offsetWidth,
          bottom: element.offsetTop + element.offsetHeight,
          left: element.offsetLeft,
          width: element.offsetWidth,
          height: element.offsetHeight,
        }
      : null;
  },

  getStyleBoundingBox(element) {
    const top = parseInt(element.style.top);
    const left = parseInt(element.style.left);
    return element
      ? {
          top,
          right: left + element.offsetWidth,
          bottom: top + element.offsetHeight,
          left,
          width: element.offsetWidth,
          height: element.offsetHeight,
        }
      : null;
  },

  getPositionRelativeToContainer(elementRect, containerRect, zoomLevel) {
    const pieceOffsetWithCanvasX = elementRect.left - containerRect.left;
    const pieceOffsetWithCanvasY = elementRect.top - containerRect.top;

    const piecePercX = (pieceOffsetWithCanvasX / containerRect.width) * 100;
    const piecePercY = (pieceOffsetWithCanvasY / containerRect.height) * 100;

    const x =
      containerRect.left === 0
        ? elementRect.left - containerRect.left
        : (containerRect.width / 100) * piecePercX;
    const y =
      containerRect.top === 0
        ? elementRect.top - containerRect.top
        : (containerRect.height / 100) * piecePercY;

    return {
      y: y / zoomLevel,
      x: x / zoomLevel,
    };
  },

  getPositionRelativeTo(sourceBox, targetBox, zoomLevel) {
    const sourceOffsetLeft = sourceBox.left - targetBox.left;
    const sourceOffsetTop = sourceBox.top - targetBox.top;

    const percX = (sourceOffsetLeft / targetBox.width) * 100;
    const percY = (sourceOffsetTop / targetBox.height) * 100;

    const x = (targetBox.width / 100) * percX;
    const y = (targetBox.height / 100) * percY;

    return {
      y,
      x,
    };
  },

  getEventBox(e) {
    return {
      top: e.clientY,
      right: e.clientX,
      bottom: e.clientY,
      left: e.clientX,
    };
  },

  getIndividualPiecesOnCanvas() {
    const pieces = document.querySelectorAll(".puzzle-piece");
    return Array.from(pieces).filter((el) => {
      return (
        !el.dataset.issolved &&
        !el.dataset.group &&
        !el.classList.contains("in-pocket")
      );
    });
  },

  requestSave(pieces) {
    const event = new CustomEvent("puzzly_save", { detail: { pieces } });
    window.dispatchEvent(event);
  },

  isOverPockets(box) {
    if (!box) return;
    const pocketsBox = document
      .querySelector("#pockets")
      .getBoundingClientRect();

    // Utils.drawBox(box);
    // Utils.drawBox(pocketsBox);
    return Utils.hasCollision(box, pocketsBox);
  },

  isPuzzlePiece(target) {
    const classes = target.classList;
    return (
      PUZZLE_PIECE_CLASSES.some((c) => classes.contains(c)) &&
      !classes.contains("in-pocket")
    );
  },

  getPuzzlePieceElementFromEvent(e) {
    const classes = e.target?.classList;

    if (!classes) return;

    const isPuzzlePiece = classes.contains("puzzle-piece");
    const isPuzzlePieceLayerElement = classes.contains("puzzle-piece-fg");

    if (isPuzzlePiece) {
      return e.target;
    }

    if (isPuzzlePieceLayerElement) {
      return e.target.parentNode;
    }
  },

  elementIsInDragContainer(element) {
    return (
      element.parentNode.id === ELEMENT_IDS.DRAGANDSELECT_CONTAINER ||
      element.parentNode.id === ELEMENT_IDS.POCKET_DRAG_CONTAINER
    );
  },

  getContainerFromEvent(e) {
    const classes = e.target?.classList;

    if (!classes) return;

    const isPuzzlePiece = classes.contains("puzzle-piece");
    const isPuzzlePieceLayerElement = classes.contains("puzzle-piece-fg");

    if (isPuzzlePiece) {
      return e.target.parentNode;
    }

    if (isPuzzlePieceLayerElement) {
      return e.target.parentNode.parentNode;
    }
  },

  isPocketDragContainer(element) {
    return element.id === ELEMENT_IDS.POCKET_DRAG_CONTAINER;
  },

  isDragAndSelectDragContainer(element) {
    return element.id === ELEMENT_IDS.DRAGANDSELECT_CONTAINER;
  },

  getOrientation(boundingBox) {
    const width = boundingBox.width;
    const height = boundingBox.height;
    return width === height
      ? "square"
      : width < height
      ? "portrait"
      : "landscape";
  },

  getStageOrientation(stageElementBoundingBox) {
    const width = stageElementBoundingBox.width;
    const height = stageElementBoundingBox.height;
    return width < height ? "portrait" : "landscape";
  },
};

export default Utils;
