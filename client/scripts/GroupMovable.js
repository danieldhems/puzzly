import GroupOperations from "./GroupOperations.js";
import { checkConnections } from "./checkConnections.js";
import { EVENT_TYPES } from "./constants.js";
import Events from "./events.js";
import Utils from "./utils.js";
import BaseMovable from "./BaseMovable.js";
import SingleMovable from "./SingleMovable.js";
import CanvasOperations from "./canvasOperations.js";
import PersistenceOperations from "./persistence.js";

export default class GroupMovable extends BaseMovable {
  // Fucking awful - must solve "can't access before initialisation" error so we can interrogate instanceof instead of doing this...
  instanceType = "GroupMovable";

  _id = null;
  element = null;
  canvas = null;

  piecesInGroup = [];
  elementsInGroup = [];
  puzzleId = null;

  lastPosition = {
    top: null,
    left: null,
  };

  constructor({
    puzzleData,
    pieces,
    _id = undefined,
    position = undefined,
    zIndex = 1,
    isSolved = false,
  }) {
    super(puzzleData);

    this.Puzzly = puzzleData;
    this._id = _id;
    this.position = position;
    this.piecesInGroup = pieces;

    this.puzzleId = puzzleData.puzzleId;
    this.puzzleImage = puzzleData.puzzleImage;

    this.width = puzzleData.boardWidth;
    this.height = puzzleData.boardHeight;
    this.shadowOffset = puzzleData.shadowOffset;

    this.zoomLevel = puzzleData.zoomLevel;

    // console.log("GroupMovable zIndex", zIndex);

    this.isSolved = isSolved;

    this.GroupOperations = new GroupOperations(this);

    if (!_id) {
      this.initiateGroup();
    } else {
      if (this.isSolved) {
        this.solve();
      } else {
        this.restoreFromPersistence();
      }
    }

    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener(
      EVENT_TYPES.MOVE_FINISHED,
      this.onMoveFinished.bind(this)
    );
    window.addEventListener(
      EVENT_TYPES.SAVE_SUCCESSFUL,
      this.onSaveResponse.bind(this)
    );
  }

  set _id(id) {
    this._id = id;
  }

  get _id() {
    return this._id;
  }

  isElementOwned(element) {
    return this.piecesInGroup.some(
      (piece) => piece.pieceData.groupId === element.dataset.groupId
    );
  }

  initiateGroup() {
    const { container, position } = this.GroupOperations.createGroup(
      ...this.piecesInGroup
    );

    this.element = container;
    this.canvas = container.querySelector("canvas");

    this.setLastPosition(position);
    this.attachElements();
    this.render();
    this.save();
  }

  restoreFromPersistence() {
    const container = this.GroupOperations.restoreGroup(this._id);
    this.element = container;
    this.canvas = canvas;
    this.attachElements();
    this.render();
  }

  async joinTo(movableInstance) {
    // console.log("GroupMovable joining to", movableInstance);

    if (movableInstance.instanceType === "SingleMovable") {
      this.alignWith(movableInstance);
      this.addPieces([movableInstance]);
      movableInstance.setPositionAsGrouped();
      movableInstance.setGroupIdAcrossInstance(this._id);
      // TODO: This should be done by the movable instance
      movableInstance.element.classList.add("grouped");
      this.save(true);
    } else if (movableInstance.instanceType === "GroupMovable") {
      if (movableInstance.isSolved) {
        this.solve();
      } else {
        await movableInstance.addPieces(this.piecesInGroup);
      }
      this.destroy();
    }
  }

  alignWith(movableInstance) {
    const position = {};

    if (movableInstance instanceof SingleMovable) {
      const { top, left } = movableInstance.getPosition();
      const { solvedX, solvedY } = movableInstance.pieceData;

      // console.log(top, solvedY, left, solvedX);
      position.top = top - solvedY;
      position.left = left - solvedX;
    } else if (movableInstance instanceof GroupMovable) {
    }

    this.element.style.top = position.top + "px";
    this.element.style.left = position.left + "px";
  }

  async addPieces(pieceInstances) {
    // console.log("pieces currently in group", this.piecesInGroup);
    this.piecesInGroup.push(...pieceInstances);
    // console.log("pieces in group after add", this.piecesInGroup);
    this.piecesInGroup.forEach((instance) =>
      instance.setGroupIdAcrossInstance(this._id)
    );
    this.attachElements();
    this.redrawCanvas();
    await this.save(true);
  }

  redrawCanvas() {
    const canvas = this.canvas;
    CanvasOperations.drawPiecesOntoCanvas(
      canvas,
      this.piecesInGroup,
      this.puzzleImage,
      this.shadowOffset
    );
  }

  removeCanvas() {
    this.element.querySelector("canvas").remove();
  }

  attachElements() {
    // console.log("attachElements", this.piecesInGroup);
    Array.from(this.piecesInGroup).forEach((piece) => {
      // console.log("attaching piece", piece);
      if (!piece.element.parentNode !== this.element) {
        this.element.appendChild(piece.element);
      } else {
        console.info(`Piece ${piece.pieceData.id} already attached to group`);
      }
    });
  }

  render() {
    this.addToStage(this.element);
  }

  isPuzzlePieceInThisGroup(element) {
    return element.dataset.groupId === this._id;
  }

  onMouseDown(event) {
    if (event.which === 1) {
      const element = Utils.getPuzzlePieceElementFromEvent(event);
      if (
        element &&
        BaseMovable.isGroupedPiece(element) &&
        this.isPuzzlePieceInThisGroup(element) &&
        !Utils.isSolved(element) &&
        !this.isSolved
      ) {
        this.element = element.parentNode;
        // console.log("group movable: element", this.element);
        this.active = true;
        this.Puzzly.keepOnTop(this.element);

        super.onPickup.call(this, event);
      }
    }
  }

  getConnection() {
    const collisionCandidates =
      this.GroupOperations.getCollisionCandidatesInGroup(
        GroupOperations.getGroup(this.element)
      );
    // console.log("collision candidates found", collisionCandidates);

    let connection;
    let i = 0;

    while (i < collisionCandidates.length && !connection) {
      connection = checkConnections.call(this, collisionCandidates[i]);
      if (connection) return connection;
      i++;
    }
  }

  onMouseUp(event) {
    if (this.active) {
      if (this.isOutOfBounds(event)) {
        this.resetPosition();
      } else {
        this.connection = this.getConnection();
        super.onMouseUp();
      }

      this.clean();
    }
  }

  onMoveFinished() {
    if (this.active) {
      console.log("GroupMovable onMoveFinished");
      this.setLastPosition();
      this.save();
    }
  }

  isOutOfBounds() {
    const playAreaBox = this.piecesContainer.getBoundingClientRect();
    return this.piecesInGroup.some(
      (instance) =>
        !Utils.isInside(instance.element.getBoundingClientRect(), playAreaBox)
    );
    // return !this.isInsidePlayArea() && !this.isOverPockets(event);
  }

  solve() {
    this.piecesInGroup.forEach((instance) => {
      this.solvedContainer.appendChild(instance.element);
      instance.element.dataset.isSolved = true;
      instance.isSolved = true;
      instance.element.style.visibility = "hidden";
      instance.element.style.pointerEvents = "none";
    });

    this.isSolved = true;

    this.Puzzly.updateSolvedCanvas();

    // this.save(true);
    this.destroy();
  }

  getPieceIdsFromServerResponse(pieceData) {
    const ids = [];
    pieceData.forEach((data) => ids.push(data.id));
    return ids;
  }

  arePieceIdsInThisGroup(pieceIds) {
    return this.piecesInGroup.every((piece) => {
      return pieceIds.includes(piece.pieceData.id);
    });
  }

  isServerResponseForThisGroup(data) {
    if (!data) return;
    const pieceIds = this.getPieceIdsFromServerResponse(data.pieces);
    return data._id === this._id || this.arePieceIdsInThisGroup(pieceIds);
  }

  setGroupIdAcrossInstance(id) {
    this._id = id;
    this.element.dataset.groupId = this._id;

    if (this.canvas) {
      this.canvas.dataset.groupId = this._id;
    }

    this.piecesInGroup.forEach((pieceInstance) => {
      // We may not need to update ALL pieces with the group id.
      // This depends on whether the group is new or being merged with another
      if (pieceInstance.groupId !== id) {
        pieceInstance.setGroupIdAcrossInstance(this._id);
      }
    });
  }

  onSaveResponse(event) {
    const response = event.detail;
    console.log("GroupMovable save response", response);
    if (this.isServerResponseForThisGroup(response.data)) {
      if (!this._id) {
        this.setGroupIdAcrossInstance(response.data._id);
        Events.notify(EVENT_TYPES.GROUP_CREATED, {
          groupId: this._id,
          elementIds: this.piecesInGroup.map((piece) =>
            parseInt(piece.pieceData.id)
          ),
        });
      }

      this.setLastPosition(this.element.getBoundingClientRect());
    }
  }

  getAllPieceData() {
    return this.piecesInGroup.map((piece) => piece.getDataForSave());
  }

  getDataForSave() {
    const elementPosition = {
      top: this.element.offsetTop,
      left: this.element.offsetLeft,
    };
    return {
      _id: this._id,
      pieces: this.getAllPieceData(),
      puzzleId: this.puzzleId,
      position: elementPosition,
      zIndex: parseInt(this.element.style.zIndex),
      instanceType: this.instanceType,
      isSolved: this.isSolved,
      isPuzzleComplete: this.isPuzzleComplete(),
    };
  }

  setPosition(box) {
    this.position = {
      top: box.top,
      left: box.left,
    };
  }

  setLastPosition() {
    this.lastPosition = {
      top: parseInt(this.element.style.top),
      left: parseInt(this.element.style.left),
    };
  }

  async save(force = false) {
    // TODO: Still seeing duplicate saves
    // console.log("group save called", this);
    if (force || this.active || !this._id) {
      return await PersistenceOperations.save(this.getDataForSave());
    }
  }

  onSaveSuccess(event) {
    const data = event.detail;
  }

  delete() {
    Events.notify(EVENT_TYPES.SAVE, {
      _id: this._id,
      instanceType: this.instanceType,
      remove: true,
    });
  }

  detachElements() {
    this.canvas.remove();
    this.element.remove();
  }

  destroy() {
    this.detachElements();
    if (!this.isSolved) {
      window.Puzzly.removeGroupInstance(this);
    }
    this.delete();
  }

  clean() {
    if (this.active) {
      super.clean();
    }
  }
}
