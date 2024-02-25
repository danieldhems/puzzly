"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var GroupOperations_js_1 = require("./GroupOperations.js");
var types_1 = require("./types");
var BaseMovable = /** @class */ (function () {
    function BaseMovable(puzzly) {
        var _this = this;
        this.active = false;
        this.zoomLevel = 1;
        this.isDragAndSelectActive = false;
        this.Puzzly = puzzly;
        // console.log("puzzly", puzzly);
        this.puzzleImage = puzzly.puzzleImage;
        this.piecesContainer = document.querySelector("#".concat(constants_1.ELEMENT_IDS.PIECES_CONTAINER));
        this.solvedContainer = document.getElementById(constants_1.ELEMENT_IDS.SOLVED_CONTAINER);
        this.playBoundary = document.getElementById(constants_1.ELEMENT_IDS.PLAY_BOUNDARY);
        this.solvedCanvas = document.getElementById(constants_1.ELEMENT_IDS.SOLVED_CANVAS);
        this.pocketsContainer = document.querySelector("#".concat(constants_1.ELEMENT_IDS.POCKETS));
        this.pockets = this.pocketsContainer.querySelectorAll(".pocket");
        // Needed for collision detection
        this.connectorTolerance = puzzly.connectorTolerance;
        this.connectorDistanceFromCorner = puzzly.connectorDistanceFromCorner;
        this.connectorSize = puzzly.connectorSize;
        this.shadowOffset = puzzly.shadowOffset;
        this.boardWidth = puzzly.boardWidth;
        this.boardHeight = puzzly.boardHeight;
        this.groupOperations = new GroupOperations_js_1.default({
            width: this.Puzzly.boardWidth,
            height: this.Puzzly.boardHeight,
            puzzleImage: this.Puzzly.puzzleImage,
            shadowOffset: this.Puzzly.shadowOffset,
            piecesPerSideHorizontal: this.Puzzly.piecesPerSideHorizontal,
            piecesPerSideVertical: this.Puzzly.piecesPerSideVertical,
        });
        window.addEventListener(constants_1.EVENT_TYPES.CHANGE_SCALE, this.onChangeScale.bind(this));
        window.addEventListener(constants_1.EVENT_TYPES.DRAGANDSELECT_ACTIVE, function (event) {
            _this.isDragAndSelectActive = event.detail;
        });
    }
    BaseMovable.prototype.getMovableInstanceFromElement = function (element) {
        if (element.dataset.groupId) {
            return this.Puzzly.groupInstances.find(function (instance) {
                return instance.piecesInGroup.some(function (piece) { return piece.groupId === element.dataset.groupId; });
            });
        }
        else {
            return this.Puzzly.pieceInstances.find(function (instance) { return instance._id === element.dataset.pieceIdInPersistence; });
        }
    };
    BaseMovable.prototype.onChangeScale = function (event) {
        this.zoomLevel = event.detail;
    };
    BaseMovable.prototype.isPuzzlePiece = function (target) {
        var classes = target === null || target === void 0 ? void 0 : target.classList;
        if (!classes)
            return;
        return constants_1.PUZZLE_PIECE_CLASSES.some(function (c) { return classes.contains(c); });
    };
    BaseMovable.prototype.isSinglePiece = function (element) {
        var classes = element.classList;
        return (constants_1.PUZZLE_PIECE_CLASSES.some(function (c) { return classes.contains(c); }) &&
            !classes.contains("in-pocket") &&
            !classes.contains("grouped"));
    };
    BaseMovable.prototype.isPlayBoundary = function (element) {
        return (element.id === constants_1.ELEMENT_IDS.PLAY_BOUNDARY ||
            element.id === constants_1.ELEMENT_IDS.SOLVED_PUZZLE_AREA);
    };
    BaseMovable.isGroupedPiece = function (element) {
        if (element.dataset.groupId) {
            return element.dataset.groupId.length > 0;
        }
        return false;
    };
    BaseMovable.prototype.isPocketPiece = function (element) {
        var parentElement = element.parentNode;
        if (parentElement.id) {
            return parentElement.id === constants_1.ELEMENT_IDS.POCKET_DRAG_CONTAINER;
        }
        return false;
    };
    BaseMovable.prototype.isDragAndSelectPiece = function (element) {
        var parentElement = element.parentNode;
        if (parentElement.id) {
            return parentElement.id === constants_1.ELEMENT_IDS.DRAGANDSELECT_CONTAINER;
        }
        return false;
    };
    BaseMovable.prototype.getPocketByCollision = function (box) {
        var i = 0;
        while (i <= this.pockets.length) {
            var pocket = this.pockets[i];
            if (this.hasCollision(pocket, box)) {
                return pocket;
            }
            i++;
        }
    };
    BaseMovable.prototype.hasCollision = function (targetElement, source) {
        var targetBoundingBox = targetElement.getBoundingClientRect();
        var thisBoundingBox = source || this.element.getBoundingClientRect();
        return utils_1.default.hasCollision(thisBoundingBox, targetBoundingBox);
    };
    BaseMovable.prototype.isInsidePlayArea = function () {
        return utils_1.default.isInside(this.element.getBoundingClientRect(), this.piecesContainer.getBoundingClientRect());
    };
    BaseMovable.prototype.isOverPockets = function (event) {
        return this.hasCollision(this.pocketsContainer, utils_1.default.getEventBox(event));
    };
    BaseMovable.prototype.addToStage = function (element) {
        var elementToAdd = element || this.element;
        // console.log("element to add", this);
        this.piecesContainer.prepend(elementToAdd);
    };
    BaseMovable.prototype.isPuzzleComplete = function () {
        var numbrOfSolvedPieces = this.solvedContainer.querySelectorAll(".puzzle-piece").length;
        return this.puzzly.selectedNumPieces === numbrOfSolvedPieces;
    };
    // Lifecycle method called when a movable is picked up i.e. the user has begun interacting with it
    BaseMovable.prototype.onPickup = function (event) {
        var mousePosition = {
            top: event.clientY,
            left: event.clientX,
        };
        // Apply the zoomLevel to everything except for the play boundary (all other movables are children of this)
        if (this.instanceType === types_1.InstanceTypes.PlayBoundaryMovable) {
            this.diffX = mousePosition.left - parseInt(this.element.style.left);
            this.diffY = mousePosition.top - parseInt(this.element.style.top);
        }
        else {
            // TODO: Shouldn't be accessing the zoomLevel on a global like this.
            this.diffX =
                mousePosition.left -
                    parseInt(this.element.style.left) * window.Zoom.zoomLevel;
            this.diffY =
                mousePosition.top -
                    parseInt(this.element.style.top) * window.Zoom.zoomLevel;
        }
        // Store a reference to our event handlers so we can remove them later
        // (They don't get removed if we don't use these)
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
    };
    // Lifecycle method called when a movable is put down up i.e. the user has finished interacting with it
    // Actually not sure about this one...
    BaseMovable.prototype.onDrop = function () {
        this.clean();
    };
    BaseMovable.prototype.onMouseMove = function (event) {
        if (this.active && !this.dragAndSelectActive) {
            var newPosTop = void 0, newPosLeft = void 0;
            if (this.instanceType === "PlayBoundaryMovable") {
                // this.shouldConstrainViewport()
                // Viewport constraint not yet implemented so just ignore for now and move the play boundary around freely
                newPosTop = event.clientY - this.diffY;
                newPosLeft = event.clientX - this.diffX;
            }
            else {
                newPosTop =
                    event.clientY / window.Zoom.zoomLevel -
                        this.diffY / window.Zoom.zoomLevel;
                newPosLeft =
                    event.clientX / window.Zoom.zoomLevel -
                        this.diffX / window.Zoom.zoomLevel;
            }
            this.element.style.top = newPosTop + "px";
            this.element.style.left = newPosLeft + "px";
        }
    };
    BaseMovable.prototype.onMouseUp = function (event) {
        if (this.connection) {
            console.log("connection", this.connection);
            this.handleConnection();
        }
        window.dispatchEvent(new CustomEvent(constants_1.EVENT_TYPES.MOVE_FINISHED, { detail: event }));
        this.clean();
    };
    BaseMovable.prototype.handleConnection = function () {
        var _a = this.connection, sourceElement = _a.sourceElement, targetElement = _a.targetElement, isSolving = _a.isSolving;
        var sourceInstance = this.getMovableInstanceFromElement(sourceElement);
        if (targetElement) {
            var targetInstance = this.getMovableInstanceFromElement(targetElement);
            if (isSolving) {
                sourceInstance.solve({ save: true });
            }
            else {
                sourceInstance.joinTo(targetInstance);
            }
            window.dispatchEvent(new CustomEvent(constants_1.EVENT_TYPES.CONNECTION_MADE, {
                detail: {
                    sourceInstance: sourceInstance,
                    targetInstance: targetInstance,
                    isSolving: isSolving,
                },
            }));
        }
    };
    BaseMovable.prototype.isConnectionBetweenSingleAndGroup = function (sourceInstanceType, targetInstanceType) {
        return ((sourceInstanceType === types_1.InstanceTypes.SingleMovable &&
            targetInstanceType === types_1.InstanceTypes.GroupMovable) ||
            (targetInstanceType === types_1.InstanceTypes.SingleMovable &&
                sourceInstanceType === types_1.InstanceTypes.GroupMovable));
    };
    BaseMovable.prototype.isConnectionBetweenTwoGroups = function (sourceInstanceType, targetInstanceType) {
        return ((sourceInstanceType === "GroupMovable" &&
            targetInstanceType === "GroupMovable") ||
            (sourceInstanceType === "GroupMovable" &&
                targetInstanceType === "GroupMovable"));
    };
    BaseMovable.prototype.getPosition = function () {
        return {
            top: this.element.offsetTop,
            left: this.element.offsetLeft,
        };
    };
    BaseMovable.prototype.resetPosition = function () {
        if (this.active) {
            this.element.style.top = this.lastPosition.top + "px";
            this.element.style.left = this.lastPosition.left + "px";
        }
    };
    BaseMovable.prototype.clean = function () {
        this.active = false;
        if (typeof this.onMouseMove === "function") {
            window.removeEventListener("mousemove", this.onMouseMove);
        }
        if (typeof this.onMouseUp === "function") {
            window.removeEventListener("mouseup", this.onMouseUp);
        }
    };
    return BaseMovable;
}());
exports.default = BaseMovable;
