import SingleMovable from "./SingleMovable";
import { EVENT_TYPES } from "./constants";
import { MovableElement, SideNames } from "./types";
import Utils from "./utils";

// Determine when to start placing pieces on next side
function shouldProceedToNextSide(
  currentSide: SideNames,
  element: MovableElement,
  firstPieceOnNextSide: MovableElement
) {
  // console.log("shouldProceedToNextSide()", currentSide, element, firstPieceOnNextSide)
  let targetBox;

  targetBox = firstPieceOnNextSide
    ? Utils.getStyleBoundingBox(firstPieceOnNextSide)
    : Utils.getStyleBoundingBox(this.solvingArea);

  const box = Utils.getStyleBoundingBox(element);

  switch (currentSide) {
    case SideNames.Top:
      return (
        box.left > targetBox.right ||
        box.right - this.connectorSize > targetBox.right
      );
    case SideNames.Right:
      return (
        box.top > targetBox.bottom ||
        box.bottom - this.connectorSize > targetBox.bottom
      );
    case SideNames.Bottom:
      return (
        box.right < targetBox.left ||
        box.left + this.connectorSize < targetBox.left
      );
    case SideNames.Left:
      return (
        box.bottom < targetBox.top - this.largestPieceSpan ||
        box.top + this.connectorSize < targetBox.top
      );
  }
}

// Each time we start the next side, determine where the first piece should go
function getPositionForFirstPieceOnNextSide(
  element: MovableElement,
  nextElement: MovableElement | null,
  currentSide: SideNames,
  firstPieceOnNextSideFromPreviousIteration: MovableElement,
  spacing: number,
  largestPieceSpan: number,
  solvingArea: HTMLDivElement
) {
  const targetBox = firstPieceOnNextSideFromPreviousIteration
    ? Utils.getStyleBoundingBox(firstPieceOnNextSideFromPreviousIteration)
    : Utils.getStyleBoundingBox(solvingArea);

  const box = Utils.getStyleBoundingBox(element);
  const nextElementBox = nextElement
    ? Utils.getStyleBoundingBox(nextElement)
    : null;

  let nextElementWidth = 0;
  let nextElementHeight = 0;
  if (nextElementBox) {
    nextElementWidth = nextElementBox?.width;
    nextElementHeight = nextElementBox?.height;
  }

  switch (currentSide) {
    case SideNames.Top:
      return {
        x: targetBox.right + spacing,
        y: box.bottom + spacing,
      };
    case SideNames.Right:
      return {
        x: box.left - nextElementWidth - spacing,
        y: targetBox.bottom + spacing,
      };
    case SideNames.Bottom:
      return {
        x: targetBox.left - largestPieceSpan - spacing,
        y: box.top - nextElementHeight - spacing,
      };
    case SideNames.Left:
      return {
        x: box.right + spacing,
        y: targetBox.top - largestPieceSpan - spacing,
      };
  }
}

export default function arrangePiecesAroundEdge(
  largestPieceSpan: number,
  solvingAreaElement: HTMLDivElement
) {
  // console.log("Arranging pieces around edge")
  const sides = [
    SideNames.Top,
    SideNames.Right,
    SideNames.Bottom,
    SideNames.Left,
  ];
  let i = 0;
  let sideIndex = 0;

  let currentSide = sides[sideIndex];

  const firstPiecesOnEachSide = {
    top: null,
    right: null,
    bottom: null,
    left: null,
  } as Record<string, MovableElement | null>;

  const spacing = (this.largestPieceSpan / 100) * 5;

  const piecesInPlay = Utils.shuffleArray(Utils.getIndividualPiecesOnCanvas());

  let currentX: number = this.solvingArea.offsetLeft;
  let currentY: number = this.solvingArea.offsetTop;
  let verticalSpace = currentY;

  while (i < piecesInPlay.length) {
    const currentPiece = piecesInPlay[i] as MovableElement;
    const pieceData = Utils.getPieceFromElement(currentPiece);

    const top = parseInt(currentPiece.style.top);
    const height = currentPiece.offsetHeight;

    if (top < currentY) {
      currentY = top;
    }

    if (currentSide === "top" && pieceData.type[0] !== 1) {
      // currentY += this.connectorSize;
    }

    const nextPiece = piecesInPlay[i + 1];

    window
      .move(currentPiece)
      .x(currentX)
      .y(currentY)
      .duration(this.animationDuration)
      .end();

    if (i === 0) {
      firstPiecesOnEachSide[currentSide] = currentPiece;
    }

    const nextSide = sideIndex < 3 ? sideIndex + 1 : 0;
    const isLastPiece = i === piecesInPlay.length - 1;

    if (
      shouldProceedToNextSide.call(this, currentSide,
        currentPiece,
        firstPiecesOnEachSide[sides[nextSide]] as HTMLDivElement)
    ) {
      // console.log("proceeding to next side", i)
      if (currentSide === SideNames.Bottom) {
        verticalSpace += this.largestPieceSpan + spacing;
      }

      const nextPos = getPositionForFirstPieceOnNextSide(
        currentPiece,
        !isLastPiece ? (nextPiece as HTMLDivElement) : null,
        currentSide,
        firstPiecesOnEachSide[sides[nextSide]] as HTMLDivElement,
        spacing,
        largestPieceSpan,
        solvingAreaElement
      );

      sideIndex = nextSide;
      currentSide = sides[nextSide];

      firstPiecesOnEachSide[currentSide] = nextPiece as HTMLDivElement;

      if (nextPos) {
        currentX = nextPos.x;
        currentY = nextPos.y;
      }
    } else {
      const currentPieceBoundingBox = Utils.getStyleBoundingBox(currentPiece);
      const nextPieceBoundingBox = nextPiece
        ? Utils.getStyleBoundingBox(nextPiece as HTMLDivElement)
        : null;

      if (currentSide === SideNames.Top) {
        currentX += currentPieceBoundingBox.width + spacing;
      } else if (currentSide === SideNames.Right) {
        currentY += currentPieceBoundingBox.height + spacing;
      } else if (currentSide === SideNames.Bottom) {
        if (!isLastPiece && nextPieceBoundingBox) {
          currentX -= nextPieceBoundingBox.width + spacing;
        }
      } else if (currentSide === SideNames.Left) {
        if (!isLastPiece && nextPieceBoundingBox) {
          currentY -= nextPieceBoundingBox.height + spacing;
        }
      }
    }

    i++;
  }

  window.dispatchEvent(new CustomEvent(EVENT_TYPES.SAVE));
}
