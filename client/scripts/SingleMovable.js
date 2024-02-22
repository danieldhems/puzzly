"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BaseMovable_1 = require("./BaseMovable");
var checkConnections_1 = require("./checkConnections");
var constants_1 = require("./constants");
var events_1 = require("./events");
var GroupOperations_1 = require("./GroupOperations");
// import PathOperations from "./pathOperations.js";
var types_1 = require("./types");
var utils_1 = require("./utils");
var SingleMovable = /** @class */ (function (_super) {
    __extends(SingleMovable, _super);
    function SingleMovable(_a) {
        var puzzleData = _a.puzzleData, pieceData = _a.pieceData;
        var _this = _super.call(this, puzzleData) || this;
        _this.instanceType = types_1.InstanceTypes.SingleMovable;
        _this.shapeType = constants_1.SHAPE_TYPES.PLAIN;
        // console.log("SingleMovable constructor:", pieceData);
        _this.GroupOperations = new GroupOperations_1.default(_this);
        _this.puzzleId = puzzleData.puzzleId;
        _this._id = pieceData._id;
        _this.piecesPerSideHorizontal = puzzleData.piecesPerSideHorizontal;
        _this.shadowOffset = puzzleData.shadowOffset;
        _this.Puzzly = puzzleData;
        _this.pocketId = pieceData.pocket;
        _this.Pockets = puzzleData.Pockets;
        if (pieceData.groupId) {
            _this.groupId = pieceData.groupId;
        }
        _this.setPiece(pieceData);
        _this.element = SingleMovable.createElement.call(_this, puzzleData);
        _this.setLastPosition(pieceData.pageY, pieceData.pageX);
        if (!puzzleData.complete) {
            _this.render();
            _this.save();
        }
        window.addEventListener("mousedown", _this.onMouseDown.bind(_this));
        window.addEventListener(constants_1.EVENT_TYPES.PUZZLE_LOADED, _this.onPuzzleLoaded.bind(_this));
        window.addEventListener(constants_1.EVENT_TYPES.MOVE_FINISHED, _this.onMoveFinished.bind(_this));
        window.addEventListener(constants_1.EVENT_TYPES.GROUP_CREATED, _this.onGroupCreated.bind(_this));
        return _this;
    }
    Object.defineProperty(SingleMovable.prototype, "element", {
        get: function () {
            return this.element;
        },
        set: function (element) {
            this.element = element;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SingleMovable.prototype, "active", {
        get: function () {
            return this.active;
        },
        set: function (active) {
            this.active = active;
        },
        enumerable: false,
        configurable: true
    });
    SingleMovable.prototype.setPiece = function (pieceData) {
        this.pieceData = pieceData;
        // console.log(" setting piecedata", this.pieceData);
    };
    SingleMovable.createElement = function (puzzleData) {
        var _a = this.pieceData, id = _a.id, _id = _a._id, puzzleId = _a.puzzleId, groupId = _a.groupId, imgX = _a.imgX, imgY = _a.imgY, imgW = _a.imgW, imgH = _a.imgH, pageY = _a.pageY, pageX = _a.pageX, solvedY = _a.solvedY, solvedX = _a.solvedX, zIndex = _a.zIndex, spritePath = _a.spritePath, spriteY = _a.spriteY, spriteX = _a.spriteX, spriteShadowY = _a.spriteShadowY, spriteShadowX = _a.spriteShadowX, isInnerPiece = _a.isInnerPiece, isSolved = _a.isSolved, numPiecesFromTopEdge = _a.numPiecesFromTopEdge, numPiecesFromLeftEdge = _a.numPiecesFromLeftEdge, selectedNumPieces = _a.selectedNumPieces, pocketId = _a.pocketId, type = _a.type, svgPath = _a.svgPath;
        var el = document.createElement("div");
        el.classList.add("puzzle-piece");
        el.id = "piece-" + id;
        el.style.position = "absolute";
        el.width = imgW;
        el.height = imgH;
        el.style.width = imgW + "px";
        el.style.height = imgH + "px";
        if (pocketId === undefined || pocketId === null) {
            el.style.top = (!!groupId ? solvedY : pageY) + "px";
            el.style.left = (!!groupId ? solvedX : pageX) + "px";
        }
        el.style.pointerEvents = "auto";
        el.style.zIndex = zIndex || 1;
        el.setAttribute("data-jigsaw-type", type.join(","));
        el.setAttribute("data-connector-distance-from-corner", this.connectorDistanceFromCorner);
        el.setAttribute("data-connector-tolerance", this.connectorTolerance);
        el.setAttribute("data-connector-distance-from-corner", this.connectorDistanceFromCorner);
        el.setAttribute("data-connector-size", this.connectorSize);
        el.setAttribute("data-shadow-offset", this.shadowOffset);
        el.setAttribute("data-piece-id", id);
        el.setAttribute("data-piece-id-in-persistence", _id);
        el.setAttribute("data-puzzle-id", puzzleId);
        el.setAttribute("data-imgX", imgX);
        el.setAttribute("data-imgy", imgY);
        el.setAttribute("data-solvedX", solvedX);
        el.setAttribute("data-solvedY", solvedY);
        el.setAttribute("data-pageX", pageX);
        el.setAttribute("data-pageY", pageY);
        el.setAttribute("data-spriteX", spriteX);
        el.setAttribute("data-spriteY", spriteY);
        el.setAttribute("data-spriteshadowx", spriteShadowX);
        el.setAttribute("data-spriteshadowy", spriteShadowY);
        el.setAttribute("data-imgW", imgW);
        el.setAttribute("data-imgH", imgH);
        el.setAttribute("data-svgPath", svgPath);
        el.setAttribute("data-is-inner-piece", isInnerPiece);
        el.setAttribute("data-connector-tolerance", this.Puzzly.connectorTolerance);
        el.setAttribute("data-connects-to", JSON.stringify(SingleMovable.getConnectingPieceIds(this.pieceData, puzzleData)));
        el.setAttribute("data-connections", this.GroupOperations.getConnections(el));
        el.setAttribute("data-num-pieces-from-top-edge", numPiecesFromTopEdge);
        el.setAttribute("data-num-pieces-from-left-edge", numPiecesFromLeftEdge);
        el.setAttribute("data-num-puzzle-pieces", selectedNumPieces);
        el.setAttribute("data-is-solved", isSolved);
        var fgEl = document.createElement("div");
        fgEl.classList.add("puzzle-piece-fg");
        fgEl.style.backgroundImage = "url(".concat(spritePath);
        fgEl.style.backgroundPositionX = spriteX === 0 ? 0 : "-" + spriteX + "px";
        fgEl.style.backgroundPositionY = spriteY === 0 ? 0 : "-" + spriteY + "px";
        fgEl.style.position = "absolute";
        fgEl.width = imgW;
        fgEl.height = imgH;
        fgEl.style.width = imgW + "px";
        fgEl.style.height = imgH + "px";
        fgEl.style.top = 0;
        fgEl.style.left = 0;
        fgEl.style.zIndex = 2;
        var bgEl = document.createElement("div");
        bgEl.classList.add("puzzle-piece-bg");
        bgEl.style.position = "absolute";
        bgEl.width = imgW;
        bgEl.height = imgH;
        bgEl.style.width = imgW + "px";
        bgEl.style.height = imgH + "px";
        bgEl.style.top = this.shadowOffset + "px";
        bgEl.style.left = this.shadowOffset + "px";
        bgEl.style.backgroundImage = "url(".concat(spritePath);
        bgEl.style.backgroundPositionX =
            spriteShadowX === 0 ? 0 : "-" + spriteShadowX + "px";
        bgEl.style.backgroundPositionY =
            spriteShadowY === 0 ? 0 : "-" + spriteShadowY + "px";
        bgEl.style.zIndex = 1;
        el.appendChild(fgEl);
        el.appendChild(bgEl);
        this.element = el;
        if (groupId) {
            el.dataset.groupId = groupId;
            el.classList.add("grouped");
        }
        if (pocketId) {
            el.setAttribute("data-pocket-id", pocketId);
        }
        return el;
    };
    SingleMovable.prototype.render = function () {
        // console.log("rendering piece", this.pieceData);
        var _a = this.pieceData, type = _a.type, pageX = _a.pageX, pageY = _a.pageY, isSolved = _a.isSolved, pocket = _a.pocket;
        if (Number.isInteger(pocket)) {
            var pocketElement = this.pocketsContainer.querySelector("#pocket-".concat(pocket));
            this.Pockets.addSingleToPocket(pocketElement, this);
            return;
        }
        if (isSolved) {
            this.solve();
        }
        else {
            this.addToStage.call(this);
        }
        // const connectorIndices = this.pieceData.type
        //   .map((val, index) => val !== 0 && index)
        //   .filter((val) => Number.isInteger(val));
        // console.log("connectorIndices", connectorIndices);
        // let i = 0;
        // while (i < connectorIndices.length) {
        //   const connectorBoundingBox =
        //     PathOperations.getConnectorBoundingBoxFromPath(
        //       i,
        //       this.pieceData,
        //       this.shapeType
        //     );
        //   console.log("bounding box for connector", connectorBoundingBox);
        //   Utils.drawBox(connectorBoundingBox, this.element);
        //   i++;
        // }
    };
    SingleMovable.prototype.isElementOwned = function (element) {
        if (!element)
            return;
        return element.dataset.pieceIdInPersistence === this.pieceData._id;
    };
    SingleMovable.prototype.hasMouseDown = function (element) {
        return element.id === this.element.id;
    };
    SingleMovable.prototype.addToPocket = function (pocket) {
        var innerElement = pocket.querySelector(".pocket-inner");
        innerElement.prepend(this.element);
    };
    SingleMovable.prototype.addToSolved = function () {
        this.GroupOperations.addToGroup(this.element, this.solvedGroupId);
    };
    SingleMovable.prototype.isOutOfBounds = function (event) {
        return !this.isInsidePlayArea() && !this.isOverPockets(event);
    };
    SingleMovable.prototype.markAsSolved = function () {
        this.element.dataset.isSolved = true;
    };
    SingleMovable.getConnectingPieceIds = function (pieceData, puzzleData) {
        var id = pieceData.id;
        var pieceAboveId = id - puzzleData.piecesPerSideHorizontal;
        var pieceBelowId = id + puzzleData.piecesPerSideHorizontal;
        if (utils_1.default.isTopLeftCorner(pieceData.type)) {
            return {
                right: id + 1,
                bottom: pieceBelowId,
            };
        }
        if (utils_1.default.isTopSide(pieceData.type)) {
            return {
                left: id - 1,
                right: id + 1,
                bottom: pieceBelowId,
            };
        }
        if (utils_1.default.isTopRightCorner(pieceData.type)) {
            return {
                left: id - 1,
                bottom: pieceBelowId,
            };
        }
        if (utils_1.default.isLeftSide(pieceData.type)) {
            return {
                top: pieceAboveId,
                right: id + 1,
                bottom: pieceBelowId,
            };
        }
        if (utils_1.default.isInnerPiece(pieceData.type)) {
            return {
                top: pieceAboveId,
                right: id + 1,
                bottom: pieceBelowId,
                left: id - 1,
            };
        }
        if (utils_1.default.isRightSide(pieceData.type)) {
            return {
                top: pieceAboveId,
                left: id - 1,
                bottom: pieceBelowId,
            };
        }
        if (utils_1.default.isBottomLeftCorner(pieceData.type)) {
            return {
                top: pieceAboveId,
                right: id + 1,
            };
        }
        if (utils_1.default.isBottomSide(pieceData.type)) {
            return {
                top: pieceAboveId,
                left: id - 1,
                right: id + 1,
            };
        }
        if (utils_1.default.isBottomRightCorner(pieceData.type)) {
            return {
                top: pieceAboveId,
                left: id - 1,
            };
        }
    };
    SingleMovable.prototype.onMouseDown = function (event) {
        if (event.which === 1) {
            var element = utils_1.default.getPuzzlePieceElementFromEvent(event);
            if (element &&
                !BaseMovable_1.default.isGroupedPiece(element) &&
                this.hasMouseDown(element) &&
                !this.isPocketPiece(element) &&
                !this.isDragAndSelectActive &&
                !this.isSolved) {
                this.active = true;
                this.Puzzly.keepOnTop(this.element);
                _super.prototype.onPickup.call(this, event);
            }
        }
    };
    SingleMovable.prototype.onMouseUp = function (event) {
        if (this.active) {
            if (this.isOutOfBounds(event)) {
                this.resetPosition();
            }
            else if (this.isOverPockets(event)) {
                var pocket = this.getPocketByCollision(utils_1.default.getEventBox(event));
                this.Pockets.addSingleToPocket(pocket, this);
                this.pocketId = parseInt(pocket.id.split("-")[1]);
            }
            else {
                this.connection = checkConnections_1.checkConnections.call(this, this.element);
                this.elementsToSaveIfNoConnection = [this.element];
            }
        }
        _super.prototype.onMouseUp.call(this, event);
    };
    SingleMovable.prototype.setLastPosition = function () {
        this.lastPosition = {
            top: parseInt(this.element.style.top),
            left: parseInt(this.element.style.left),
        };
    };
    SingleMovable.prototype.onPuzzleLoaded = function () {
        this.save();
    };
    SingleMovable.prototype.onMoveFinished = function () {
        if (this.active) {
            if (!BaseMovable_1.default.isGroupedPiece(this.element)) {
                this.setLastPosition({
                    left: this.element.offsetX,
                    top: this.element.offsetY,
                });
                // Only save if this piece isn't in a group
                // (If it is in a group, the group will notify this piece to save once group operations are complete)
                this.save(true);
                this.active = false;
            }
        }
    };
    SingleMovable.prototype.solve = function (options) {
        var _this = this;
        this.solvedContainer.appendChild(this.element);
        this.element.classList.add("grouped");
        this.element.dataset.isSolved = true;
        this.setPositionAsGrouped();
        this.element.style.visibility = "hidden";
        this.element.style.pointerEvents = "none";
        this.isSolved = true;
        setTimeout(function () {
            _this.Puzzly.updateSolvedCanvas();
        }, 0);
        // Are we using this?
        if (options === null || options === void 0 ? void 0 : options.save) {
            this.save(true);
        }
    };
    SingleMovable.prototype.setGroupIdAcrossInstance = function (groupId) {
        this.groupId = groupId;
        this.element.dataset.groupId = groupId;
        this.pieceData.groupId = groupId;
    };
    SingleMovable.prototype.onGroupCreated = function (event) {
        var _a = event.detail, groupId = _a.groupId, elementIds = _a.elementIds;
        if (elementIds.includes(parseInt(this.element.dataset.pieceId))) {
            this.setGroupIdAcrossInstance(groupId);
        }
    };
    SingleMovable.prototype.setPositionAsGrouped = function () {
        this.element.style.top = this.pieceData.solvedY + "px";
        this.element.style.left = this.pieceData.solvedX + "px";
    };
    SingleMovable.prototype.joinTo = function (groupInstance) {
        // console.log("SingleMovable joining to", groupInstance);
        this.setGroupIdAcrossInstance(groupInstance._id);
        this.element.classList.add("grouped");
        groupInstance.addPieces([this]);
        groupInstance.redrawCanvas();
        this.setPositionAsGrouped();
        groupInstance.save(true);
    };
    SingleMovable.prototype.getDataForSave = function () {
        return {
            pageX: this.element.offsetLeft,
            pageY: this.element.offsetTop,
            zIndex: parseInt(this.element.style.zIndex),
            isSolved: this.isSolved,
            groupId: this.pieceData.groupId,
            puzzleId: this.puzzleId,
            _id: this.pieceData._id,
            pocket: this.pocketId,
            instanceType: this.instanceType,
            isPuzzleComplete: this.isPuzzleComplete(),
        };
    };
    SingleMovable.prototype.save = function (force) {
        if (force === void 0) { force = false; }
        // console.log("Save single piece", this.getDataForSave());
        if (force || (this.active && !this.connection)) {
            events_1.default.notify(constants_1.EVENT_TYPES.SAVE, this.getDataForSave());
        }
    };
    return SingleMovable;
}(BaseMovable_1.default));
exports.default = SingleMovable;
