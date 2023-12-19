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

  piecesInGroup = [];
  elementsInGroup = [];
  puzzleId = null;

  constructor({
    puzzleData,
    elements = undefined,
    pieces = undefined,
    groupId = undefined,
  }) {
    super(puzzleData);

    console.log(groupId, pieces);

    this.width = puzzleData.boardWidth;
    this.height = puzzleData.boardHeight;

    this.puzzleId = puzzleData.puzzleId;
    this.puzzleImage = puzzleData.puzzleImage;

    if (!groupId) {
      this.initiateGroup(elements);
    } else {
      this.restoreGroupFromPersistence(groupId, pieces);
    }

    this.render();

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

  createElementsFromPieceData(pieces) {
    return pieces.map((piece) => SingleMovable.createElement(piece));
  }

  setPiecesInGroup(pieces) {
    this.piecesInGroup = pieces;
  }

  setElementsInGroup(elements) {
    this.elementsInGroup = elements;
  }

  initiateGroup(elements) {
    const groupContainer = GroupOperations.group.call(
      this,
      ...Array.from(elements)
    );

    this.element = groupContainer;
    this.canvas = groupContainer.querySelector("canvas");

    this.setElementsInGroup(elements);
    this.setPiecesInGroup(this.getPieceDataFromElements(elements));
    this.populate();
  }

  restoreGroupFromPersistence(groupId, pieces) {
    this.element = GroupOperations.restoreGroup(groupId, this.puzzleImage);
    this.groupId = groupId;

    this.setPiecesInGroup(pieces);
    this.setElementsInGroup(GroupOperations.getElementsForGroup(groupId));
    this.populate();

    const { containerX, containerY } = this.piecesInGroup[0];
    GroupOperations.setGroupContainerPosition(this.element, {
      top: containerY,
      left: containerX,
    });

    console.log(this.element);

    this.render();
  }

  render() {
    this.addToStage(this.element);
    this.populate(this.pieces);
  }

  populate() {
    Array.from(this.elementsInGroup).forEach((element) => {
      this.element.appendChild(element);
    });
  }

  onMouseDown(event) {
    if (event.which === 1) {
      const element = Utils.getPuzzlePieceElementFromEvent(event);
      if (
        this.isPuzzlePiece(element) &&
        this.isGroupedPiece(element) &&
        !Utils.isSolved(element)
      ) {
        this.element = element.parentNode;
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
    if (this.isOutOfBounds()) {
      this.resetPosition();
    } else {
      this.connection = this.getConnection();
      super.onMouseUp();
    }

    this.clean();
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
    return Array.from(this.elementsInGroup).every((element) => {
      return pieceIds.includes(parseInt(element.dataset.pieceId));
    });
  }

  isServerResponseForThisGroup(data) {
    if (!data) return;
    const pieceIds = this.getPieceIdsFromServerResponse(data.pieceData);
    return data._id === this.groupId || this.arePieceIdsInThisGroup(pieceIds);
  }

  onSaveResponse(event) {
    const response = event.detail;
    if (this.isServerResponseForThisGroup(response.data)) {
      if (!this.groupId) {
        this.groupId = response.data._id;
        this.element.dataset.groupId = this.groupId;
        this.canvas.dataset.groupId = this.groupId;

        Events.notify(EVENT_TYPES.GROUP_CREATED, {
          groupId: this.groupId,
          elementIds: this.elementsInGroup.map((element) =>
            parseInt(element.dataset.pieceId)
          ),
        });
      }
    }
  }

  save() {
    Events.notify(EVENT_TYPES.SAVE, this);
  }

  clean() {
    if (this.active) {
      super.clean();
    }
  }
}
