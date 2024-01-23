import BaseMovable from "./BaseMovable.js";
import CanvasOperations from "./canvasOperations.js";
import { checkConnections } from "./checkConnections.js";
import { EVENT_TYPES } from "./constants.js";
import Events from "./events.js";
import GroupOperations from "./GroupOperations.js";
import Pockets from "./pockets.js";
import Utils from "./utils.js";

export default class SingleMovable extends BaseMovable {
  // Fucking awful - must solve "can't access before initialisation" error so we can interrogate instanceof instead of doing this...
  instanceType = "SingleMovable";

  element = null;
  pieceData = null;
  active = false;
  lastPosition = {
    top: null,
    left: null,
  };
  puzzleId = null;
  _id = null;
  groupId = null;

  constructor({ puzzleData, pieceData }) {
    super(puzzleData);
    // console.log("SingleMovable constructor:", pieceData);

    this.puzzleId = puzzleData.puzzleId;
    this._id = pieceData._id;

    this.piecesPerSideHorizontal = puzzleData.piecesPerSideHorizontal;
    this.shadowOffset = puzzleData.shadowOffset;
    this.Puzzly = puzzleData;
    this.pocket = pieceData.pocket;
    this.Pockets = puzzleData.Pockets;

    if (pieceData.groupId) {
      this.groupId = pieceData.groupId;
    }

    this.setPiece(pieceData);
    this.element = SingleMovable.createElement.call(this, puzzleData);

    this.setLastPosition(pieceData.pageY, pieceData.pageX);

    if (!puzzleData.complete) {
      this.render();
      this.save();
    }

    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener(
      EVENT_TYPES.PUZZLE_LOADED,
      this.onPuzzleLoaded.bind(this)
    );
    window.addEventListener(
      EVENT_TYPES.MOVE_FINISHED,
      this.onMoveFinished.bind(this)
    );
    window.addEventListener(
      EVENT_TYPES.GROUP_CREATED,
      this.onGroupCreated.bind(this)
    );
  }

  set element(element) {
    this.element = element;
  }

  get element() {
    return this.element;
  }

  set active(active) {
    this.active = active;
  }

  get active() {
    return this.active;
  }

  setPiece(pieceData) {
    this.pieceData = pieceData;
    // console.log(" setting piecedata", this.pieceData);
  }

  static createElement(puzzleData) {
    const {
      id,
      _id,
      puzzleId,
      groupId,
      imgX,
      imgY,
      imgW,
      imgH,
      pageY,
      pageX,
      solvedY,
      solvedX,
      zIndex,
      spritePath,
      spriteY,
      spriteX,
      spriteShadowY,
      spriteShadowX,
      isInnerPiece,
      isSolved,
      numPiecesFromTopEdge,
      numPiecesFromLeftEdge,
      pocketId,
      type,
      svgPath,
    } = this.pieceData;

    const el = document.createElement("div");
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
    el.setAttribute("data-element-identifier", _id);
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
    el.setAttribute(
      "data-connects-to",
      JSON.stringify(
        SingleMovable.getConnectingPieceIds(this.pieceData, puzzleData)
      )
    );
    el.setAttribute("data-connections", GroupOperations.getConnections(el));
    el.setAttribute("data-num-pieces-from-top-edge", numPiecesFromTopEdge);
    el.setAttribute("data-num-pieces-from-left-edge", numPiecesFromLeftEdge);
    el.setAttribute("data-is-solved", isSolved);

    const fgEl = document.createElement("div");
    fgEl.classList.add("puzzle-piece-fg");
    fgEl.style.backgroundImage = `url(${spritePath}`;
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

    const bgEl = document.createElement("div");
    bgEl.classList.add("puzzle-piece-bg");
    bgEl.style.position = "absolute";
    bgEl.width = imgW;
    bgEl.height = imgH;
    bgEl.style.width = imgW + "px";
    bgEl.style.height = imgH + "px";
    bgEl.style.top = this.shadowOffset + "px";
    bgEl.style.left = this.shadowOffset + "px";
    bgEl.style.backgroundImage = `url(${spritePath}`;
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
  }

  render() {
    // console.log("rendering piece", this.pieceData);
    const { type, pageX, pageY, isSolved, pocket } = this.pieceData;

    if (Number.isInteger(pocket)) {
      const pocketElement = this.pocketsContainer.querySelector(
        `#pocket-${pocket}`
      );

      this.Pockets.addSingleToPocket(pocketElement, this);
      return;
    }

    if (!GroupOperations.hasGroup({ type }) && !isSolved) {
      this.addToStage.call(this);
      return;
    }

    if (isSolved) {
      this.solve();
    }
  }

  isElementOwned(element) {
    if (!element) return;
    return element.dataset.pieceIdInPersistence === this.pieceData._id;
  }

  hasMouseDown(element) {
    return element.id === this.element.id;
  }

  addToPocket(pocket) {
    const innerElement = pocket.querySelector(".pocket-inner");
    innerElement.prepend(this.element);
  }

  addToSolved() {
    GroupOperations.addToGroup(this.element, this.solvedGroupId);
  }

  isOutOfBounds(event) {
    return !this.isInsidePlayArea() && !this.isOverPockets(event);
  }

  markAsSolved() {
    this.element.dataset.isSolved = true;
  }

  static getConnectingPieceIds(pieceData, puzzleData) {
    const id = pieceData.id;
    const pieceAboveId = id - puzzleData.piecesPerSideHorizontal;
    const pieceBelowId = id + puzzleData.piecesPerSideHorizontal;

    if (Utils.isTopLeftCorner(pieceData)) {
      return {
        right: id + 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isTopSide(pieceData)) {
      return {
        left: id - 1,
        right: id + 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isTopRightCorner(pieceData)) {
      return {
        left: id - 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isLeftSide(pieceData)) {
      return {
        top: pieceAboveId,
        right: id + 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isInnerPiece(pieceData)) {
      return {
        top: pieceAboveId,
        right: id + 1,
        bottom: pieceBelowId,
        left: id - 1,
      };
    }
    if (Utils.isRightSide(pieceData)) {
      return {
        top: pieceAboveId,
        left: id - 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isBottomLeftCorner(pieceData)) {
      return {
        top: pieceAboveId,
        right: id + 1,
      };
    }
    if (Utils.isBottomSide(pieceData)) {
      return {
        top: pieceAboveId,
        left: id - 1,
        right: id + 1,
      };
    }
    if (Utils.isBottomRightCorner(pieceData)) {
      return {
        top: pieceAboveId,
        left: id - 1,
      };
    }
  }

  onMouseDown(event) {
    if (event.which === 1) {
      const element = Utils.getPuzzlePieceElementFromEvent(event);
      if (
        element &&
        !BaseMovable.isGroupedPiece(element) &&
        this.hasMouseDown(element) &&
        !this.isPocketPiece(element) &&
        !this.isDragAndSelectActive &&
        !this.isSolved
      ) {
        this.active = true;
        this.Puzzly.keepOnTop(this.element);
        super.onPickup(event);
      }
    }
  }

  onMouseUp(event) {
    if (this.active) {
      if (this.isOutOfBounds(event)) {
        this.resetPosition();
      } else if (this.isOverPockets(event)) {
        const pocket = this.getPocketByCollision(Utils.getEventBox(event));
        this.Pockets.addSingleToPocket(pocket, this);
        this.pocket = parseInt(pocket.id.split("-")[1]);
      } else {
        this.connection = checkConnections.call(this, this.element);
        this.elementsToSaveIfNoConnection = [this.element];
      }
    }

    super.onMouseUp(event);
  }

  setLastPosition() {
    this.lastPosition = {
      top: parseInt(this.element.style.top),
      left: parseInt(this.element.style.left),
    };
  }

  onPuzzleLoaded() {
    this.save();
  }

  onMoveFinished() {
    if (this.active) {
      if (!BaseMovable.isGroupedPiece(this.element)) {
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
  }

  solve(options) {
    this.solvedContainer.appendChild(this.element);
    this.element.classList.add("grouped");
    this.element.dataset.isSolved = true;
    this.setPositionAsGrouped();
    this.element.style.visibility = "hidden";
    this.element.style.pointerEvents = "none";
    this.isSolved = true;

    setTimeout(() => {
      this.Puzzly.updateSolvedCanvas();
    }, 0);

    // Are we using this?
    if (options?.save) {
      this.save(true);
    }
  }

  setGroupIdAcrossInstance(groupId) {
    this.groupId = groupId;
    this.element.dataset.groupId = groupId;
    this.pieceData.groupId = groupId;
  }

  onGroupCreated(event) {
    const { groupId, elementIds } = event.detail;
    if (elementIds.includes(parseInt(this.element.dataset.pieceId))) {
      this.setGroupIdAcrossInstance(groupId);
    }
  }

  setPositionAsGrouped() {
    this.element.style.top = this.pieceData.solvedY + "px";
    this.element.style.left = this.pieceData.solvedX + "px";
  }

  joinTo(groupInstance) {
    // console.log("SingleMovable joining to", groupInstance);
    this.setGroupIdAcrossInstance(groupInstance._id);
    this.element.classList.add("grouped");
    groupInstance.addPieces([this]);
    groupInstance.redrawCanvas();
    this.setPositionAsGrouped();
    groupInstance.save(true);
  }

  getDataForSave() {
    return {
      pageX: this.element.offsetLeft,
      pageY: this.element.offsetTop,
      zIndex: parseInt(this.element.style.zIndex),
      isSolved: this.isSolved,
      groupId: this.pieceData.groupId,
      puzzleId: this.puzzleId,
      _id: this.pieceData._id,
      pocket: this.pocket,
      instanceType: this.instanceType,
      isPuzzleComplete: this.isPuzzleComplete(),
    };
  }

  save(force = false) {
    // console.log("Save single piece", this.getDataForSave());
    if (force || (this.active && !this.connection)) {
      Events.notify(EVENT_TYPES.SAVE, this.getDataForSave());
    }
  }
}
