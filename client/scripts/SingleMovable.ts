import BaseMovable from "./BaseMovable";
import { checkConnections } from "./checkConnections";
import { EVENT_TYPES, HTML_ATTRIBUTE_NAME_SVG_PATH_STRING, SHAPE_TYPES, SVGNS } from "./constants";
import GroupMovable from "./GroupMovable";
import GroupOperations from "./GroupOperations";
import Pockets from "./Pockets";
import { getJigsawShapeSvgString } from "./svg";
import Puzzly from "./Puzzly";
import PathOperations from "./pathOperations";

import {
  DomBox,
  InstanceTypes,
  JigsawPieceData,
  MovableElement,
  SingleMovableSaveState,
  XYCoordinate,
} from "./types";
import Utils from "./utils";

export default class SingleMovable extends BaseMovable {
  instanceType = InstanceTypes.SingleMovable;
  shapeType = SHAPE_TYPES.PLAIN;
  pieceData: JigsawPieceData;
  puzzleId: string;
  _id: string;
  groupId: string;
  GroupOperations: GroupOperations;
  piecesPerSideHorizontal: number;
  piecesPerSideVertical: number;
  totalNumberOfPieces: number;
  isSolved: boolean;
  Puzzly: Puzzly;
  pocketId?: number;
  Pockets: Pockets;

  constructor({
    puzzleData,
    pieceData,
  }: {
    puzzleData: Puzzly;
    pieceData: JigsawPieceData;
  }) {
    super(puzzleData);
    console.log("SingleMovable constructor:", pieceData);

    this.GroupOperations = new GroupOperations({
      width: this.Puzzly.boardWidth,
      height: this.Puzzly.boardHeight,
      puzzleImage: this.Puzzly.puzzleImage,
      shadowOffset: this.Puzzly.shadowOffset,
      piecesPerSideHorizontal: this.Puzzly.piecesPerSideHorizontal,
      piecesPerSideVertical: this.Puzzly.piecesPerSideVertical,
    });

    this.Puzzly = puzzleData;
    this.puzzleId = this.Puzzly.puzzleId;
    this._id = pieceData._id;
    this.totalNumberOfPieces = this.Puzzly.selectedNumPieces;

    this.piecesPerSideHorizontal = this.Puzzly.piecesPerSideHorizontal;
    this.shadowOffset = puzzleData.shadowOffset;
    this.connectorDistanceFromCorner = puzzleData.connectorDistanceFromCorner;
    this.pocketId = pieceData.pocketId;
    this.Pockets = this.Puzzly.Pockets;

    if (pieceData.groupId) {
      this.groupId = pieceData.groupId;
    }

    this.setPiece(pieceData);
    this.element = this.createElement();

    this.setLastPosition({ top: pieceData.pageY, left: pieceData.pageX });

    if (!this.Puzzly.complete) {
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
    window.addEventListener(
      EVENT_TYPES.PIECE_UPDATED,
      this.onUpdated.bind(this)
    );
  }

  setPiece(pieceData: JigsawPieceData) {
    this.pieceData = pieceData;
    // console.log(" setting piecedata", this.pieceData);
  }

  createElement() {
    const {
      index,
      _id,
      groupId,
      width,
      height,
      basePieceSize,
      connectorDistanceFromCorner,
      connectorSize,
      connectorTolerance,
      pageY,
      pageX,
      solvedY,
      solvedX,
      zIndex,
      puzzleX,
      puzzleY,
      isInnerPiece,
      isSolved,
      numPiecesFromTopEdge,
      numPiecesFromLeftEdge,
      numberOfPiecesHorizontal,
      numberOfPiecesVertical,
      pocketId,
      type,
      svgPath,
    } = this.pieceData;

    // console.log("SingleMovable", this.pieceData)

    const el = document.createElement("div");
    el.classList.add("puzzle-piece");
    el.id = "piece-" + index;

    el.style.position = "absolute";
    el.style.width = width + "px";
    el.style.height = height + "px";

    if (pocketId === undefined || pocketId === null) {
      el.style.top = (!!groupId ? solvedY : pageY) + "px";
      el.style.left = (!!groupId ? solvedX : pageX) + "px";
    }
    el.style.pointerEvents = "auto";
    el.style.zIndex = (zIndex || 1) + "";

    el.setAttribute("data-jigsaw-type", type.join(","));
    el.setAttribute(
      "data-connector-distance-from-corner",
      connectorDistanceFromCorner + ""
    );
    el.setAttribute("data-connector-tolerance", connectorTolerance + "");
    el.setAttribute("data-connector-size", connectorSize + "");
    el.setAttribute("data-base-piece-size", basePieceSize + "");
    el.setAttribute("data-shadow-offset", this.shadowOffset + "");
    el.setAttribute("data-piece-index", index + "");
    el.setAttribute("data-piece-id-in-persistence", _id);
    el.setAttribute("data-puzzle-id", this.puzzleId);
    el.setAttribute("data-solvedX", puzzleX + "");
    el.setAttribute("data-solvedY", puzzleY + "");
    el.setAttribute("data-pageX", pageX + "");
    el.setAttribute("data-pageY", pageY + "");
    el.setAttribute("data-svgPath", svgPath);
    el.setAttribute("data-is-inner-piece", isInnerPiece + "");
    el.setAttribute(
      "data-pieces-per-side-horizontal",
      numberOfPiecesHorizontal + ""
    );
    el.setAttribute(
      "data-pieces-per-side-vertical",
      numberOfPiecesVertical + ""
    );
    el.dataset.connectsTo = JSON.stringify(
      this.getConnectingPieceIds(this.pieceData)
    );
    el.setAttribute(
      "data-connections",
      JSON.stringify(this.GroupOperations.getConnections(el))
    );
    el.setAttribute("data-num-pieces-from-top-edge", numPiecesFromTopEdge + "");
    el.setAttribute(
      "data-num-pieces-from-left-edge",
      numPiecesFromLeftEdge + ""
    );
    el.setAttribute("data-total-number-of-pieces", this.totalNumberOfPieces + "");
    el.setAttribute("data-is-solved", isSolved + "");

    this.element = el;

    if (groupId) {
      el.dataset.groupId = groupId;
      el.classList.add("grouped");
    }

    if (pocketId) {
      el.setAttribute("data-pocket-id", pocketId + "");
    }

    const { boardWidth, boardHeight, puzzleImagePath } = this.Puzzly;
    // console.log("piece size", pieceSize)

    const pathString = getJigsawShapeSvgString(this.pieceData);
    el.setAttribute(HTML_ATTRIBUTE_NAME_SVG_PATH_STRING, pathString);

    const shapeId = `shape-${index}`;
    const clipId = `clip-${index}`;

    const svgElementTemplate = `
      <svg xmlns="${SVGNS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="puzzle-piece-svg">
        <defs>
          <path id="${shapeId}" d="${pathString}"></path>
        </defs>
        <clipPath id="${clipId}">
            <use href="#${shapeId}"></use>
        </clipPath>
        <use href="#${shapeId}" fill="none" stroke="black" stroke-width="1"></use>
        <use href="#${shapeId}" fill="black" x="2" y="2"></use>
        <image class="svg-image" clip-path="url(#${clipId})" href="${puzzleImagePath}" width="${boardWidth}" height="${boardHeight}" x="-${puzzleX}" y="-${puzzleY}" />
      </svg>
    `;

    el.innerHTML = svgElementTemplate;
    return el;
  }

  render() {
    // console.log("rendering piece", this.pieceData);
    const { type, pageX, pageY, isSolved, pocketId } = this.pieceData;

    if (Number.isInteger(pocketId)) {
      const pocketElement = this.pocketsContainer.querySelector(
        `#pocket-${pocketId}`
      );

      this.Pockets.addSingleToPocket(pocketElement as HTMLDivElement, this);
      return;
    }

    if (isSolved) {
      this.solve();
    } else {
      this.addToStage.call(this);
      this.setConnectorBoundingBoxes()
    }
  }

  setConnectorBoundingBoxes() {
    const pathString = this.element.getAttribute(HTML_ATTRIBUTE_NAME_SVG_PATH_STRING) as string;
    const result = PathOperations.extractPathParts(pathString);
    const connectors = PathOperations.getCurveControlPointsFromPathParts(result) as XYCoordinate[][];

    const connectorBoundingBoxes: {
      top: number; left: number; width: number; height: number
    }[] = connectors.map((connector) => {
      const [...points] = connector;

      const allXValues = points.map(p => p.x);
      const allYValues = points.map(p => p.y);
      const lowestY = Math.min(...allYValues);
      const highestY = Math.max(...allYValues);
      const lowestX = Math.min(...allXValues);
      const highestX = Math.max(...allXValues);

      const box = {
        top: lowestY,
        left: lowestX,
        width: highestX - lowestX,
        height: highestY - lowestY,
      };

      // Utils.drawBox(box, this.element)

      return box;
    });

    this.element.setAttribute(
      "data-connector-bounding-boxes",
      JSON.stringify(connectorBoundingBoxes)
    )
  }

  isElementOwned(element: MovableElement) {
    return element.dataset.pieceIdInPersistence === this.pieceData._id;
  }

  hasMouseDown(element: HTMLElement) {
    return element.id === this.element.id;
  }

  addToPocket(pocket: HTMLDivElement) {
    const innerElement = pocket.querySelector(".pocket-inner");
    innerElement?.prepend(this.element);
  }

  addToSolved() {
    this.GroupOperations.addToGroup(this, this.solvedGroupId + "");
  }

  isOutOfBounds(event: MouseEvent) {
    return !this.isInsidePlayArea() && !this.isOverPockets(event);
  }

  markAsSolved() {
    this.element.dataset.isSolved = "true";
  }

  getConnectingPieceIds(
    data: Pick<JigsawPieceData, "index" | "numberOfPiecesHorizontal" | "type">
  ) {
    const id = data.index;
    const pieceAboveId = id - data.numberOfPiecesHorizontal;
    const pieceBelowId = id + data.numberOfPiecesHorizontal;

    if (Utils.isTopLeftCorner(data.type)) {
      return {
        right: id + 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isTopSide(data.type)) {
      return {
        left: id - 1,
        right: id + 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isTopRightCorner(data.type)) {
      return {
        left: id - 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isLeftSide(data.type)) {
      return {
        top: pieceAboveId,
        right: id + 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isInnerPiece(data.type)) {
      return {
        top: pieceAboveId,
        right: id + 1,
        bottom: pieceBelowId,
        left: id - 1,
      };
    }
    if (Utils.isRightSide(data.type)) {
      return {
        top: pieceAboveId,
        left: id - 1,
        bottom: pieceBelowId,
      };
    }
    if (Utils.isBottomLeftCorner(data.type)) {
      return {
        top: pieceAboveId,
        right: id + 1,
      };
    }
    if (Utils.isBottomSide(data.type)) {
      return {
        top: pieceAboveId,
        left: id - 1,
        right: id + 1,
      };
    }
    if (Utils.isBottomRightCorner(data.type)) {
      return {
        top: pieceAboveId,
        left: id - 1,
      };
    }
  }

  onMouseDown(event: MouseEvent) {
    if (event.which === 1) {
      const element = Utils.getPuzzlePieceElementFromEvent(
        event
      ) as MovableElement;
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

  onMouseUp(event: MouseEvent) {
    if (this.active) {
      if (this.isOutOfBounds(event)) {
        this.resetPosition();
      } else if (this.isOverPockets(event)) {
        const pocket = this.getPocketByCollision(Utils.getEventBox(event));
        if (pocket) {
          this.Pockets.addSingleToPocket(pocket, this);
          this.pocketId = parseInt(pocket.id.split("-")[1]);
        }
      } else {
        // console.log("solving area box", this.getSolvingAreaBoundingBox());
        this.connection = checkConnections(
          this.element,
          this.getSolvingAreaBoundingBox(),
          this.connectorTolerance
        );
        console.log("connection", this.connection);
      }
    }

    super.onMouseUp(event);
  }

  setLastPosition(position?: Pick<DomBox, "top" | "left">) {
    this.lastPosition = {
      top: position?.top || parseInt(this.element.style.top),
      left: position?.left || parseInt(this.element.style.left),
    };
  }

  onPuzzleLoaded() {
    this.save();
  }

  onMoveFinished() {
    if (this.active) {
      if (!BaseMovable.isGroupedPiece(this.element)) {
        this.setLastPosition({
          left: this.element.offsetLeft,
          top: this.element.offsetTop,
        });

        // Only save if this piece isn't in a group
        // (If it is in a group, the group will notify this piece to save once group operations are complete)
        this.save(true);
        this.active = false;
      }
    }
  }

  solve(options?: { save: boolean } | undefined) {
    console.log("SingleInstance", this, "solve()");
    this.solvedContainer.appendChild(this.element);
    this.element.classList.add("grouped");
    this.element.dataset.isSolved = "true";
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

  setGroupIdAcrossInstance(groupId: string) {
    this.groupId = groupId;
    this.element.dataset.groupId = groupId;
    this.pieceData.groupId = groupId;
  }

  onGroupCreated(event: CustomEvent) {
    const { groupId, elementIds } = event.detail;
    if (elementIds.includes(this.element.dataset.pieceId)) {
      this.setGroupIdAcrossInstance(groupId);
    }
  }

  setPositionAsGrouped() {
    this.element.style.top = this.pieceData.solvedY + "px";
    this.element.style.left = this.pieceData.solvedX + "px";
  }

  joinTo(targetInstance: GroupMovable | SingleMovable) {
    console.log("SingleInstance", this, "joinTo()", targetInstance);
    if (targetInstance.instanceType === InstanceTypes.SingleMovable) {
      this.Puzzly.groupInstances.push(
        new GroupMovable({
          Puzzly: this.Puzzly,
          pieces: [this, targetInstance as SingleMovable],
        })
      );
    } else {
      const instance = targetInstance as GroupMovable;
      console.log("SingleMovable joining to", instance);
      this.setGroupIdAcrossInstance(instance._id + "");
      this.element.classList.add("grouped");
      // TDOD: Encapsulate in single method on target instance?
      instance.addPieces([this]);
      instance.redrawCanvas();
      this.setPositionAsGrouped();
      instance.save(true);
    }
  }

  getDataForSave(): SingleMovableSaveState {
    return {
      index: this.pieceData.index,
      basePieceSize: this.pieceData.basePieceSize,
      connectorSize: this.pieceData.connectorSize,
      connectorTolerance: this.pieceData.connectorTolerance,
      connectorDistanceFromCorner: this.pieceData.connectorDistanceFromCorner,
      width: this.pieceData.width,
      height: this.pieceData.height,
      pageX: this.element.offsetLeft,
      pageY: this.element.offsetTop,
      puzzleX: this.pieceData.puzzleX,
      puzzleY: this.pieceData.puzzleY,
      type: this.pieceData.type,
      zIndex: parseInt(this.element.style.zIndex),
      isSolved: this.isSolved,
      groupId: this.pieceData.groupId,
      puzzleId: this.puzzleId,
      _id: this.pieceData._id,
      pocket: this.pocketId as number,
      instanceType: this.instanceType,
      isPuzzleComplete: this.isPuzzleComplete(),
    };
  }

  save(force = false) {
    // console.log("Save single piece", this.getDataForSave());
    if (force || (this.active && !this.connection)) {
      window.dispatchEvent(
        new CustomEvent(EVENT_TYPES.SAVE, { detail: this.getDataForSave() })
      );
    }
  }

  onUpdated(event: CustomEvent) {
    // console.log(this.pieceData.index, "Received piece_updated event", event)
    const { index, puzzleX, puzzleY } = this.pieceData;
    const { index: uIndex, puzzleX: uPuzzleX, puzzleY: uPuzzleY, _id: uId } = event.detail;
    if (uIndex === index && uPuzzleX === puzzleX && uPuzzleY === puzzleY) {
      this.setId(uId);
    }
  }

  setId(id: string) {
    // console.log("Setting ID for piece", this.pieceData.index, id)
    this.pieceData._id = id;
    this.element.setAttribute("data-piece-id-in-persistence", id);
    this._id = id;
  }
}
