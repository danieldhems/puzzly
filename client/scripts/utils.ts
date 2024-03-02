import { ELEMENT_IDS, PUZZLE_PIECE_CLASSES } from "./constants";
import {
  ConnectorType,
  DomBox,
  JigsawPieceData,
  MovableElement,
  SideNames,
} from "./types";

const Utils = {
  hasCollision(source: DomBox, target: DomBox): boolean {
    return !(
      source.left >= target.right ||
      source.top >= target.bottom ||
      source.right <= target.left ||
      source.bottom <= target.top
    );
  },

  isInside(source: DOMRect, target: DOMRect): boolean {
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
  getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  getQueryStringValue(key: string): string {
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

  isSolved(el: HTMLDivElement): boolean {
    return el.dataset.isSolved === "true";
  },

  isTopSide(type: ConnectorType[]): boolean {
    return type[0] === 0 && type[1] !== 0 && type[3] !== 0;
  },

  isTopRightCorner(type: ConnectorType[]) {
    return type[0] === 0 && type[1] === 0;
  },

  isTopLeftCorner(type: ConnectorType[]) {
    return type[0] === 0 && type[3] === 0;
  },

  isLeftSide(type: ConnectorType[]) {
    return type[0] !== 0 && type[2] !== 0 && type[3] === 0;
  },

  isInnerPiece(type: ConnectorType[]) {
    return type[0] !== 0 && type[1] !== 0 && type[2] !== 0 && type[3] !== 0;
  },

  isRightSide(type: ConnectorType[]) {
    return type[0] !== 0 && type[1] === 0 && type[2] !== 0;
  },

  isTopEdgePiece(type: ConnectorType[]) {
    return type[0] === 0;
  },

  isRightEdgePiece(type: ConnectorType[]) {
    return type[1] === 0;
  },

  isBottomEdgePiece(type: ConnectorType[]) {
    return type[2] === 0;
  },

  isLeftEdgePiece(type: ConnectorType[]) {
    return type[3] === 0;
  },

  isBottomLeftCorner(type: ConnectorType[]) {
    return type[2] === 0 && type[3] === 0;
  },

  isBottomSide(type: ConnectorType[]) {
    return type[1] !== 0 && type[2] === 0 && type[3] !== 0;
  },

  isSidePiece(type: ConnectorType[]) {
    return type.filter((t) => t === 0).length === 1;
  },

  isBottomRightCorner(type: ConnectorType[]) {
    return type[1] === 0 && type[2] === 0;
  },

  isCornerPiece(type: ConnectorType[]) {
    return (
      this.isTopLeftCorner(type) ||
      this.isTopRightCorner(type) ||
      this.isBottomRightCorner(type) ||
      this.isBottomLeftCorner(type)
    );
  },

  isCornerConnection(str: SideNames) {
    return (
      str === "top-left" ||
      str === "top-right" ||
      str === "bottom-right" ||
      str === "bottom-left"
    );
  },

  isEdgePiece(pieceType: ConnectorType[]) {
    return this.isSidePiece(pieceType) || this.isCornerPiece(pieceType);
  },

  getPieceType(element: HTMLDivElement): ConnectorType[] {
    return element?.dataset?.jigsawType
      ?.split(",")
      .map((t) => parseInt(t)) as ConnectorType[];
  },

  getPuzzlePiecesInContainer(element: HTMLDivElement) {
    return element.querySelectorAll(".puzzle-piece");
  },

  querySelectorFrom(selector: string, elements: NodeListOf<HTMLDivElement>) {
    return [].filter.call(elements, function (element: HTMLDivElement) {
      return element.matches(selector);
    });
  },

  getPieceFromElement(el: HTMLDivElement): JigsawPieceData {
    const data = {} as JigsawPieceData;
    data._id = el.dataset.pieceIdInPersistence as string;
    data.id = parseInt(el.dataset.pieceId as string);
    data.puzzleId = el.dataset.puzzleId as string;
    data.imgX = parseInt(el.dataset.imgx as string);
    data.imgY = parseInt(el.dataset.imgy as string);
    data.solvedX = parseInt(el.dataset.solvedx as string);
    data.solvedY = parseInt(el.dataset.solvedy as string);
    data.imgW = parseInt(el.dataset.imgw as string);
    data.imgH = parseInt(el.dataset.imgh as string);
    data.numPiecesFromTopEdge = parseInt(
      el.dataset.numPiecesFromTopEdge as string
    );
    data.numPiecesFromLeftEdge = parseInt(
      el.dataset.numPiecesFromLeftEdge as string
    );

    const type = el.dataset["jigsawType"];
    if (type) {
      data.type = type.split(",").map((n) => parseInt(n) as ConnectorType);
    } else {
      console.warn(`Can't get type for piece ${el.toString()}`);
    }

    const connections = el.dataset.connections as string;
    data.connections = connections.split(",") as SideNames[];

    data.connectsTo = JSON.parse(el.dataset["connectsTo"] as string);

    const isInnerPiece = el.dataset["isInnerPiece"];
    data.isInnerPiece = isInnerPiece == "true" ? true : false;

    data.isSolved = el.dataset.isSolved === "true";
    data.groupId = el.dataset.groupId as string;
    data.pocketId = parseInt(el.dataset["pocketId"] as string);

    data.pageX = parseInt(el.style.left);
    data.pageY = parseInt(el.style.top);

    return data;
  },

  insertUrlParam(key: string, value: string) {
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
  },

  getElementByPieceId(id: number) {
    return document.querySelector(`[data-piece-id='${id}']`) as HTMLDivElement;
  },

  getPxString(value: number) {
    return value + "px";
  },

  getPieceIdFromElement(element: HTMLDivElement) {
    return element.dataset["piece-id"];
  },

  getGroupIdFromElement(element: HTMLDivElement) {
    return element.dataset.groupId;
  },

  getElementsInGroupByElement(groupedElement: HTMLDivElement) {
    const groupId = this.GroupOperations.getGroupIdByElement(groupedElement);
    return Array.from(document.querySelectorAll(`[data-group='${groupId}']`));
  },

  getCornerBoundingBox(key: SideNames): DomBox {
    const box = this.solvedContainer.getBoundingClientRect();
    const rect = {} as DomBox;
    switch (key) {
      case "top-right":
        rect.top = box.top;
        rect.right = box.right;
        rect.bottom = box.top + this.connectorTolerance;
        rect.left = box.right - this.connectorTolerance;
      case "bottom-right":
        rect.top = box.bottom - this.connectorTolerance;
        rect.right = box.right;
        rect.bottom = box.bottom;
        rect.left = box.right - this.connectorTolerance;
      case "bottom-left":
        rect.top = box.bottom - this.connectorTolerance;
        rect.right = box.left + this.connectorTolerance;
        rect.bottom = box.bottom;
        rect.left = box.left;
      case "top-left":
        rect.top = box.top;
        rect.right = box.left + this.connectorTolerance;
        rect.bottom = box.top + this.connectorTolerance;
        rect.left = box.left;
    }
    return rect;
  },

  getElementBoundingBoxRelativeToCorner(
    elementBoundingBox: DomBox,
    corner: SideNames
  ) {
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

  getTopLeftCornerBoundingBox(): DomBox {
    const box = this.solvedContainer.getBoundingClientRect();
    return {
      top: box.top,
      right: box.left + this.connectorTolerance,
      bottom: box.top + this.connectorTolerance,
      left: box.left,
    };
  },

  getTopRightCornerBoundingBox(): DomBox {
    const box = this.solvedContainer.getBoundingClientRect();
    return {
      top: box.top,
      right: box.right,
      bottom: box.top + this.connectorTolerance,
      left: box.right - this.connectorTolerance,
    };
  },

  getBottomRightCornerBoundingBox(): DomBox {
    const box = this.solvedContainer.getBoundingClientRect();
    return {
      top: box.bottom - this.connectorTolerance,
      right: box.right,
      bottom: box.bottom,
      left: box.right - this.connectorTolerance,
    };
  },

  getBottomLeftCornerBoundingBox(): DomBox {
    const box = this.solvedContainer.getBoundingClientRect();
    return {
      top: box.bottom - this.connectorTolerance,
      right: box.left + this.connectorTolerance,
      bottom: box.bottom,
      left: box.left,
    };
  },

  getConnectorBoundingBox(element: HTMLDivElement, side: SideNames) {
    const piece = {
      type: Utils.getPieceType(element),
    };
    const hasLeftPlug = piece.type[3] === 1;
    const hasTopPlug = piece.type[0] === 1;

    const tolerance: number = parseInt(
      element.dataset.connectorTolerance as string
    );
    const connectorDistanceFromCorner = parseInt(
      element.dataset.connectorDistanceFromCorner as string
    );
    const connectorSize = parseInt(element.dataset.connectorSize as string);
    const shadowOffset = parseInt(element.dataset.shadowOffset as string);

    let box;

    // console.log("connectorsize", connectorSize);
    // console.log("tolerance setting", connectorTolerance);

    const topBoundary = hasTopPlug
      ? connectorDistanceFromCorner + connectorSize
      : connectorDistanceFromCorner;
    const leftBoundary = hasLeftPlug
      ? connectorDistanceFromCorner + connectorSize
      : connectorDistanceFromCorner;

    // const elementBoundingBox = element.getBoundingClientRect();
    const elementBoundingBox = {} as DomBox;

    let parent;
    if (element.dataset.groupId) {
      parent = element.parentNode;
    }
    if (element.dataset.isSolved === "true") {
      parent = document.querySelector("#solved-puzzle-area");
    }

    if (parent) {
      const parentElement = parent as HTMLDivElement;
      elementBoundingBox.top =
        parseInt(parentElement.style.top) + parseInt(element.style.top);
      elementBoundingBox.right =
        parseInt(parentElement.style.left) +
        parseInt(element.style.left) +
        element.offsetWidth;
      elementBoundingBox.bottom =
        parseInt(parentElement.style.top) +
        parseInt(element.style.top) +
        element.offsetHeight;
      elementBoundingBox.left =
        parseInt(parentElement.style.left) + parseInt(element.style.left);
    } else {
      elementBoundingBox.top = parseInt(element.style.top);
      elementBoundingBox.right =
        parseInt(element.style.left) + element.offsetWidth;
      elementBoundingBox.bottom =
        parseInt(element.style.top) + element.offsetHeight;
      elementBoundingBox.left = parseInt(element.style.left);
    }

    switch (side) {
      case "left":
        box = {
          top: elementBoundingBox.top + topBoundary + tolerance,
          right: elementBoundingBox.left + connectorSize - tolerance,
          bottom:
            elementBoundingBox.top + topBoundary + connectorSize - tolerance,
          left: elementBoundingBox.left + tolerance,
        };
        break;
      case "right":
        box = {
          top: elementBoundingBox.top + topBoundary + tolerance,
          right: elementBoundingBox.right - tolerance,
          bottom:
            elementBoundingBox.top + topBoundary + connectorSize - tolerance,
          left: elementBoundingBox.right - connectorSize + tolerance,
        };
        break;
      case "bottom":
        box = {
          top:
            elementBoundingBox.bottom -
            connectorSize +
            tolerance -
            shadowOffset,
          right:
            elementBoundingBox.left + leftBoundary + connectorSize - tolerance,
          bottom: elementBoundingBox.bottom - tolerance - shadowOffset,
          left: elementBoundingBox.left + leftBoundary + tolerance,
        };
        break;
      case "top":
        box = {
          top: elementBoundingBox.top + tolerance,
          right:
            elementBoundingBox.left + leftBoundary + connectorSize - tolerance,
          bottom: elementBoundingBox.top + connectorSize - tolerance,
          left: elementBoundingBox.left + leftBoundary + tolerance,
        };
        break;
    }

    return box;
  },

  getConnectorBoundingBoxInGroup(
    element: HTMLDivElement,
    connector: SideNames,
    containerBoundingBox: DomBox
  ) {
    console.log(
      "getting connector bounding box in group",
      element,
      connector,
      containerBoundingBox
    );
    const pieceType = Utils.getPieceType(element);

    const hasLeftPlug = pieceType[3] === 1;
    const hasTopPlug = pieceType[0] === 1;
    const tolerance = this.connectorTolerance;

    const elementBoundingBox = element.getBoundingClientRect();

    switch (connector) {
      case SideNames.Right:
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

      case SideNames.Bottom:
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

      case SideNames.Left:
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

      case SideNames.Top:
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

  getElementBoundingBoxForFloatDetection(
    element: HTMLDivElement,
    drawBoundingBox = false
  ) {
    const hasGroup = !!element.dataset.groupId;

    const parentLocation = hasGroup
      ? {
          top: parseInt(element.style.top),
          left: parseInt(element.style.left),
        }
      : { top: 0, left: 0 };

    const diffX = element.offsetWidth / 2 - this.floatTolerance / 2;
    const diffY = element.offsetHeight / 2 - this.floatTolerance / 2;

    const pos = {
      top: hasGroup
        ? parentLocation.top + element.offsetTop
        : element.offsetTop,
      right: hasGroup
        ? parentLocation.left + element.offsetLeft + diffX
        : element.offsetLeft + diffX,
      bottom: hasGroup
        ? parentLocation.top + element.offsetTop + diffY
        : element.offsetTop + diffY,
      left: hasGroup
        ? parentLocation.left + element.offsetLeft
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

  drawBox(box: DOMRect, container?: HTMLDivElement, borderColor?: string) {
    const div = document.createElement("div");
    div.classList.add("bounding-box-indicator");
    div.style.position = "absolute";
    div.style.zIndex = "100";
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

  getBoundingBoxForOffset(element: HTMLDivElement) {
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

  getStyleBoundingBox(
    element: HTMLDivElement
  ): Pick<DOMRect, "top" | "right" | "bottom" | "left" | "width" | "height"> {
    const top = parseInt(element.style.top);
    const left = parseInt(element.style.left);
    return {
      top,
      right: left + element.offsetWidth,
      bottom: top + element.offsetHeight,
      left,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  },

  getPocketByCollision(box: DomBox): HTMLDivElement | undefined {
    let i = 0;
    const pockets = document.querySelectorAll(".pocket");
    while (i < pockets.length) {
      const pocket = pockets[i];
      if (Utils.hasCollision(pocket.getBoundingClientRect(), box)) {
        return pocket as HTMLDivElement;
      }
      i++;
    }
  },

  getEventBox(e: MouseEvent): DomBox {
    return {
      top: e.clientY,
      right: e.clientX,
      bottom: e.clientY,
      left: e.clientX,
    };
  },

  getIndividualPiecesOnCanvas(): MovableElement[] {
    const pieces = document.querySelectorAll(".puzzle-piece");
    return Array.from(pieces).filter((el: HTMLDivElement) => {
      return (
        !el.dataset.issolved &&
        !el.dataset.groupId &&
        !el.classList.contains("in-pocket")
      );
    }) as MovableElement[];
  },

  isOverPockets(box: DomBox) {
    const pocketsBox = (
      document.querySelector("#pockets") as HTMLDivElement
    ).getBoundingClientRect();

    // Utils.drawBox(box);
    // Utils.drawBox(pocketsBox);
    return Utils.hasCollision(box, pocketsBox);
  },

  isPuzzlePiece(target: HTMLElement) {
    const classes = target.classList;
    return (
      PUZZLE_PIECE_CLASSES.some((c) => classes.contains(c)) &&
      !classes.contains("in-pocket")
    );
  },

  getPuzzlePieceElementFromEvent(e: MouseEvent): MovableElement | undefined {
    const classes = (e.target as HTMLDivElement)?.classList;

    if (!classes) return;

    const isPuzzlePiece = classes.contains("puzzle-piece");
    const isPuzzlePieceLayerElement = classes.contains("puzzle-piece-fg");

    if (isPuzzlePiece) {
      return e.target as MovableElement;
    }

    if (isPuzzlePieceLayerElement) {
      return (e.target as HTMLElement).parentNode as MovableElement;
    }
  },

  elementIsInDragContainer(element: HTMLDivElement) {
    return (
      (element?.parentNode as HTMLDivElement).id ===
        ELEMENT_IDS.DRAGANDSELECT_CONTAINER ||
      (element?.parentNode as HTMLDivElement).id ===
        ELEMENT_IDS.POCKET_DRAG_CONTAINER
    );
  },

  isPocketDragContainer(element: HTMLDivElement) {
    return element.id === ELEMENT_IDS.POCKET_DRAG_CONTAINER;
  },

  isDragAndSelectDragContainer(element: HTMLDivElement) {
    return element.id === ELEMENT_IDS.DRAGANDSELECT_CONTAINER;
  },

  getOrientation(boundingBox: DOMRect) {
    const width = boundingBox.width;
    const height = boundingBox.height;
    return width === height
      ? "square"
      : width < height
      ? "portrait"
      : "landscape";
  },

  evalBez(poly: number[], t: number) {
    var x =
      poly[0] * (1 - t) * (1 - t) * (1 - t) +
      3 * poly[1] * t * (1 - t) * (1 - t) +
      3 * poly[2] * t * t * (1 - t) +
      poly[3] * t * t * t;
    return x;
  },
  getCurveBoundingBox(controlPoints: { x: number; y: number }[]) {
    const P = controlPoints;

    var PX = [P[0].x, P[1].x, P[2].x, P[3].x];
    var PY = [P[0].y, P[1].y, P[2].y, P[3].y];
    var a = 3 * P[3].x - 9 * P[2].x + 9 * P[1].x - 3 * P[0].x;
    var b = 6 * P[0].x - 12 * P[1].x + 6 * P[2].x;
    var c = 3 * P[1].x - 3 * P[0].x;
    //alert("a "+a+" "+b+" "+c);
    var disc = b * b - 4 * a * c;
    var xl = P[0].x;
    var xh = P[0].x;
    if (P[3].x < xl) xl = P[3].x;
    if (P[3].x > xh) xh = P[3].x;
    if (disc >= 0) {
      var t1 = (-b + Math.sqrt(disc)) / (2 * a);
      // alert("t1 " + t1);
      if (t1 > 0 && t1 < 1) {
        var x1 = Utils.evalBez(PX, t1);
        if (x1 < xl) xl = x1;
        if (x1 > xh) xh = x1;
      }

      var t2 = (-b - Math.sqrt(disc)) / (2 * a);
      // alert("t2 " + t2);
      if (t2 > 0 && t2 < 1) {
        var x2 = Utils.evalBez(PX, t2);
        if (x2 < xl) xl = x2;
        if (x2 > xh) xh = x2;
      }
    }

    a = 3 * P[3].y - 9 * P[2].y + 9 * P[1].y - 3 * P[0].y;
    b = 6 * P[0].y - 12 * P[1].y + 6 * P[2].y;
    c = 3 * P[1].y - 3 * P[0].y;
    disc = b * b - 4 * a * c;
    var yl = P[0].y;
    var yh = P[0].y;
    if (P[3].y < yl) yl = P[3].y;
    if (P[3].y > yh) yh = P[3].y;
    if (disc >= 0) {
      var t1 = (-b + Math.sqrt(disc)) / (2 * a);
      // alert("t3 " + t1);

      if (t1 > 0 && t1 < 1) {
        var y1 = Utils.evalBez(PY, t1);
        if (y1 < yl) yl = y1;
        if (y1 > yh) yh = y1;
      }

      var t2 = (-b - Math.sqrt(disc)) / (2 * a);
      // alert("t4 " + t2);

      if (t2 > 0 && t2 < 1) {
        var y2 = Utils.evalBez(PY, t2);
        if (y2 < yl) yl = y2;
        if (y2 > yh) yh = y2;
      }
    }

    // ctx.lineWidth = 1;
    // ctx.beginPath();
    // ctx.moveTo(xl, yl);
    // ctx.lineTo(xl, yh);
    // ctx.lineTo(xh, yh);
    // ctx.lineTo(xh, yl);
    // ctx.lineTo(xl, yl);
    // ctx.stroke();

    return {
      top: yl,
      right: xh,
      bottom: yh,
      left: xl,
    };

    // alert("" + xl + " " + xh + " " + yl + " " + yh);
  },
};

export default Utils;
