import BaseMovable from "./BaseMovable.js";
import { checkConnections } from "./checkConnections.js";
import { EVENT_TYPES } from "./constants.js";
import Events from "./events.js";
import GroupOperations from "./GroupOperations.js";
import { SingleMovable } from "./SingleMovable.js";
import Utils from "./utils.js";

export default class GroupMovable extends BaseMovable {
  groupId = null;
  element = null;
  canvas = null;

  groupId = null;
  piecesInGroup = [];
  elementsInGroup = [];
  puzzleId = null;

  position = {
    top: null,
    left: null,
  };

  constructor({
    puzzleData,
    pieces,
    groupId = undefined,
    position = undefined,
  }) {
    super(puzzleData);

    // console.log("Group constructor", groupId, pieces);

    this.piecesInGroup = pieces;

    this.puzzleId = puzzleData.puzzleId;
    this.puzzleImage = puzzleData.puzzleImage;

    this.width = puzzleData.boardWidth;
    this.height = puzzleData.boardHeight;

    if (!groupId) {
      this.initiateGroup();
    } else {
      this.restoreGroupFromPersistence(groupId, pieces, position);
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

  set groupId(groupId) {
    this.groupId = groupId;
  }

  get groupId() {
    return this.groupId;
  }

  getPieceDataFromElements(elements) {
    return elements.map((element) => Utils.getPieceFromElement(element));
  }

  initiateGroup() {
    const { container, position } = GroupOperations.group.call(
      this,
      ...this.piecesInGroup
    );

    this.element = container;
    this.position = position;
    this.canvas = container.querySelector("canvas");

    this.populate();
    this.render();
  }

  restoreGroupFromPersistence(groupId, pieces, position) {
    // console.log("restoring group", groupId, pieces, position);
    this.groupId = groupId;
    this.position = position;
    this.piecesInGroup = pieces;

    this.element = GroupOperations.restoreGroup(groupId, this.puzzleImage);
    this.element.style.top = position.top + "px";
    this.element.style.left = position.left + "px";
    this.element.style.width = this.width + "px";
    this.element.style.height = this.height + "px";

    this.render();
  }

  populate() {
    Array.from(this.piecesInGroup).forEach((piece) => {
      this.element.appendChild(piece.element);
    });
  }

  render() {
    this.populate(this.pieces);
    this.addToStage(this.element);
  }

  onMouseDown(event) {
    if (event.which === 1) {
      const element = Utils.getPuzzlePieceElementFromEvent(event);
      if (
        element &&
        this.isPuzzlePiece(element) &&
        this.isGroupedPiece(element) &&
        !Utils.isSolved(element)
      ) {
        this.element = element.parentNode;
        console.log("group movable: element", this.element);
        this.active = true;

        super.onPickup.call(this, event);
      }
    }
  }

  getConnection() {
    const collisionCandidates = GroupOperations.getCollisionCandidatesInGroup(
      GroupOperations.getGroup(this.element)
    );

    let connection;
    let i = 0;

    while (i < collisionCandidates.length && !connection) {
      connection = checkConnections.call(this, collisionCandidates[i]);
      if (connection) return connection;
      i++;
    }
  }

  onMouseUp() {
    if (this.active) {
      if (this.isOutOfBounds()) {
        this.resetPosition();
      } else {
        this.connection = this.getConnection();
        super.onMouseUp();
      }

      this.clean();
    }
  }

  onMoveFinished() {
    this.save();
  }

  getPieceIdsFromServerResponse(pieceData) {
    const ids = [];
    pieceData.forEach((data) => ids.push(data.id));
    return ids;
  }

  arePieceIdsInThisGroup(pieceIds) {
    console.log("arePieceIdsInThisGroup", pieceIds);
    return this.piecesInGroup.every((piece) => {
      console.log("piece instance", piece);
      return pieceIds.includes(piece.pieceData.id);
    });
  }

  isServerResponseForThisGroup(data) {
    if (!data) return;
    const pieceIds = this.getPieceIdsFromServerResponse(data.pieces);
    return data._id === this.groupId || this.arePieceIdsInThisGroup(pieceIds);
  }

  setGroupIdAcrossInstance(id) {
    console.log("setGroupIdAcrossInstance", id);
    this.groupId = id;
    this.element.dataset.groupId = this.groupId;
    this.canvas.dataset.groupId = this.groupId;
    this.piecesInGroup.forEach((pieceInstance) => {
      pieceInstance.setGroupIdAcrossInstance(this.groupId);
    });
  }

  onSaveResponse(event) {
    const response = event.detail;
    if (this.isServerResponseForThisGroup(response.data)) {
      if (!this.groupId) {
        this.setGroupIdAcrossInstance(response.data._id);
        Events.notify(EVENT_TYPES.GROUP_CREATED, {
          groupId: this.groupId,
          elementIds: this.piecesInGroup.map((piece) =>
            parseInt(piece.pieceData.id)
          ),
        });
      }

      this.setPosition(this.element.getBoundingClientRect());
    }
  }

  getAllPieceData() {
    return this.piecesInGroup.map((piece) => piece.pieceData);
  }

  getDataForSave() {
    const elementPosition = {
      top: this.element.offsetTop,
      left: this.element.offsetLeft,
    };
    return {
      _id: this.groupId,
      pieces: this.getAllPieceData(),
      puzzleId: this.puzzleId,
      position: elementPosition,
    };
  }

  setPosition(box) {
    this.position = {
      top: box.top,
      left: box.left,
    };
  }

  save() {
    console.log("group save called", this.active);
    if (this.active || !this.groupId) {
      Events.notify(EVENT_TYPES.SAVE, this);
    }
  }

  clean() {
    if (this.active) {
      super.clean();
    }
  }
}
