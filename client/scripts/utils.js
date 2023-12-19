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

  isSolved(el) {
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
    data._id = el.dataset.pieceIdInPersistence;
    data.id = parseInt(el.dataset.pieceId);
    data.puzzleId = el.dataset.puzzleId;
    data.imgX = parseInt(el.dataset.imgx);
    data.imgY = parseInt(el.dataset.imgy);
    data.solvedX = parseInt(el.dataset.solvedx);
    data.solvedY = parseInt(el.dataset.solvedy);
    data.imgW = parseInt(el.dataset.imgw);
    data.imgH = parseInt(el.dataset.imgh);
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

    data.isSolved = el.dataset.isSolved === "true";
    data.groupId = GroupOperations.getGroup(el);
    data.pocketId = parseInt(el.dataset["pocketId"]);

    data.pageX = parseInt(el.style.left);
    data.pageY = parseInt(el.style.top);

    if (GroupOperations.hasGroup({ group: GroupOperations.getGroup(el) })) {
      data.containerX = el.parentNode.offsetLeft;
      data.containerY = el.parentNode.offsetTop;
    }

    return data;
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
    return document.querySelector(`[data-piece-id='${id}']`);
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
    return element.dataset.groupId;
  },

  getElementsInGroupByElement(groupedElement) {
    const groupId = this.GroupOperations.getGroupIdByElement(groupedElement);
    return Array.from(document.querySelectorAll(`[data-group='${groupId}']`));
  },

  getCornerBoundingBox(key) {
    const box = this.solvingArea.getBoundingClientRect();
    switch (key) {
      case "top-right":
        return {
          top: box.top,
          right: box.right,
          bottom: box.top + this.connectorTolerance,
          left: box.right - this.connectorTolerance,
        };
      case "bottom-right":
        return {
          top: box.bottom - this.connectorTolerance,
          right: box.right,
          bottom: box.bottom,
          left: box.right - this.connectorTolerance,
        };
      case "bottom-left":
        return {
          top: box.bottom - this.connectorTolerance,
          right: box.left + this.connectorTolerance,
          bottom: box.bottom,
          left: box.left,
        };
      case "top-left":
        return {
          top: box.top,
          right: box.left + this.connectorTolerance,
          bottom: box.top + this.connectorTolerance,
          left: box.left,
        };
    }
  },

  getElementBoundingBoxRelativeToCorner(elementBoundingBox, corner) {
    switch (corner) {
      case "top-right":
        elementBoundingBox.left =
          elementBoundingBox.right - this.connectorTolerance;
        elementBoundingBox.bottom =
          elementBoundingBox.top + this.connectorTolerance;
      case "bottom-right":
        elementBoundingBox.left =
          elementBoundingBox.right - this.connectorTolerance;
        elementBoundingBox.top =
          elementBoundingBox.bottom - this.connectorTolerance;
      case "bottom-left":
        elementBoundingBox.right =
          elementBoundingBox.left + this.connectorTolerance;
        elementBoundingBox.top =
          elementBoundingBox.bottom - this.connectorTolerance;
      case "top-left":
        elementBoundingBox.right =
          elementBoundingBox.left + this.connectorTolerance;
        elementBoundingBox.bottom =
          elementBoundingBox.top + this.connectorTolerance;
    }
    return elementBoundingBox;
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

  getConnectorBoundingBox(element, side) {
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

    const elementBoundingBox = element.getBoundingClientRect();

    switch (side) {
      case "left":
        box = {
          top: elementBoundingBox.top + topBoundary + tolerance,
          right: elementBoundingBox.left + this.connectorSize - tolerance,
          bottom:
            elementBoundingBox.top +
            topBoundary +
            this.connectorSize -
            tolerance,
          left: elementBoundingBox.left + tolerance,
        };
        break;
      case "right":
        box = {
          top: elementBoundingBox.top + topBoundary + tolerance,
          right: elementBoundingBox.right - tolerance,
          bottom:
            elementBoundingBox.top +
            topBoundary +
            this.connectorSize -
            tolerance,
          left: elementBoundingBox.right - this.connectorSize + tolerance,
        };
        break;
      case "bottom":
        box = {
          top:
            elementBoundingBox.bottom -
            this.connectorSize +
            tolerance -
            this.shadowOffset,
          right:
            elementBoundingBox.left +
            leftBoundary +
            this.connectorSize -
            tolerance,
          bottom: elementBoundingBox.bottom - tolerance - this.shadowOffset,
          left: elementBoundingBox.left + leftBoundary + tolerance,
        };
        break;
      case "top":
        box = {
          top: elementBoundingBox.top + tolerance,
          right:
            elementBoundingBox.left +
            leftBoundary +
            this.connectorSize -
            tolerance,
          bottom: elementBoundingBox.top + this.connectorSize - tolerance,
          left: elementBoundingBox.left + leftBoundary + tolerance,
        };
        break;
    }

    return box;
  },

  getConnectorBoundingBoxInGroup(element, connector, containerBoundingBox) {
    console.log(
      "getting connector bounding box in group",
      element,
      connector,
      containerBoundingBox
    );
    const piece = {
      type: Utils.getPieceType(element),
    };

    const hasLeftPlug = Utils.has(piece.type, "plug", "left");
    const hasTopPlug = Utils.has(piece.type, "plug", "top");
    const tolerance = this.connectorTolerance;

    const elementBoundingBox = element.getBoundingClientRect();

    switch (connector) {
      case "right":
        return {
          top:
            containerBoundingBox.top +
            elementBoundingBox.top +
            (hasTopPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            tolerance,
          right:
            containerBoundingBox.left + elementBoundingBox.right - tolerance,
          bottom:
            containerBoundingBox.top +
            elementBoundingBox.top +
            (hasTopPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            this.connectorSize -
            tolerance,
          left:
            containerBoundingBox.left +
            elementBoundingBox.right -
            this.connectorSize +
            tolerance,
        };

      case "bottom":
        return {
          top:
            containerBoundingBox.top +
            elementBoundingBox.bottom -
            this.connectorSize +
            tolerance,
          right:
            containerBoundingBox.left +
            elementBoundingBox.left +
            (hasLeftPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            this.connectorSize -
            tolerance,
          bottom:
            containerBoundingBox.top + elementBoundingBox.bottom - tolerance,
          left:
            containerBoundingBox.left +
            elementBoundingBox.left +
            (hasLeftPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            tolerance,
        };

      case "left":
        return {
          top:
            containerBoundingBox.top +
            elementBoundingBox.top +
            (hasTopPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            tolerance,
          right:
            containerBoundingBox.left +
            elementBoundingBox.left +
            this.connectorSize -
            tolerance,
          bottom:
            containerBoundingBox.top +
            elementBoundingBox.top +
            (hasTopPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            this.connectorSize -
            tolerance,
          left: containerBoundingBox.left + elementBoundingBox.left + tolerance,
        };

      case "top":
        return {
          top: containerBoundingBox.top + elementBoundingBox.top + tolerance,
          right:
            containerBoundingBox.left +
            elementBoundingBox.left +
            (hasLeftPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            this.connectorSize -
            tolerance,
          bottom:
            containerBoundingBox.top +
            elementBoundingBox.top +
            this.connectorSize -
            tolerance,
          left:
            containerBoundingBox.left +
            elementBoundingBox.left +
            (hasLeftPlug
              ? this.connectorDistanceFromCorner + this.connectorSize
              : this.connectorDistanceFromCorner) +
            tolerance,
        };
    }
  },

  getElementBoundingBoxForFloatDetection(element, drawBoundingBox = false) {
    const hasGroup = !!element.dataset.groupId;

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
        !el.dataset.groupId &&
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
