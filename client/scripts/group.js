import CanvasOperations from "./canvasOperations.js";
import Utils from "./utils.js";

const CanvasOperations = new CanvasOperations();

export function group(targetElement) {
  if (!CanvasOperations.shadowOffset) {
    CanvasOperations.setShadowOffset(this.shadowOffset);
  }

  const pieceA = Utils.getPieceFromElement(this.element);
  const pieceB = Utils.getPieceFromElement(targetElement);

  console.log("group()");
  console.log(pieceA);
  console.log(pieceB);

  if (!pieceA.group && !pieceB.group) {
    return createGroup(
      this.element,
      targetElement,
      this.boardWidth,
      this.boardHeight
    );
  } else if (pieceA.group > -1 && !pieceB.group) {
    addToGroup(pieceBEl, pieceA.group);
  } else if (!pieceA.group && pieceB.group > -1) {
    addToGroup(this.element, pieceB.group);
  } else if (pieceAEl && pieceBEl) {
    mergeGroups(this.element, targetElement);
  }
}

export function createCanvas() {}

export function addToGroup(element, group) {
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

export function mergeGroups(elementA, elementB) {
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

export function isGroupSolved(group) {
  return Array.from(this.getPiecesInGroup(group)).some((p) =>
    this.getIsSolved(p)
  );
}

export function getGroupContainer(arg) {
  if (typeof arg === "number" || typeof arg === "string") {
    return document.getElementById(`group-container-${arg}`);
  } else {
    return arg.parentNode;
  }
}

export function getGroupTopContainer(el) {
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

export function createGroupContainer(group, boardWidth, boardHeight) {
  const container = document.createElement("div");
  container.id = `group-container-${group}`;
  container.classList.add("group-container");

  container.style.width = Utils.getPxString(boardWidth);
  container.style.height = Utils.getPxString(boardHeight);
  container.style.pointerEvents = "none";

  container.style.position = "absolute";

  return container;
}

export function setGroupContainerPosition(container, { top, left }) {
  container.style.top = Utils.getPxString(top);
  container.style.left = Utils.getPxString(left);
}

export function createGroup(sourceEl, targetElement, stage) {
  const groupId = new Date().getTime();

  const { offsetWidth: boardWidth, offsetHeight: boardHeight } = stage;
  const container = createGroupContainer(groupId, boardWidth, boardHeight);

  container.appendChild(sourceEl);
  container.appendChild(targetElement);

  sourceEl.style.left = Utils.getPxString(parseInt(sourceEl.dataset.solvedX));
  sourceEl.style.top = Utils.getPxString(parseInt(sourceEl.dataset.solvedY));
  targetElement.style.left = Utils.getPxString(
    parseInt(sourceEl.dataset.solvedX)
  );
  targetElement.style.top = Utils.getPxString(
    parseInt(sourceEl.dataset.solvedY)
  );

  const leftPos =
    targetElement.offsetLeft - parseInt(targetElement.dataset.solvedX);
  const topPos =
    targetElement.offsetTop - parseInt(targetElement.dataset.solvedY);
  setGroupContainerPosition(container, { top: topPos, left: leftPos });

  sourceEl.setAttribute("data-group", groupId);
  targetElement.setAttribute("data-group", groupId);

  sourceEl.classList.add("grouped");
  targetElement.classList.add("grouped");

  const canvasId = `group-canvas-${groupId}`;
  const newCanvas = CanvasOperations.makeCanvas(
    canvasId,
    boardWidth,
    boardHeight
  );

  container.appendChild(newCanvas);
  container.appendChild(sourceEl);
  container.appendChild(targetElement);
  CanvasOperations.drawPiecesIntoGroup(groupId, [sourceEl, targetElement]);

  // TODO: Refactor Util methods to expect type array only, not piece object containing it.
  // Not sure if this logic is entirely applicable...
  const elementAIsSolved = Utils.getIsSolved(sourceEl);
  const elementBIsSolved = Utils.getIsSolved(targetElement);

  if (elementAIsSolved || elementBIsSolved) {
    this.setElementAttribute(sourceEl, "data-is-solved", true);
    this.setElementAttribute(targetElement, "data-is-solved", true);
    this.setElementAttribute(container, "data-is-solved", true);
  }

  return { groupId, groupContainer: container };
}

export function getGroup(element) {
  const group = element.dataset.group;
  return group ? parseInt(group) : undefined;
}

export function getPiecesInGroup(group) {
  console.log(group);
  const container = getGroupContainer(group);
  return container.querySelectorAll(".puzzle-piece");
}

export function hasGroup(piece) {
  const obj = piece.dataset || piece;
  return (
    obj.group !== undefined && obj.group !== null && !Number.isNaN(obj.group)
  );
}

export function getCollisionCandidatesInGroup(group) {
  const piecesInGroup = this.getPiecesInGroup(group);
  const candidates = [];

  if (piecesInGroup.length === this.selectedNumPieces) {
    return [Utils.getElementByPieceId(0)];
  }

  piecesInGroup.forEach((piece) => {
    console.log(piece);
    const p = this.getPieceFromElement(piece);
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
