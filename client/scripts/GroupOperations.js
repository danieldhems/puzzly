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
    return Array.from(this.getPiecesInGroup(group)).some(
      (p) => p.dataset.isSolved === "true"
    );
  }

  static getGroupContainer(arg) {
    if (typeof arg === "number" || typeof arg === "string") {
      return document.getElementById(`group-container-${arg}`);
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
    return parseInt(element.dataset.group);
  }

  static getPiecesInGroup(group) {
    const container = this.getGroupContainer(group);
    return container.querySelectorAll(".puzzle-piece");
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

  group(sourceElement, targetElement) {
    const pieceA = Utils.getPieceFromElement(sourceElement);
    const pieceB = Utils.getPieceFromElement(targetElement);

    if (!pieceA.group && !pieceB.group) {
      return this.createGroup(sourceElement, targetElement);
    } else if (pieceA.group > -1 && !pieceB.group) {
      this.addToGroup(pieceBEl, pieceA.group);
    } else if (!pieceA.group && pieceB.group > -1) {
      this.addToGroup(this.element, pieceB.group);
    } else if (pieceAEl && pieceBEl) {
      this.mergeGroups(this.element, targetElement);
    }
  }

  addToGroup(element, group) {
    console.log("addToGroup", element, group);
    // console.log(element)
    console.log(element.dataset);
    // const piece = this.getPieceFromElement(element, ['solvedx', 'solvedy']);

    const solvedX = parseInt(element.dataset.solvedx);
    const solvedY = parseInt(element.dataset.solvedy);

    const targetGroupContainer = getGroupContainer(group);
    const isTargetGroupSolved = Utils.isGroupSolved(group) || group === 1111;

    // Add element(s) to target group container
    const oldGroup = getGroup(element);
    let followingEls = [];

    if (oldGroup) {
      let container = getGroupContainer(oldGroup);
      followingEls = container.querySelectorAll(".puzzle-piece");

      followingEls.forEach((el) => {
        targetGroupContainer.prepend(el);
        el.setAttribute("data-group", group);
        if (isTargetGroupSolved) {
          el.setAttribute("data-is-solved", true);
        }
      });

      container.remove();
    } else {
      element.setAttribute("data-group", group);
      element.classList.add("grouped");

      if (!this.isMovingSinglePiece) {
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
    const elementsInTargetGroup = this.getPiecesInGroup(group);
    const allPieces = [...elementsInTargetGroup, ...followingEls];
    this.drawPiecesIntoGroup(group, allPieces);

    // Update all connections
    this.updateConnections(group);
  }

  mergeGroups(elementA, elementB) {
    const pieceAGroup = getGroup(elementA);
    const pieceBGroup = getGroup(elementB);
    const piecesInGroupA = getPiecesInGroup(pieceAGroup);

    if (isGroupSolved(pieceAGroup) || isGroupSolved(pieceAGroup)) {
      const containerA = this.getGroupContainer(pieceAGroup);
      const containerB = this.getGroupContainer(pieceBGroup);
      this.setElementAttribute(containerA, "is-solved", true);
      this.setElementAttribute(containerB, "is-solved", true);
    }

    addToGroup(piecesInGroupA[0], pieceBGroup);
  }

  createGroupContainer(groupId) {
    const container = document.createElement("div");
    container.id = `group-container-${groupId}`;
    container.classList.add("group-container");
    container.dataset.group = groupId;

    container.style.width = Utils.getPxString(this.groupWidth);
    container.style.height = Utils.getPxString(this.groupHeight);
    // container.style.pointerEvents = "none";
    container.style.position = "absolute";

    return container;
  }

  setGroupContainerPosition(container, { top, left }) {
    container.style.top = Utils.getPxString(top);
    container.style.left = Utils.getPxString(left);
  }

  createGroup(sourceElement, targetElement) {
    const groupId = new Date().getTime();
    const container = this.createGroupContainer(groupId);

    const newCanvas = this.canvasOperations.makeCanvas(
      `group-canvas-${groupId}`
    );

    const leftPos =
      targetElement.offsetLeft - parseInt(targetElement.dataset.solvedx);
    const topPos =
      targetElement.offsetTop - parseInt(targetElement.dataset.solvedy);

    sourceElement.style.left = Utils.getPxString(
      parseInt(sourceElement.dataset.solvedx)
    );
    sourceElement.style.top = Utils.getPxString(
      parseInt(sourceElement.dataset.solvedy)
    );
    targetElement.style.left = Utils.getPxString(
      parseInt(targetElement.dataset.solvedx)
    );
    targetElement.style.top = Utils.getPxString(
      parseInt(targetElement.dataset.solvedy)
    );

    sourceElement.setAttribute("data-group", groupId);
    targetElement.setAttribute("data-group", groupId);
    sourceElement.classList.add("grouped");
    targetElement.classList.add("grouped");

    this.canvasOperations.drawPiecesIntoGroup(newCanvas, [
      sourceElement,
      targetElement,
    ]);

    // TODO: Refactor Util methods to expect type array only, not piece object containing it.
    // Not sure if this logic is entirely applicable...
    const elementAIsSolved = Utils.getIsSolved(sourceElement);
    const elementBIsSolved = Utils.getIsSolved(targetElement);

    if (elementAIsSolved || elementBIsSolved) {
      this.setElementAttribute(sourceElement, "data-is-solved", true);
      this.setElementAttribute(targetElement, "data-is-solved", true);
      this.setElementAttribute(container, "data-is-solved", true);
    }

    this.updateConnections([sourceElement, targetElement]);
    this.setGroupContainerPosition(container, { top: topPos, left: leftPos });

    container.appendChild(newCanvas);
    container.append(sourceElement);
    container.appendChild(targetElement);

    return { groupId, groupContainer: container };
  }

  getConnectionsForPiece(piece) {
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

  updateConnections(pieces) {
    pieces.forEach((p) => {
      const connections = this.getConnectionsForPiece(p);
      p.setAttribute("data-connections", connections.join(", "));
    });
  }
}
