"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var canvasOperations_js_1 = require("./canvasOperations.js");
var utils_js_1 = require("./utils.js");
var GroupOperations = /** @class */ (function () {
    function GroupOperations(config) {
        this.width = config.width;
        this.height = config.height;
        this.puzzleImage = config.puzzleImage;
        this.shadowOffset = config.shadowOffset;
        this.position = config.position;
        this.zIndex = config.zIndex;
        this.piecesPerSideHorizontal = config.piecesPerSideHorizontal;
        this.piecesPerSideVertical = config.piecesPerSideVertical;
        this.CanvasOperations = new canvasOperations_js_1.default({
            boardWidth: this.width,
            boardHeight: this.height,
            puzzleImage: this.puzzleImage,
            shadowOffset: this.shadowOffset,
        });
    }
    GroupOperations.prototype.isGroupSolved = function (groupId) {
        if (!groupId)
            return;
        return Array.from(this.getPiecesInGroup(groupId)).some(function (p) { return p.dataset.isSolved === "true"; });
    };
    GroupOperations.getGroupTopContainer = function (el) {
        if (!el.classList.contains("grouped")) {
            // If this element isn't in a group just return itself.
            return el;
        }
        if (el.classList.contains("group-container") &&
            !el.classList.contains("subgroup")) {
            return el;
        }
        else {
            return this.getGroupTopContainer(el.parentNode);
        }
    };
    GroupOperations.prototype.getGroup = function (element) {
        return element.dataset.groupId ? element.dataset.groupId : null;
    };
    GroupOperations.prototype.getPiecesInGroup = function (groupId) {
        var container = document.querySelector("#group-container-".concat(groupId));
        return container.querySelectorAll(".puzzle-piece");
    };
    GroupOperations.getPiecesInGroupContainer = function (container) {
        return container.querySelectorAll(".puzzle-piece");
    };
    GroupOperations.getSolvedPieces = function () {
        return document.querySelectorAll("#group-container-1111 .puzzle-piece");
    };
    GroupOperations.prototype.getConnections = function (el) {
        var attrValue = el.dataset.connections;
        return attrValue
            ? attrValue.indexOf(",") > -1
                ? attrValue.split(",")
                : [attrValue]
            : [];
    };
    GroupOperations.prototype.getCollisionCandidatesInGroup = function (groupId) {
        var _this = this;
        var elementsInGroup = this.getPiecesInGroup(groupId);
        console.log("getCollisionCandidatesInGroup: piecesInGroup", groupId, elementsInGroup);
        var candidates = [];
        var totalNumberOfPieces = parseInt(elementsInGroup[0].dataset.numPuzzlePieces);
        if (elementsInGroup.length === totalNumberOfPieces) {
            return [utils_js_1.default.getElementByPieceId(0)];
        }
        elementsInGroup.forEach(function (element) {
            var connections = _this.getConnections(element);
            var pieceType = element.dataset.jigsawType
                .split(",")
                .map(function (n) { return parseInt(n); });
            var isSolved = element.dataset.isSolved === "true";
            if (utils_js_1.default.isInnerPiece(pieceType) && connections.length < 4) {
                candidates.push(element);
            }
            if (utils_js_1.default.isSidePiece(pieceType) && connections.length < 3) {
                candidates.push(element);
            }
            if (utils_js_1.default.isCornerPiece(pieceType) && !isSolved) {
                candidates.push(element);
            }
        });
        return candidates;
    };
    GroupOperations.generateGroupId = function () {
        return new Date().getTime();
    };
    GroupOperations.setIdForGroupElements = function (groupContainerElement, id) {
        // set group ID on group container element, elements in group and on canvas element
        var idAsString = id + "";
        groupContainerElement.dataset.groupId = idAsString;
        Array.from(groupContainerElement.querySelectorAll(".puzzle-piece")).forEach(function (element) { return (element.dataset.groupId = idAsString); });
        groupContainerElement.querySelector("canvas").dataset.groupId = idAsString;
    };
    GroupOperations.prototype.createGroup = function (sourceInstance, targetInstance) {
        var container = this.createGroupContainer();
        var newCanvas = this.CanvasOperations.makeCanvas();
        var leftPos = targetInstance.element.offsetLeft - targetInstance.pieceData.solvedX;
        var topPos = targetInstance.element.offsetTop - targetInstance.pieceData.solvedY;
        sourceInstance.element.style.left = utils_js_1.default.getPxString(sourceInstance.pieceData.solvedX);
        sourceInstance.element.style.top = utils_js_1.default.getPxString(sourceInstance.pieceData.solvedY);
        targetInstance.element.style.left = utils_js_1.default.getPxString(targetInstance.pieceData.solvedX);
        targetInstance.element.style.top = utils_js_1.default.getPxString(targetInstance.pieceData.solvedY);
        sourceInstance.element.classList.add("grouped");
        targetInstance.element.classList.add("grouped");
        this.CanvasOperations.drawPiecesOntoCanvas(newCanvas, [sourceInstance.element, targetInstance.element], this.puzzleImage, this.shadowOffset);
        // TODO: Refactor Util methods to expect type array only, not piece object containing it.
        // Not sure if this logic is entirely applicable...
        var elementAIsSolved = utils_js_1.default.isSolved(sourceInstance.element);
        var elementBIsSolved = utils_js_1.default.isSolved(targetInstance.element);
        if (elementAIsSolved || elementBIsSolved) {
            sourceInstance.element.setAttribute("data-is-solved", "true");
            targetInstance.element.setAttribute("data-is-solved", "true");
            container.setAttribute("data-is-solved", "true");
        }
        this.updateConnections([sourceInstance.element, targetInstance.element]);
        this.setGroupContainerPosition(container, {
            y: topPos,
            x: leftPos,
        });
        container.appendChild(newCanvas);
        return { container: container, position: { top: topPos, left: leftPos } };
    };
    GroupOperations.prototype.createGroupContainer = function (groupId) {
        var _a, _b;
        var container = document.createElement("div");
        container.classList.add("group-container");
        if (groupId) {
            container.id = "group-container-".concat(groupId);
        }
        container.style.top = ((_a = this.position) === null || _a === void 0 ? void 0 : _a.top) + "px";
        container.style.left = ((_b = this.position) === null || _b === void 0 ? void 0 : _b.left) + "px";
        container.style.width = this.width + "px";
        container.style.height = this.height + "px";
        container.style.zIndex = this.zIndex + "";
        container.style.pointerEvents = "none";
        return container;
    };
    GroupOperations.prototype.getElementsForGroup = function (groupId) {
        var allElements = document.querySelectorAll(".puzzle-piece");
        var filtered = [];
        for (var i = 0, l = allElements.length; i < l; i++) {
            var element = allElements[i];
            var elementGroupId = parseInt(element.dataset.groupId);
            if (elementGroupId === groupId) {
                filtered.push(element);
            }
        }
        return filtered;
    };
    // @param alignGroupToElement: Should the group align itself to the element being added to it?
    // default: false
    GroupOperations.prototype.addToGroup = function (sourceInstance, groupId, alignGroupToElement) {
        if (alignGroupToElement === void 0) { alignGroupToElement = false; }
        console.log("addToGroup", groupId);
        // console.log(element)
        // console.log(element.dataset);
        // const piece = this.getPieceFromElement(element, ['solvedx', 'solvedy']);
        var element = sourceInstance.element;
        var solvedX = parseInt(element.dataset.solvedx);
        var solvedY = parseInt(element.dataset.solvedy);
        var targetGroupContainer = document.querySelector("#group-container-".concat(groupId));
        var isTargetGroupSolved = this.isGroupSolved(groupId) || groupId === "1111";
        // Add element(s) to target group container
        var oldGroup = this.getGroup(element);
        var followingEls = [];
        if (oldGroup) {
            var container = document.querySelector("#group-container-".concat(groupId));
            followingEls = Array.from(container.querySelectorAll(".puzzle-piece"));
            followingEls.forEach(function (el) {
                targetGroupContainer.prepend(el);
                el.setAttribute("data-group", groupId + "");
                if (isTargetGroupSolved) {
                    el.setAttribute("data-is-solved", "true");
                }
            });
            container.remove();
        }
        else {
            element.setAttribute("data-group", groupId);
            element.classList.add("grouped");
            if (alignGroupToElement) {
                targetGroupContainer.style.top = utils_js_1.default.getPxString(element.offsetTop - solvedY);
                targetGroupContainer.style.left = utils_js_1.default.getPxString(element.offsetLeft - solvedX);
            }
            // Add element to group and set its position
            targetGroupContainer.prepend(element);
            element.style.top = utils_js_1.default.getPxString(solvedY);
            element.style.left = utils_js_1.default.getPxString(solvedX);
            // Hide original canvas belonging to piece
            var oldCnv = element.querySelector("canvas");
            if (oldCnv) {
                oldCnv.remove();
            }
            followingEls.push(element);
        }
        // Re-draw group with new piece
        var elementsInTargetGroup = Array.from(this.getPiecesInGroup(groupId));
        var allPieces = __spreadArray(__spreadArray([], elementsInTargetGroup, true), followingEls, true);
        var canvas = this.CanvasOperations.getCanvas(groupId);
        this.CanvasOperations.drawPiecesOntoCanvas(canvas, allPieces, this.puzzleImage, this.shadowOffset);
        // Update all connections
        this.updateConnections(allPieces);
        sourceInstance.setGroupIdAcrossInstance(groupId);
    };
    GroupOperations.prototype.setGroupContainerPosition = function (container, _a) {
        var top = _a.top, left = _a.left;
        container.style.top = utils_js_1.default.getPxString(top);
        container.style.left = utils_js_1.default.getPxString(left);
    };
    GroupOperations.prototype.getConnectionsForPiece = function (element) {
        var connections = [];
        var p = {
            id: parseInt(element.dataset.pieceId),
            type: utils_js_1.default.getPieceType(element),
            group: this.getGroup(element),
        };
        var pieceTop = !utils_js_1.default.isTopEdgePiece(p.type) &&
            utils_js_1.default.getElementByPieceId(p.id - this.piecesPerSideHorizontal);
        var pieceRight = !utils_js_1.default.isRightEdgePiece(p.type) && utils_js_1.default.getElementByPieceId(p.id + 1);
        var pieceBottom = !utils_js_1.default.isBottomEdgePiece(p.type) &&
            utils_js_1.default.getElementByPieceId(p.id + this.piecesPerSideHorizontal);
        var pieceLeft = !utils_js_1.default.isLeftEdgePiece(p.type) && utils_js_1.default.getElementByPieceId(p.id - 1);
        var pieceTopGroup = pieceTop && this.getGroup(pieceTop);
        var pieceRightGroup = pieceRight && this.getGroup(pieceRight);
        var pieceBottomGroup = pieceBottom && this.getGroup(pieceBottom);
        var pieceLeftGroup = pieceLeft && this.getGroup(pieceLeft);
        if (pieceTopGroup &&
            pieceTopGroup === p.group &&
            !connections.includes("top")) {
            connections.push("top");
        }
        if (pieceRightGroup &&
            pieceRightGroup === p.group &&
            !connections.includes("right")) {
            connections.push("right");
        }
        if (pieceBottomGroup &&
            pieceBottomGroup === p.group &&
            !connections.includes("bottom")) {
            connections.push("bottom");
        }
        if (pieceLeftGroup &&
            pieceLeftGroup === p.group &&
            !connections.includes("left")) {
            connections.push("left");
        }
        return connections;
    };
    GroupOperations.prototype.updateConnections = function (elements) {
        var _this = this;
        Array.from(elements).forEach(function (p) {
            var connections = _this.getConnectionsForPiece(p);
            p.setAttribute("data-connections", connections.join(", "));
        });
    };
    return GroupOperations;
}());
exports.default = GroupOperations;
