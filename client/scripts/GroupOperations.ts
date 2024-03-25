import CanvasOperations from "./CanvasOperations";
import { ConnectorType, MovableElement } from "./types";
import Utils from "./utils";
import SingleMovable from "./SingleMovable";

export interface GroupOperationsProperties {
  width: number;
  height: number;
  puzzleImage: HTMLImageElement;
  shadowOffset: number;
  piecesPerSideHorizontal: number;
  piecesPerSideVertical: number;
  position?: {
    top: number;
    left: number;
  };
  zIndex?: number;
}

export default interface GroupOperations extends GroupOperationsProperties {
  CanvasOperations: CanvasOperations;
}

export default class GroupOperations implements GroupOperationsProperties {
  constructor(config: GroupOperationsProperties) {
    this.width = config.width;
    this.height = config.height;
    this.puzzleImage = config.puzzleImage;
    this.shadowOffset = config.shadowOffset;
    this.position = config.position;
    this.zIndex = config.zIndex;
    this.piecesPerSideHorizontal = config.piecesPerSideHorizontal;
    this.piecesPerSideVertical = config.piecesPerSideVertical;
    this.CanvasOperations = new CanvasOperations({
      boardWidth: this.width,
      boardHeight: this.height,
      puzzleImage: this.puzzleImage,
      shadowOffset: this.shadowOffset,
    });
  }

  isGroupSolved(groupId: string): boolean | void {
    if (!groupId) return;
    return Array.from(this.getPiecesInGroup(groupId)).some(
      (p: HTMLDivElement) => p.dataset.isSolved === "true"
    );
  }

  static getGroupTopContainer(el: HTMLDivElement): MovableElement {
    if (!el.classList.contains("grouped")) {
      // If this element isn't in a group just return itself.
      return el;
    }
    if (
      el.classList.contains("group-container") &&
      !el.classList.contains("subgroup")
    ) {
      return el;
    } else {
      return this.getGroupTopContainer(el.parentNode as MovableElement);
    }
  }

  getGroup(element: MovableElement) {
    return element.dataset.groupId ? element.dataset.groupId : null;
  }

  getPiecesInGroup(groupId: string): NodeListOf<MovableElement> {
    const container = document.querySelector(
      `#group-container-${groupId}`
    ) as MovableElement;
    return container.querySelectorAll(".puzzle-piece");
  }

  static getPiecesInGroupContainer(container: MovableElement) {
    return container.querySelectorAll(".puzzle-piece");
  }

  static getSolvedPieces(): NodeListOf<MovableElement> {
    return document.querySelectorAll("#group-container-1111 .puzzle-piece");
  }

  getConnections(el: MovableElement) {
    const attrValue = el.dataset.connections;
    return attrValue
      ? attrValue.indexOf(",") > -1
        ? attrValue.split(",")
        : [attrValue]
      : [];
  }

  getCollisionCandidatesInGroup(groupId: string) {
    const elementsInGroup = this.getPiecesInGroup(groupId);
    console.log(
      "getCollisionCandidatesInGroup: piecesInGroup",
      groupId,
      elementsInGroup
    );
    const candidates: MovableElement[] = [];
    const totalNumberOfPieces = parseInt(
      elementsInGroup[0].dataset.numPuzzlePieces as string
    );
    if (elementsInGroup.length === totalNumberOfPieces) {
      return [Utils.getElementByPieceId(0)];
    }

    elementsInGroup.forEach((element: MovableElement) => {
      const connections = this.getConnections(element);
      const pieceType = (element.dataset.jigsawType as string)
        .split(",")
        .map((n) => parseInt(n)) as ConnectorType[];
      const isSolved = element.dataset.isSolved === "true";
      if (Utils.isInnerPiece(pieceType) && connections.length < 4) {
        candidates.push(element);
      }
      if (Utils.isSidePiece(pieceType) && connections.length < 3) {
        candidates.push(element);
      }
      if (Utils.isCornerPiece(pieceType) && !isSolved) {
        candidates.push(element);
      }
    });
    return candidates;
  }

  static generateGroupId() {
    return new Date().getTime();
  }

  static setIdForGroupElements(
    groupContainerElement: MovableElement,
    id: string
  ) {
    // set group ID on group container element, elements in group and on canvas element
    const idAsString = id + "";
    groupContainerElement.dataset.groupId = idAsString;
    Array.from(groupContainerElement.querySelectorAll(".puzzle-piece")).forEach(
      (element: MovableElement) => (element.dataset.groupId = idAsString)
    );
    (
      groupContainerElement.querySelector("canvas") as HTMLCanvasElement
    ).dataset.groupId = idAsString;
  }

  createGroup(sourceInstance: SingleMovable, targetInstance: SingleMovable) {
    console.log("target style top", parseInt(targetInstance.element.style.top));
    console.log("target solved top", targetInstance.pieceData.solvedY);
    const leftPos =
      parseInt(targetInstance.element.style.left) -
      targetInstance.pieceData.solvedX;
    const topPos =
      parseInt(targetInstance.element.style.top) -
      targetInstance.pieceData.solvedY;

    const container = this.createGroupContainer();
    const newCanvas = this.CanvasOperations.makeCanvas();

    console.log("createGroup", targetInstance.pieceData.solvedX);
    console.log("createGroup", targetInstance.pieceData.solvedY);

    sourceInstance.element.style.left = Utils.getPxString(
      sourceInstance.pieceData.solvedX
    );
    sourceInstance.element.style.top = Utils.getPxString(
      sourceInstance.pieceData.solvedY
    );
    targetInstance.element.style.left = Utils.getPxString(
      targetInstance.pieceData.solvedX
    );
    targetInstance.element.style.top = Utils.getPxString(
      targetInstance.pieceData.solvedY
    );

    sourceInstance.element.classList.add("grouped");
    targetInstance.element.classList.add("grouped");

    this.CanvasOperations.drawMovableInstancesOntoCanvas(
      newCanvas,
      [sourceInstance, targetInstance],
      this.puzzleImage,
      this.shadowOffset
    );

    // TODO: Refactor Util methods to expect type array only, not piece object containing it.
    // Not sure if this logic is entirely applicable...
    const elementAIsSolved = Utils.isSolved(sourceInstance.element);
    const elementBIsSolved = Utils.isSolved(targetInstance.element);

    if (elementAIsSolved || elementBIsSolved) {
      sourceInstance.element.setAttribute("data-is-solved", "true");
      targetInstance.element.setAttribute("data-is-solved", "true");
      container.setAttribute("data-is-solved", "true");
    }

    this.updateConnections([sourceInstance.element, targetInstance.element]);
    this.setGroupContainerPosition(container, {
      top: topPos,
      left: leftPos,
    });

    container.appendChild(newCanvas);

    return { container, position: { top: topPos, left: leftPos } };
  }

  createGroupContainer(groupId?: string): MovableElement {
    const container = document.createElement("div");
    container.classList.add("group-container");

    if (groupId) {
      container.id = `group-container-${groupId}`;
    }

    container.style.top = this.position?.top + "px";
    container.style.left = this.position?.left + "px";
    container.style.width = this.width + "px";
    container.style.height = this.height + "px";
    container.style.zIndex = this.zIndex + "";
    container.style.pointerEvents = "none";
    return container;
  }

  getElementsForGroup(groupId: string): MovableElement[] {
    const allElements = document.querySelectorAll(".puzzle-piece");
    const filtered: MovableElement[] = [];
    for (let i = 0, l = allElements.length; i < l; i++) {
      const element = allElements[i] as MovableElement;
      const elementGroupId = element.dataset.groupId as string;
      if (elementGroupId === groupId) {
        filtered.push(element);
      }
    }
    return filtered;
  }

  // @param alignGroupToElement: Should the group align itself to the element being added to it?
  // default: false
  addToGroup(
    sourceInstance: SingleMovable,
    groupId: string,
    alignGroupToElement = false
  ) {
    console.log("addToGroup", groupId);
    // console.log(element)
    // console.log(element.dataset);
    // const piece = this.getPieceFromElement(element, ['solvedx', 'solvedy']);

    const element = sourceInstance.element;

    const solvedX = parseInt(element.dataset.solvedx as string);
    const solvedY = parseInt(element.dataset.solvedy as string);

    const targetGroupContainer = document.querySelector(
      `#group-container-${groupId}`
    ) as MovableElement;
    const isTargetGroupSolved =
      this.isGroupSolved(groupId) || groupId === "1111";

    // Add element(s) to target group container
    const oldGroup = this.getGroup(element);
    let followingEls: MovableElement[] = [];

    if (oldGroup) {
      let container = document.querySelector(
        `#group-container-${groupId}`
      ) as MovableElement;
      followingEls = Array.from(container.querySelectorAll(".puzzle-piece"));

      followingEls.forEach((el) => {
        targetGroupContainer.prepend(el);
        el.setAttribute("data-group", groupId + "");
        if (isTargetGroupSolved) {
          el.setAttribute("data-is-solved", "true");
        }
      });

      container.remove();
    } else {
      element.setAttribute("data-group", groupId);
      element.classList.add("grouped");

      if (alignGroupToElement) {
        targetGroupContainer.style.top = Utils.getPxString(
          element.offsetTop - solvedY
        );
        targetGroupContainer.style.left = Utils.getPxString(
          element.offsetLeft - solvedX
        );
      }

      // Add element to group and set its position
      targetGroupContainer.prepend(element);
      element.style.top = Utils.getPxString(solvedY);
      element.style.left = Utils.getPxString(solvedX);

      // Hide original canvas belonging to piece
      const oldCnv = element.querySelector("canvas");
      if (oldCnv) {
        oldCnv.remove();
      }

      followingEls.push(element);
    }

    // Re-draw group with new piece
    const elementsInTargetGroup = Array.from(this.getPiecesInGroup(groupId));
    const allPieces = [...elementsInTargetGroup, ...followingEls];
    const canvas = this.CanvasOperations.getCanvas(
      groupId
    ) as HTMLCanvasElement;
    this.CanvasOperations.drawMovableElementsOntoCanvas(
      canvas,
      allPieces,
      this.puzzleImage,
      this.shadowOffset
    );

    // Update all connections
    this.updateConnections(allPieces);

    sourceInstance.setGroupIdAcrossInstance(groupId);
  }

  setGroupContainerPosition(
    container: MovableElement,
    { top, left }: Pick<DOMRect, "top" | "left">
  ) {
    container.style.top = Utils.getPxString(top);
    container.style.left = Utils.getPxString(left);
  }

  getConnectionsForPiece(element: MovableElement) {
    const connections: string[] = [];
    const p = {
      id: parseInt(element.dataset.pieceId as string),
      type: Utils.getPieceType(element),
      group: this.getGroup(element),
    };

    const pieceTop =
      !Utils.isTopEdgePiece(p.type) &&
      Utils.getElementByPieceId(p.id - this.piecesPerSideHorizontal);
    const pieceRight =
      !Utils.isRightEdgePiece(p.type) && Utils.getElementByPieceId(p.id + 1);
    const pieceBottom =
      !Utils.isBottomEdgePiece(p.type) &&
      Utils.getElementByPieceId(p.id + this.piecesPerSideHorizontal);
    const pieceLeft =
      !Utils.isLeftEdgePiece(p.type) && Utils.getElementByPieceId(p.id - 1);

    const pieceTopGroup = pieceTop && this.getGroup(pieceTop);
    const pieceRightGroup = pieceRight && this.getGroup(pieceRight);
    const pieceBottomGroup = pieceBottom && this.getGroup(pieceBottom);
    const pieceLeftGroup = pieceLeft && this.getGroup(pieceLeft);

    if (
      pieceTopGroup &&
      pieceTopGroup === p.group &&
      !connections.includes("top")
    ) {
      connections.push("top");
    }
    if (
      pieceRightGroup &&
      pieceRightGroup === p.group &&
      !connections.includes("right")
    ) {
      connections.push("right");
    }
    if (
      pieceBottomGroup &&
      pieceBottomGroup === p.group &&
      !connections.includes("bottom")
    ) {
      connections.push("bottom");
    }
    if (
      pieceLeftGroup &&
      pieceLeftGroup === p.group &&
      !connections.includes("left")
    ) {
      connections.push("left");
    }
    return connections;
  }

  updateConnections(elements: MovableElement[]) {
    Array.from(elements).forEach((p) => {
      const connections = this.getConnectionsForPiece(p);
      p.setAttribute("data-connections", connections.join(", "));
    });
  }
}
