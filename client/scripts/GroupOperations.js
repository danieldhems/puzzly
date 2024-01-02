import CanvasOperations from "./canvasOperations.js";
import Utils from "./utils.js";

export default class GroupOperations {
  groupWidth;
  groupHeight;
  canvasOperations;
  piecesPerSideHorizontal;
  piecesPerSideHorizontal;

  constructor(config) {
    this.groupWidth = config.boardWidth;
    this.groupHeight = config.boardHeight;

    this.canvasOperations = new CanvasOperations(config);
    this.piecesPerSideHorizontal = config.piecesPerSideHorizontal;
    this.piecesPerSideHorizontal = config.piecesPerSideHorizontal;
  }

  static isGroupSolved(group) {
    if (!group) return;
    return Array.from(this.getPiecesInGroup(group)).some(
      (p) => p.dataset.isSolved === "true"
    );
  }

  static getGroupContainer(arg) {
    if (typeof arg === "number" || typeof arg === "string") {
      // console.log(
      //   "getGroupContainer(), getting container with selector",
      //   `group-container-${arg}`
      // );
      return Array.from(document.querySelectorAll(`.group-container`)).find(
        (container) => container.dataset.groupId === arg
      );
    } else {
      return arg.parentNode;
    }
  }

  static getGroupTopContainer(el) {
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
      return this.getGroupTopContainer(el.parentNode);
    }
  }

  static getGroup(element) {
    return element.dataset.groupId ? element.dataset.groupId : null;
  }

  static getPiecesInGroup(group) {
    const container = this.getGroupContainer(group);
    return container.querySelectorAll(".puzzle-piece");
  }

  static getPiecesInGroupContainer(container) {
    return container.querySelectorAll(".puzzle-piece");
  }

  static getSolvedPieces() {
    return document.querySelectorAll("#group-container-1111 .puzzle-piece");
  }

  static hasGroup(piece) {
    const obj = piece.dataset || piece;
    return (
      obj.group !== undefined && obj.group !== null && !Number.isNaN(obj.group)
    );
  }

  static getConnections(el) {
    const attrValue = el.dataset.connections;
    return attrValue
      ? attrValue.indexOf(",") > -1
        ? attrValue.split(",")
        : [attrValue]
      : [];
  }

  static getCollisionCandidatesInGroup(group) {
    const piecesInGroup = this.getPiecesInGroup(group);
    console.log(
      "getCollisionCandidatesInGroup: piecesInGroup",
      group,
      piecesInGroup
    );
    const candidates = [];

    if (piecesInGroup.length === this.selectedNumPieces) {
      return [Utils.getElementByPieceId(0)];
    }

    piecesInGroup.forEach((piece) => {
      const p = Utils.getPieceFromElement(piece);
      const connections = this.getConnections(piece);
      if (Utils.isInnerPiece(p) && connections.length < 4) {
        candidates.push(piece);
      }
      if (Utils.isSidePiece(p) && connections.length < 3) {
        candidates.push(piece);
      }
      if (Utils.isCornerPiece(p) && !p.isSolved) {
        candidates.push(piece);
      }
    });
    return candidates;
  }

  static generateGroupId() {
    return new Date().getTime();
  }

  static setIdForGroupElements(groupContainerElement, id) {
    // set group ID on group container element, elements in group and on canvas element
    groupContainerElement.dataset.groupId = id;
    Array.from(groupContainerElement.querySelectorAll(".puzzle-piece")).forEach(
      (element) => (element.dataset.groupId = id)
    );
    groupContainerElement.querySelector("canvas").dataset.groupId = id;
  }

  static createGroup(sourceElement, targetElement) {
    const container = GroupOperations.createGroupContainer.call(this);
    const newCanvas = CanvasOperations.makeCanvas.call(this);

    const leftPos =
      targetElement.element.offsetLeft -
      parseInt(targetElement.pieceData.solvedX);
    const topPos =
      targetElement.element.offsetTop -
      parseInt(targetElement.pieceData.solvedY);

    sourceElement.element.style.left = Utils.getPxString(
      parseInt(sourceElement.pieceData.solvedX)
    );
    sourceElement.element.style.top = Utils.getPxString(
      parseInt(sourceElement.pieceData.solvedY)
    );
    targetElement.element.style.left = Utils.getPxString(
      parseInt(targetElement.pieceData.solvedX)
    );
    targetElement.element.style.top = Utils.getPxString(
      parseInt(targetElement.pieceData.solvedY)
    );

    sourceElement.element.classList.add("grouped");
    targetElement.element.classList.add("grouped");

    CanvasOperations.drawPiecesOntoCanvas(
      newCanvas,
      [sourceElement, targetElement],
      this.puzzleImage
    );

    // TODO: Refactor Util methods to expect type array only, not piece object containing it.
    // Not sure if this logic is entirely applicable...
    const elementAIsSolved = Utils.isSolved(sourceElement.element);
    const elementBIsSolved = Utils.isSolved(targetElement.element);

    if (elementAIsSolved || elementBIsSolved) {
      this.setElementAttribute(sourceElement.element, "data-is-solved", true);
      this.setElementAttribute(targetElement.element, "data-is-solved", true);
      this.setElementAttribute(container, "data-is-solved", true);
    }

    GroupOperations.updateConnections([
      sourceElement.element,
      targetElement.element,
    ]);
    GroupOperations.setGroupContainerPosition(container, {
      top: topPos,
      left: leftPos,
    });

    container.appendChild(newCanvas);

    return { container, position: { top: topPos, left: leftPos } };
  }

  static getElementsForGroup(groupId) {
    const allElements = document.querySelectorAll(".puzzle-piece");
    return Array.from(allElements).filter((element) => {
      return parseInt(element.dataset.groupId) === groupId;
    });
  }

  // Restore the elements for an existing group
  static restoreGroup(groupId, pieces) {
    const container = GroupOperations.createGroupContainer.call(this);
    const canvas = CanvasOperations.makeCanvas.call(this);
    container.prepend(canvas);

    const elementsForGroup = GroupOperations.getElementsForGroup(groupId);
    elementsForGroup.forEach((element) => container.appendChild(element));

    GroupOperations.setIdForGroupElements(container, groupId);
    CanvasOperations.drawPiecesOntoCanvas(canvas, pieces, this.puzzleImage);

    return container;
  }

  static createGroupContainer(groupId) {
    const container = document.createElement("div");

    container.classList.add("group-container");

    container.style.width = Utils.getPxString(this.width);
    container.style.height = Utils.getPxString(this.height);
    container.style.pointerEvents = "none";
    container.style.position = "absolute";

    container.dataset.groupId = groupId;

    return container;
  }

  // @param alignGroupToElement: Should the group align itself to the element being added to it?
  // default: false
  static addToGroup(sourceInstance, groupId, alignGroupToElement = false) {
    console.log("addToGroup", groupId);
    // console.log(element)
    // console.log(element.dataset);
    // const piece = this.getPieceFromElement(element, ['solvedx', 'solvedy']);

    const element = sourceInstance.element;

    const solvedX = parseInt(element.dataset.solvedx);
    const solvedY = parseInt(element.dataset.solvedy);

    const targetGroupContainer = GroupOperations.getGroupContainer(groupId);
    const isTargetGroupSolved =
      GroupOperations.isGroupSolved(groupId) || groupId === 1111;

    // Add element(s) to target group container
    const oldGroup = GroupOperations.getGroup(element);
    let followingEls = [];

    if (oldGroup) {
      let container = GroupOperations.getGroupContainer(oldGroup);
      followingEls = container.querySelectorAll(".puzzle-piece");

      followingEls.forEach((el) => {
        targetGroupContainer.prepend(el);
        el.setAttribute("data-group", groupId);
        if (isTargetGroupSolved) {
          el.setAttribute("data-is-solved", true);
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
    const elementsInTargetGroup = GroupOperations.getPiecesInGroup(groupId);
    const allPieces = [...elementsInTargetGroup, ...followingEls];
    const canvas = CanvasOperations.getCanvas(groupId);
    CanvasOperations.drawPiecesOntoCanvas(canvas, allPieces, this.puzzleImage);

    // Update all connections
    GroupOperations.updateConnections(allPieces);

    sourceInstance.setGroupIdAcrossInstance(groupId);
  }

  static mergeGroups(elementA, elementB) {
    const pieceAGroup = GroupOperations.getGroup(elementA);
    const pieceBGroup = GroupOperations.getGroup(elementB);
    const piecesInGroupA = GroupOperations.getPiecesInGroup(pieceAGroup);

    if (
      GroupOperations.isGroupSolved(pieceAGroup) ||
      GroupOperations.isGroupSolved(pieceAGroup)
    ) {
      const containerA = GroupOperations.getGroupContainer(pieceAGroup);
      const containerB = GroupOperations.getGroupContainer(pieceBGroup);
      containerA.dataset.isSolved = true;
      containerB.dataset.isSolved = true;
    }

    return this.addToGroup(piecesInGroupA[0], pieceBGroup);
  }

  static setGroupContainerPosition(container, { top, left }) {
    container.style.top = Utils.getPxString(top);
    container.style.left = Utils.getPxString(left);
  }

  static getConnectionsForPiece(piece) {
    const connections = [];
    const p = {
      id: parseInt(piece.dataset.pieceId),
      type: Utils.getPieceType(piece),
      group: GroupOperations.getGroup(piece),
    };

    const pieceTop =
      !Utils.isTopEdgePiece(p) &&
      Utils.getElementByPieceId(p.id - this.piecesPerSideHorizontal);
    const pieceRight =
      !Utils.isRightEdgePiece(p) && Utils.getElementByPieceId(p.id + 1);
    const pieceBottom =
      !Utils.isBottomEdgePiece(p) &&
      Utils.getElementByPieceId(p.id + this.piecesPerSideHorizontal);
    const pieceLeft =
      !Utils.isLeftEdgePiece(p) && Utils.getElementByPieceId(p.id - 1);

    const pieceTopGroup = pieceTop && GroupOperations.getGroup(pieceTop);
    const pieceRightGroup = pieceRight && GroupOperations.getGroup(pieceRight);
    const pieceBottomGroup =
      pieceBottom && GroupOperations.getGroup(pieceBottom);
    const pieceLeftGroup = pieceLeft && GroupOperations.getGroup(pieceLeft);

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

  static updateConnections(pieces) {
    pieces.forEach((p) => {
      const connections = GroupOperations.getConnectionsForPiece(p);
      p.setAttribute("data-connections", connections.join(", "));
    });
  }
}
