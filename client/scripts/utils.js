"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_js_1 = require("./constants.js");
var types_1 = require("./types");
var Utils = {
    hasCollision: function (source, target) {
        return !(source.left >= target.right ||
            source.top >= target.bottom ||
            source.right <= target.left ||
            source.bottom <= target.top);
    },
    isInside: function (source, target) {
        return (source.top >= target.top &&
            source.right <= target.right &&
            source.bottom <= target.bottom &&
            source.left >= target.left);
    },
    /**
     * Returns a random integer between min (inclusive) and max (inclusive).
     * The value is no lower than min (or the next integer greater than min
     * if min isn't an integer) and no greater than max (or the next integer
     * lower than max if max isn't an integer).
     * Using Math.round() will give you a non-uniform distribution!
     */
    getRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getQueryStringValue: function (key) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" +
            encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
            "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    },
    isSolved: function (el) {
        return el.dataset.isSolved === "true";
    },
    isTopSide: function (type) {
        return type[0] === 0 && type[1] !== 0 && type[3] !== 0;
    },
    isTopRightCorner: function (type) {
        return type[0] === 0 && type[1] === 0;
    },
    isTopLeftCorner: function (type) {
        return type[0] === 0 && type[3] === 0;
    },
    isLeftSide: function (type) {
        return type[0] !== 0 && type[2] !== 0 && type[3] === 0;
    },
    isInnerPiece: function (type) {
        return type[0] !== 0 && type[1] !== 0 && type[2] !== 0 && type[3] !== 0;
    },
    isRightSide: function (type) {
        return type[0] !== 0 && type[1] === 0 && type[2] !== 0;
    },
    isTopEdgePiece: function (type) {
        return type[0] === 0;
    },
    isRightEdgePiece: function (type) {
        return type[1] === 0;
    },
    isBottomEdgePiece: function (type) {
        return type[2] === 0;
    },
    isLeftEdgePiece: function (type) {
        return type[3] === 0;
    },
    isBottomLeftCorner: function (type) {
        return type[2] === 0 && type[3] === 0;
    },
    isBottomSide: function (type) {
        return type[1] !== 0 && type[2] === 0 && type[3] !== 0;
    },
    isSidePiece: function (type) {
        return type.filter(function (t) { return t === 0; }).length === 1;
    },
    isBottomRightCorner: function (type) {
        return type[1] === 0 && type[2] === 0;
    },
    isCornerPiece: function (type) {
        return (this.isTopLeftCorner(type) ||
            this.isTopRightCorner(type) ||
            this.isBottomRightCorner(type) ||
            this.isBottomLeftCorner(type));
    },
    isCornerConnection: function (str) {
        return (str === "top-left" ||
            str === "top-right" ||
            str === "bottom-right" ||
            str === "bottom-left");
    },
    isEdgePiece: function (pieceType) {
        return this.isSidePiece(pieceType) || this.isCornerPiece(pieceType);
    },
    getPieceType: function (element) {
        var _a, _b;
        return (_b = (_a = element === null || element === void 0 ? void 0 : element.dataset) === null || _a === void 0 ? void 0 : _a.jigsawType) === null || _b === void 0 ? void 0 : _b.split(",").map(function (t) { return parseInt(t); });
    },
    getPuzzlePiecesInContainer: function (element) {
        return element.querySelectorAll(".puzzle-piece");
    },
    querySelectorFrom: function (selector, elements) {
        return [].filter.call(elements, function (element) {
            return element.matches(selector);
        });
    },
    getPieceFromElement: function (el) {
        var data = {};
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
        var type = el.dataset["jigsawType"];
        if (type) {
            data.type = type.split(",").map(function (n) { return parseInt(n); });
        }
        else {
            console.warn("Can't get type for piece ".concat(el.toString()));
        }
        var connections = el.dataset.connections;
        data.connections = connections.split(",");
        data.connectsTo = JSON.parse(el.dataset["connectsTo"]);
        var isInnerPiece = el.dataset["isInnerPiece"];
        data.isInnerPiece = isInnerPiece == "true" ? true : false;
        data.isSolved = el.dataset.isSolved === "true";
        data.groupId = el.dataset.groupId;
        data.pocketId = parseInt(el.dataset["pocketId"]);
        data.pageX = parseInt(el.style.left);
        data.pageY = parseInt(el.style.top);
        return data;
    },
    insertUrlParam: function (key, value) {
        var searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, value);
        var newurl = window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            "?" +
            searchParams.toString();
        window.history.pushState({ path: newurl }, "", newurl);
    },
    getElementByPieceId: function (id) {
        return document.querySelector("[data-piece-id='".concat(id, "']"));
    },
    getPxString: function (value) {
        return value + "px";
    },
    getPieceIdFromElement: function (element) {
        return element.dataset["piece-id"];
    },
    getGroupIdFromElement: function (element) {
        return element.dataset.groupId;
    },
    getElementsInGroupByElement: function (groupedElement) {
        var groupId = this.GroupOperations.getGroupIdByElement(groupedElement);
        return Array.from(document.querySelectorAll("[data-group='".concat(groupId, "']")));
    },
    getCornerBoundingBox: function (key) {
        var box = this.solvedContainer.getBoundingClientRect();
        var rect = {};
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
    getElementBoundingBoxRelativeToCorner: function (elementBoundingBox, corner) {
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
    getTopLeftCornerBoundingBox: function () {
        var box = this.solvedContainer.getBoundingClientRect();
        return {
            top: box.top,
            right: box.left + this.connectorTolerance,
            bottom: box.top + this.connectorTolerance,
            left: box.left,
        };
    },
    getTopRightCornerBoundingBox: function () {
        var box = this.solvedContainer.getBoundingClientRect();
        return {
            top: box.top,
            right: box.right,
            bottom: box.top + this.connectorTolerance,
            left: box.right - this.connectorTolerance,
        };
    },
    getBottomRightCornerBoundingBox: function () {
        var box = this.solvedContainer.getBoundingClientRect();
        return {
            top: box.bottom - this.connectorTolerance,
            right: box.right,
            bottom: box.bottom,
            left: box.right - this.connectorTolerance,
        };
    },
    getBottomLeftCornerBoundingBox: function () {
        var box = this.solvedContainer.getBoundingClientRect();
        return {
            top: box.bottom - this.connectorTolerance,
            right: box.left + this.connectorTolerance,
            bottom: box.bottom,
            left: box.left,
        };
    },
    getConnectorBoundingBox: function (element, side) {
        var piece = {
            type: Utils.getPieceType(element),
        };
        var hasLeftPlug = piece.type[3] === 1;
        var hasTopPlug = piece.type[0] === 1;
        var tolerance = parseInt(element.dataset.connectorTolerance);
        var connectorDistanceFromCorner = parseInt(element.dataset.connectorDistanceFromCorner);
        var connectorSize = parseInt(element.dataset.connectorSize);
        var shadowOffset = parseInt(element.dataset.shadowOffset);
        var box;
        // console.log("connectorsize", connectorSize);
        // console.log("tolerance setting", connectorTolerance);
        var topBoundary = hasTopPlug
            ? connectorDistanceFromCorner + connectorSize
            : connectorDistanceFromCorner;
        var leftBoundary = hasLeftPlug
            ? connectorDistanceFromCorner + connectorSize
            : connectorDistanceFromCorner;
        // const elementBoundingBox = element.getBoundingClientRect();
        var elementBoundingBox = {};
        var parent;
        if (element.dataset.groupId) {
            parent = element.parentNode;
        }
        if (element.dataset.isSolved === "true") {
            parent = document.querySelector("#solved-puzzle-area");
        }
        if (parent) {
            var parentElement = parent;
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
        }
        else {
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
                    bottom: elementBoundingBox.top + topBoundary + connectorSize - tolerance,
                    left: elementBoundingBox.left + tolerance,
                };
                break;
            case "right":
                box = {
                    top: elementBoundingBox.top + topBoundary + tolerance,
                    right: elementBoundingBox.right - tolerance,
                    bottom: elementBoundingBox.top + topBoundary + connectorSize - tolerance,
                    left: elementBoundingBox.right - connectorSize + tolerance,
                };
                break;
            case "bottom":
                box = {
                    top: elementBoundingBox.bottom -
                        connectorSize +
                        tolerance -
                        shadowOffset,
                    right: elementBoundingBox.left + leftBoundary + connectorSize - tolerance,
                    bottom: elementBoundingBox.bottom - tolerance - shadowOffset,
                    left: elementBoundingBox.left + leftBoundary + tolerance,
                };
                break;
            case "top":
                box = {
                    top: elementBoundingBox.top + tolerance,
                    right: elementBoundingBox.left + leftBoundary + connectorSize - tolerance,
                    bottom: elementBoundingBox.top + connectorSize - tolerance,
                    left: elementBoundingBox.left + leftBoundary + tolerance,
                };
                break;
        }
        return box;
    },
    getConnectorBoundingBoxInGroup: function (element, connector, containerBoundingBox) {
        console.log("getting connector bounding box in group", element, connector, containerBoundingBox);
        var pieceType = Utils.getPieceType(element);
        var hasLeftPlug = pieceType[3] === 1;
        var hasTopPlug = pieceType[0] === 1;
        var tolerance = this.connectorTolerance;
        var elementBoundingBox = element.getBoundingClientRect();
        switch (connector) {
            case types_1.SideNames.Right:
                return {
                    top: containerBoundingBox.top +
                        elementBoundingBox.top +
                        (hasTopPlug
                            ? this.connectorDistanceFromCorner + this.connectorSize
                            : this.connectorDistanceFromCorner) +
                        tolerance,
                    right: containerBoundingBox.left + elementBoundingBox.right - tolerance,
                    bottom: containerBoundingBox.top +
                        elementBoundingBox.top +
                        (hasTopPlug
                            ? this.connectorDistanceFromCorner + this.connectorSize
                            : this.connectorDistanceFromCorner) +
                        this.connectorSize -
                        tolerance,
                    left: containerBoundingBox.left +
                        elementBoundingBox.right -
                        this.connectorSize +
                        tolerance,
                };
            case types_1.SideNames.Bottom:
                return {
                    top: containerBoundingBox.top +
                        elementBoundingBox.bottom -
                        this.connectorSize +
                        tolerance,
                    right: containerBoundingBox.left +
                        elementBoundingBox.left +
                        (hasLeftPlug
                            ? this.connectorDistanceFromCorner + this.connectorSize
                            : this.connectorDistanceFromCorner) +
                        this.connectorSize -
                        tolerance,
                    bottom: containerBoundingBox.top + elementBoundingBox.bottom - tolerance,
                    left: containerBoundingBox.left +
                        elementBoundingBox.left +
                        (hasLeftPlug
                            ? this.connectorDistanceFromCorner + this.connectorSize
                            : this.connectorDistanceFromCorner) +
                        tolerance,
                };
            case types_1.SideNames.Left:
                return {
                    top: containerBoundingBox.top +
                        elementBoundingBox.top +
                        (hasTopPlug
                            ? this.connectorDistanceFromCorner + this.connectorSize
                            : this.connectorDistanceFromCorner) +
                        tolerance,
                    right: containerBoundingBox.left +
                        elementBoundingBox.left +
                        this.connectorSize -
                        tolerance,
                    bottom: containerBoundingBox.top +
                        elementBoundingBox.top +
                        (hasTopPlug
                            ? this.connectorDistanceFromCorner + this.connectorSize
                            : this.connectorDistanceFromCorner) +
                        this.connectorSize -
                        tolerance,
                    left: containerBoundingBox.left + elementBoundingBox.left + tolerance,
                };
            case types_1.SideNames.Top:
                return {
                    top: containerBoundingBox.top + elementBoundingBox.top + tolerance,
                    right: containerBoundingBox.left +
                        elementBoundingBox.left +
                        (hasLeftPlug
                            ? this.connectorDistanceFromCorner + this.connectorSize
                            : this.connectorDistanceFromCorner) +
                        this.connectorSize -
                        tolerance,
                    bottom: containerBoundingBox.top +
                        elementBoundingBox.top +
                        this.connectorSize -
                        tolerance,
                    left: containerBoundingBox.left +
                        elementBoundingBox.left +
                        (hasLeftPlug
                            ? this.connectorDistanceFromCorner + this.connectorSize
                            : this.connectorDistanceFromCorner) +
                        tolerance,
                };
        }
    },
    getElementBoundingBoxForFloatDetection: function (element, drawBoundingBox) {
        if (drawBoundingBox === void 0) { drawBoundingBox = false; }
        var hasGroup = !!element.dataset.groupId;
        var parentLocation = hasGroup
            ? {
                top: parseInt(element.style.top),
                left: parseInt(element.style.left),
            }
            : { top: 0, left: 0 };
        var diffX = element.offsetWidth / 2 - this.floatTolerance / 2;
        var diffY = element.offsetHeight / 2 - this.floatTolerance / 2;
        var pos = {
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
        var box = {
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
    drawBox: function (box, container, borderColor) {
        var div = document.createElement("div");
        div.classList.add("bounding-box-indicator");
        div.style.position = "absolute";
        div.style.zIndex = "100";
        div.style.top = (box.top || box.y) + "px";
        div.style.left = (box.left || box.x) + "px";
        div.style.width = (box.width || box.right - box.left || 1) + "px";
        div.style.height = (box.height || box.bottom - box.top || 1) + "px";
        div.style.border = "5px solid ".concat(borderColor || "green");
        div.style.pointerEvents = "none";
        if (container) {
            container.appendChild(div);
        }
        else {
            document.body.appendChild(div);
        }
    },
    removeAllBoundingBoxIndicators: function () {
        var elements = document.querySelectorAll(".bounding-box-indicator");
        if (elements.length > 0) {
            elements.forEach(function (el) { return el.remove(); });
        }
    },
    getBoundingBoxForOffset: function (element) {
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
    getStyleBoundingBox: function (element) {
        var top = parseInt(element.style.top);
        var left = parseInt(element.style.left);
        return {
            top: top,
            right: left + element.offsetWidth,
            bottom: top + element.offsetHeight,
            left: left,
            width: element.offsetWidth,
            height: element.offsetHeight,
        };
    },
    getPocketByCollision: function (box) {
        var i = 0;
        var pockets = document.querySelectorAll(".pocket");
        while (i < pockets.length) {
            var pocket = pockets[i];
            if (Utils.hasCollision(pocket.getBoundingClientRect(), box)) {
                return pocket;
            }
            i++;
        }
    },
    getEventBox: function (e) {
        return {
            top: e.clientY,
            right: e.clientX,
            bottom: e.clientY,
            left: e.clientX,
        };
    },
    getIndividualPiecesOnCanvas: function () {
        var pieces = document.querySelectorAll(".puzzle-piece");
        return Array.from(pieces).filter(function (el) {
            return (!el.dataset.issolved &&
                !el.dataset.groupId &&
                !el.classList.contains("in-pocket"));
        });
    },
    isOverPockets: function (box) {
        var pocketsBox = document.querySelector("#pockets").getBoundingClientRect();
        // Utils.drawBox(box);
        // Utils.drawBox(pocketsBox);
        return Utils.hasCollision(box, pocketsBox);
    },
    isPuzzlePiece: function (target) {
        var classes = target.classList;
        return (constants_js_1.PUZZLE_PIECE_CLASSES.some(function (c) { return classes.contains(c); }) &&
            !classes.contains("in-pocket"));
    },
    getPuzzlePieceElementFromEvent: function (e) {
        var _a;
        var classes = (_a = e.target) === null || _a === void 0 ? void 0 : _a.classList;
        if (!classes)
            return;
        var isPuzzlePiece = classes.contains("puzzle-piece");
        var isPuzzlePieceLayerElement = classes.contains("puzzle-piece-fg");
        if (isPuzzlePiece) {
            return e.target;
        }
        if (isPuzzlePieceLayerElement) {
            return e.target.parentNode;
        }
    },
    elementIsInDragContainer: function (element) {
        return ((element === null || element === void 0 ? void 0 : element.parentNode).id ===
            constants_js_1.ELEMENT_IDS.DRAGANDSELECT_CONTAINER ||
            (element === null || element === void 0 ? void 0 : element.parentNode).id ===
                constants_js_1.ELEMENT_IDS.POCKET_DRAG_CONTAINER);
    },
    isPocketDragContainer: function (element) {
        return element.id === constants_js_1.ELEMENT_IDS.POCKET_DRAG_CONTAINER;
    },
    isDragAndSelectDragContainer: function (element) {
        return element.id === constants_js_1.ELEMENT_IDS.DRAGANDSELECT_CONTAINER;
    },
    getOrientation: function (boundingBox) {
        var width = boundingBox.width;
        var height = boundingBox.height;
        return width === height
            ? "square"
            : width < height
                ? "portrait"
                : "landscape";
    },
    evalBez: function (poly, t) {
        var x = poly[0] * (1 - t) * (1 - t) * (1 - t) +
            3 * poly[1] * t * (1 - t) * (1 - t) +
            3 * poly[2] * t * t * (1 - t) +
            poly[3] * t * t * t;
        return x;
    },
    getCurveBoundingBox: function (controlPoints) {
        var P = controlPoints;
        var PX = [P[0].x, P[1].x, P[2].x, P[3].x];
        var PY = [P[0].y, P[1].y, P[2].y, P[3].y];
        var a = 3 * P[3].x - 9 * P[2].x + 9 * P[1].x - 3 * P[0].x;
        var b = 6 * P[0].x - 12 * P[1].x + 6 * P[2].x;
        var c = 3 * P[1].x - 3 * P[0].x;
        //alert("a "+a+" "+b+" "+c);
        var disc = b * b - 4 * a * c;
        var xl = P[0].x;
        var xh = P[0].x;
        if (P[3].x < xl)
            xl = P[3].x;
        if (P[3].x > xh)
            xh = P[3].x;
        if (disc >= 0) {
            var t1 = (-b + Math.sqrt(disc)) / (2 * a);
            // alert("t1 " + t1);
            if (t1 > 0 && t1 < 1) {
                var x1 = Utils.evalBez(PX, t1);
                if (x1 < xl)
                    xl = x1;
                if (x1 > xh)
                    xh = x1;
            }
            var t2 = (-b - Math.sqrt(disc)) / (2 * a);
            // alert("t2 " + t2);
            if (t2 > 0 && t2 < 1) {
                var x2 = Utils.evalBez(PX, t2);
                if (x2 < xl)
                    xl = x2;
                if (x2 > xh)
                    xh = x2;
            }
        }
        a = 3 * P[3].y - 9 * P[2].y + 9 * P[1].y - 3 * P[0].y;
        b = 6 * P[0].y - 12 * P[1].y + 6 * P[2].y;
        c = 3 * P[1].y - 3 * P[0].y;
        disc = b * b - 4 * a * c;
        var yl = P[0].y;
        var yh = P[0].y;
        if (P[3].y < yl)
            yl = P[3].y;
        if (P[3].y > yh)
            yh = P[3].y;
        if (disc >= 0) {
            var t1 = (-b + Math.sqrt(disc)) / (2 * a);
            // alert("t3 " + t1);
            if (t1 > 0 && t1 < 1) {
                var y1 = Utils.evalBez(PY, t1);
                if (y1 < yl)
                    yl = y1;
                if (y1 > yh)
                    yh = y1;
            }
            var t2 = (-b - Math.sqrt(disc)) / (2 * a);
            // alert("t4 " + t2);
            if (t2 > 0 && t2 < 1) {
                var y2 = Utils.evalBez(PY, t2);
                if (y2 < yl)
                    yl = y2;
                if (y2 > yh)
                    yh = y2;
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
exports.default = Utils;
