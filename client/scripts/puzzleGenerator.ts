import { MINIMUM_NUMBER_OF_PIECES, PIECE_SIZE } from "./constants";
import jigsawPath from "./jigsawPath";
import { ConnectorNames, ConnectorType, JigsawPieceData, PuzzleAxis, PuzzleCreatorOptions, PuzzleGenerator, PuzzleSize, SideNames } from "./types";
import Utils from "./utils";

// How big the connectors should be (how far they stick of from the piece's body), expressed as a percentage of the body of the piece
const CONNECTOR_SIZE_PERC = 30;
// How far in from the corner the connector should be.
// This may need to be re-addressed when we approach wild shapes as we may prefer to randomise this.
const SHOULDER_SIZE_PERC = 35;
const SHADOW_COLOR = "#353836";
const STROKE_COLOR = "#000";
const STROKE_WIDTH = 1;

const Generator = {} as PuzzleGenerator;

const puzzleGenerator = async function (
  imagePath: string,
  puzzleConfig: PuzzleCreatorOptions
): Promise<PuzzleGenerator> {
  console.log("puzzle config", puzzleConfig);
  Generator.image = await loadImage(imagePath);
  Generator.debugOptions = puzzleConfig.debugOptions;
  Generator.piecesPerSideHorizontal = Math.sqrt(puzzleConfig.selectedNumPieces);
  Generator.piecesPerSideVertical = Math.sqrt(puzzleConfig.selectedNumPieces);
  Generator.selectedNumberOfPieces = puzzleConfig.selectedNumPieces;

  Generator.strokeWidth = STROKE_WIDTH;
  Generator.strokeColor = STROKE_COLOR;
  Generator.shadowColor = SHADOW_COLOR;

  Generator.connectorDistanceFromCorner =
    (Generator.pieceSize / 100) * SHOULDER_SIZE_PERC;

  Generator.connectorSize = Math.floor(
    (Generator.pieceSize / 100) * CONNECTOR_SIZE_PERC
  );

  Generator.largestPieceSpan =
    Generator.pieceSize + Generator.connectorSize * 2;

  Generator.spriteSpacing =
    Generator.piecesPerSideVertical * Generator.largestPieceSpan * 1.1;

  console.log("Generator", Generator);

  return {
    ...Generator,
    generateDataForPuzzlePieces,
    getJigsawShapeSvgString,
  };
};

export const getConnectorDimensions = (pieceSize: number) => {
  return {
    connectorDistanceFromCorner: (pieceSize / 100) * SHOULDER_SIZE_PERC,
    connectorSize: (pieceSize / 100) * CONNECTOR_SIZE_PERC,
  }
}

const loadImage = (path: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // to avoid CORS if used with Canvas
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
};



const generateDataForPuzzlePieces = async () => {
  const pieces: JigsawPieceData[] = [];

  var curImgX = 0;
  var curImgY = 0;
  var numPiecesFromLeftEdge = 0;
  var numPiecesFromTopEdge = 0;

  let done = false;
  let i = 0;

  let adjacentPieceBehind = null;
  let adjacentPieceAbove = null;
  let endOfRow = false;
  let rowCount = 1;
  let finalRow = false;

  const cnv = createCanvas(
    Generator.spriteSpacing,
    Generator.spriteSpacing * 2
  );
  const ctx = cnv.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
  }

  while (!done) {
    let currentPiece = {} as JigsawPieceData;
    // All pieces not on top row
    if (pieces.length >= Generator.piecesPerSideHorizontal) {
      adjacentPieceAbove =
        pieces[pieces.length - Generator.piecesPerSideHorizontal];
    }

    // Last piece in row, next piece should be a corner or right side
    if (
      pieces.length > 1 &&
      pieces.length % (Generator.piecesPerSideHorizontal - 1) === 0
    ) {
      endOfRow = true;
    } else {
      endOfRow = false;
    }

    if (rowCount === Generator.piecesPerSideVertical) {
      finalRow = true;
    }

    const previousPiece = pieces[pieces.length - 1];
    const previewPieceRightSideConnector = parseInt(
      previousPiece?.type.join(",")[1]
    );
    if (pieces.length > 0 && previewPieceRightSideConnector !== 0) {
      adjacentPieceBehind = pieces[i - 1];
    }

    if (previousPiece?.type[1] === 0) {
      adjacentPieceBehind = null;
    }

    currentPiece.type = getConnectors(
      adjacentPieceBehind,
      adjacentPieceAbove,
      endOfRow,
      finalRow
    ) as ConnectorType[];

    currentPiece = assignInitialPieceData(
      curImgX,
      curImgY,
      currentPiece,
      numPiecesFromLeftEdge,
      numPiecesFromTopEdge,
      i
    );

    const svgPath = getJigsawShapeSvgString(currentPiece, Generator.pieceSize);
    currentPiece.svgPath = svgPath;

    // console.log("generated piece", currentPiece);

    pieces.push(currentPiece);

    if (ctx) {
      await createPuzzlePiece(currentPiece, ctx);
    }

    // reached last piece, start next row
    if (pieces.length % Generator.piecesPerSideHorizontal === 0) {
      curImgX = 0;

      const firstPieceOnRowAbove =
        pieces[pieces.length - Generator.piecesPerSideHorizontal];

      curImgY =
        firstPieceOnRowAbove.imgY +
        firstPieceOnRowAbove.imgH -
        Generator.connectorSize;

      numPiecesFromLeftEdge = 0;
      numPiecesFromTopEdge++;

      rowCount++;
    } else {
      curImgX += currentPiece.imgW - Generator.connectorSize;

      if (rowCount > 1) {
        const nextPieceAbove =
          pieces[pieces.length - Generator.piecesPerSideHorizontal];

        const thisPieceHasTopPlug = currentPiece.type[0] === 1;
        const nextPieceAboveHasBottomPlug = nextPieceAbove.type[2] === 1;
        const thisPieceHasTopSocket = currentPiece.type[0] === -1;
        const nextPieceAboveHasBottomSocket = nextPieceAbove.type[2] === -1;

        if (thisPieceHasTopPlug && nextPieceAboveHasBottomPlug) {
          curImgY += Generator.connectorSize;
        } else if (thisPieceHasTopSocket && nextPieceAboveHasBottomSocket) {
          curImgY -= Generator.connectorSize;
        }
      }

      numPiecesFromLeftEdge++;
    }

    i++;

    if (i >= Generator.selectedNumberOfPieces) {
      done = true;
    }
  }

  return {
    spriteEncodedString: cnv.toDataURL(),
    pieces,
  };
};

// Using 'pieceAbove' and 'pieceBehind' won't scale for wild piece shapes:
// adjacentPieces[] would be more flexible...
export type SkeletonPiece = Pick<
  JigsawPieceData,
  "type" | "numPiecesFromLeftEdge" | "numPiecesFromTopEdge"
> & {
  connectorSize: number;
  pieceAbove: {
    type: ConnectorType[],
  };
  pieceBehind: {
    type: ConnectorType[],
  }
};

export const generatePieces = (puzzleConfig: PuzzleSize): SkeletonPiece[] => {
  const pieces: SkeletonPiece[] = [];
  let n = 0;

  let pieceAbove = {} as Pick<JigsawPieceData, "type">;
  let previousPiece = {} as Pick<JigsawPieceData, "type">;

  let rightConnector: ConnectorType;
  let bottomConnector: ConnectorType;
  let leftConnector: ConnectorType;
  let topConnector: ConnectorType;

  const { totalNumberOfPieces, numberOfPiecesHorizontal } = puzzleConfig;
  const connectorChoices = [-1, 1];

  const { connectorSize: connectorSizeValue } = getConnectorDimensions(puzzleConfig.pieceSize);

  let currentIndexFromLeftEdge = 0;
  let currentIndexFromTopEdge = 0;

  while (n < puzzleConfig.totalNumberOfPieces) {
    const piece = {
      connectorSize: connectorSizeValue,
    } as SkeletonPiece;

    if (n === 0) {
      // First piece
      topConnector = 0 as ConnectorType;
      rightConnector = connectorChoices[Utils.getRandomInt(0, 1)] as ConnectorType;
      bottomConnector = connectorChoices[Utils.getRandomInt(0, 1)] as ConnectorType;
      leftConnector = 0 as ConnectorType;

      piece.type = [topConnector, rightConnector, bottomConnector, leftConnector];
      piece.numPiecesFromTopEdge = 0;
      piece.numPiecesFromLeftEdge = 0;
    } else {
      // All other pieces
      pieceAbove = pieces[n - puzzleConfig.numberOfPiecesHorizontal];
      previousPiece = pieces[n - 1];

      piece.pieceAbove = pieceAbove;
      if (previousPiece.type[1] !== 0) {
        piece.pieceBehind = previousPiece;

        currentIndexFromLeftEdge++;
      } else {
        currentIndexFromLeftEdge = 0;
        currentIndexFromTopEdge++;
      }

      piece.numPiecesFromLeftEdge = currentIndexFromLeftEdge;
      piece.numPiecesFromTopEdge = currentIndexFromTopEdge;

      if (pieceAbove) {
        topConnector = Utils.getOppositeConnector(pieceAbove.type[2]) as ConnectorType;
      } else {
        topConnector = 0 as ConnectorType;
      }

      if (previousPiece.type[1] === 0) {
        // Previous piece was a right edge so make current piece a left edge
        leftConnector = 0 as ConnectorType;
      } else {
        leftConnector = Utils.getOppositeConnector(previousPiece.type[1]) as ConnectorType;
      }

      if ((n + 1) % puzzleConfig.numberOfPiecesHorizontal === 0) {
        // Right edge pieces
        rightConnector = 0 as ConnectorType;
      } else {
        rightConnector = connectorChoices[Utils.getRandomInt(0, 1)] as ConnectorType
      }

      if (n >= totalNumberOfPieces - numberOfPiecesHorizontal) {
        // Last row
        bottomConnector = 0 as ConnectorType;
      } else {
        bottomConnector = connectorChoices[Utils.getRandomInt(0, 1)] as ConnectorType;
      }

      piece.type = [topConnector, rightConnector, bottomConnector, leftConnector];
    }

    pieces.push(piece);

    n++;
  }

  return pieces;
}

const createCanvas = (width: number, height: number) => {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  return el;
};

const createPuzzlePiece = async (
  data: JigsawPieceData,
  ctxForSprite: CanvasRenderingContext2D
) => {
  const shadowCnv = createCanvas(data.imgW, data.imgH);
  const shdCtx = shadowCnv.getContext("2d");
  shadowCnv.width = data.imgW;
  shadowCnv.height = data.imgH;

  // Using 'imgW' property for piece size assuming pieces are square-shaped
  // meaning we width and height are equal.
  const svgPath = getJigsawShapeSvgString(data, data.imgW);

  if (shdCtx) {
    shdCtx.fillStyle = Generator.shadowColor;
    const path = new Path2D(svgPath);
    shdCtx.fill(path);

    const shadowImgData = shdCtx.getImageData(0, 0, data.imgW, data.imgH);
    ctxForSprite.putImageData(
      shadowImgData,
      data.spriteShadowX,
      data.spriteShadowY
    );
  }

  const tmpCnv = createCanvas(data.imgW, data.imgH);
  const tmpCtx = tmpCnv.getContext("2d");

  if (tmpCtx) {
    tmpCtx.strokeStyle = Generator.strokeColor;
    tmpCtx.lineWidth = Generator.strokeWidth;
    tmpCnv.width = data.imgW;
    tmpCnv.height = data.imgH;

    const p = new Path2D(svgPath);
    tmpCtx.clip(p);
    tmpCtx.drawImage(
      Generator.image,
      data.imgX,
      data.imgY,
      data.imgW,
      data.imgH,
      0,
      0,
      data.imgW,
      data.imgH
    );
    tmpCtx.stroke(p);
  }

  const img = await loadImage(tmpCnv.toDataURL());

  ctxForSprite.drawImage(img, data.spriteX, data.spriteY);
};

const widthAndHeightWithConnectors = (piece: JigsawPieceData) => {
  let width = Generator.pieceSize;
  let height = Generator.pieceSize;

  if (piece.type[3] === 1) {
    width += Generator.connectorSize;
  }
  if (piece.type[1] === 1) {
    width += Generator.connectorSize;
  }
  if (piece.type[0] === 1) {
    height += Generator.connectorSize;
  }
  if (piece.type[2] === 1) {
    height += Generator.connectorSize;
  }

  return {
    width,
    height,
  };
};

const getConnectors = (
  adjacentPieceBehind: JigsawPieceData | null,
  adjacentPieceAbove: JigsawPieceData | null,
  endOfRow: boolean,
  finalRow: boolean
) => {
  let pieceAboveIsTopRightCorner,
    pieceAboveIsRightSide,
    pieceAboveIsTopLeftCorner,
    pieceAboveIsLeftSide,
    pieceAboveIsTopSide,
    pieceAboveIsInnerPiece,
    pieceBehindIsBottomLeftCorner,
    pieceBehindIsBottomSide,
    pieceAboveHasBottomPlug,
    pieceBehindHasRightPlug;

  if (adjacentPieceAbove) {
    pieceAboveIsTopRightCorner =
      adjacentPieceAbove.type[0] === 0 && adjacentPieceAbove.type[1] === 0;
    pieceAboveIsRightSide = adjacentPieceAbove?.type[1] === 0;
    pieceAboveIsTopLeftCorner =
      adjacentPieceAbove.type[3] === 0 && adjacentPieceAbove.type[0] === 0;
    pieceAboveIsLeftSide = adjacentPieceAbove.type[3] === 0;
    pieceAboveIsTopSide = adjacentPieceAbove.type[0] === 0;
    pieceAboveIsInnerPiece = !adjacentPieceAbove.type.includes(0);
    pieceAboveHasBottomPlug = adjacentPieceAbove.type[2] === 1;
  }

  if (adjacentPieceBehind) {
    pieceBehindIsBottomLeftCorner =
      adjacentPieceBehind.type[2] === 0 && adjacentPieceBehind.type[3] === 0;
    pieceBehindIsBottomSide = adjacentPieceBehind.type[2] === 0;
    pieceBehindHasRightPlug = adjacentPieceBehind.type[1] === 1;
  }

  const connectorChoices = [-1, 1] as ConnectorType[];

  // Top left corner piece
  if (!adjacentPieceBehind && !adjacentPieceAbove) {
    const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
    const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
    return [0, rightConnector, bottomConnector, 0];
  }

  // First row pieces
  if (!adjacentPieceAbove) {
    const rightConnector = endOfRow
      ? 0
      : connectorChoices[Math.floor(Math.random() * 2)];
    const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
    // piece behind has right plug?
    const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
    return [0, rightConnector, bottomConnector, leftConnector];
  }
  // All pieces after top row
  else {
    // Last piece of each row, should be right side
    if (pieceAboveIsTopRightCorner || (!finalRow && pieceAboveIsRightSide)) {
      return [
        pieceAboveHasBottomPlug ? -1 : 1,
        0,
        connectorChoices[Math.floor(Math.random() * 2)],
        pieceBehindHasRightPlug ? -1 : 1,
      ] as ConnectorType[];
    }

    // First piece of each row, should be left side
    if (pieceAboveIsTopLeftCorner || (!finalRow && pieceAboveIsLeftSide)) {
      return [
        pieceAboveHasBottomPlug ? -1 : 1,
        connectorChoices[Math.floor(Math.random() * 2)],
        connectorChoices[Math.floor(Math.random() * 2)],
        0,
      ] as ConnectorType[];
    }

    // All middle pieces
    if ((!finalRow && pieceAboveIsInnerPiece) || pieceAboveIsTopSide) {
      return [
        pieceAboveHasBottomPlug ? -1 : 1,
        connectorChoices[Math.floor(Math.random() * 2)],
        connectorChoices[Math.floor(Math.random() * 2)],
        pieceBehindHasRightPlug ? -1 : 1,
      ] as ConnectorType[];
    }

    if (finalRow && pieceAboveIsLeftSide) {
      return [
        pieceAboveHasBottomPlug ? -1 : 1,
        connectorChoices[Math.floor(Math.random() * 2)],
        0,
        0,
      ] as ConnectorType[];
    }

    if (
      finalRow &&
      pieceAboveIsInnerPiece &&
      (pieceBehindIsBottomLeftCorner || pieceBehindIsBottomSide)
    ) {
      return [
        pieceAboveHasBottomPlug ? -1 : 1,
        connectorChoices[Math.floor(Math.random() * 2)],
        0,
        pieceBehindHasRightPlug ? -1 : 1,
      ] as ConnectorType[];
    }

    // Very last piece, should be corner bottom right
    if (pieceAboveIsRightSide && pieceBehindIsBottomSide) {
      return [
        pieceAboveHasBottomPlug ? -1 : 1,
        0,
        0,
        pieceBehindHasRightPlug ? -1 : 1,
      ] as ConnectorType[];
    }
  }
};

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const assignInitialPieceData = (
  imgX: number,
  imgY: number,
  piece: JigsawPieceData,
  numPiecesFromLeftEdge: number,
  numPiecesFromTopEdge: number,
  i: number
) => {
  let { width, height } = widthAndHeightWithConnectors(piece);

  const piecePositionOnSprite = {
    x: Math.floor(Generator.largestPieceSpan * 1.1 * numPiecesFromLeftEdge),
    y: Math.floor(Generator.largestPieceSpan * 1.1 * numPiecesFromTopEdge),
  };

  const stageWidth = window.innerWidth;
  const stageHeight = window.innerHeight;

  const rightLimit =
    stageWidth -
    Generator.largestPieceSpan -
    stageWidth / 100;
  const bottomLimit =
    stageHeight -
    Generator.largestPieceSpan -
    stageHeight / 100;

  const randPos = {
    x: getRandomInt(1, rightLimit),
    y: getRandomInt(1, bottomLimit),
  };

  return Object.assign(
    {
      id: i,
      imgX: imgX,
      imgY: imgY,
      // Width and height that will be used to draw from the source image
      imgW: Math.floor(width),
      imgH: Math.floor(height),
      spriteX: piecePositionOnSprite.x,
      spriteY: piecePositionOnSprite.y,
      spriteShadowX: piecePositionOnSprite.x,
      spriteShadowY: piecePositionOnSprite.y + Generator.spriteSpacing,
      pageX: Generator.debugOptions.noDispersal
        ? piecePositionOnSprite.x
        : randPos.x,
      pageY: Generator.debugOptions.noDispersal
        ? piecePositionOnSprite.y
        : randPos.y,
      solvedX: imgX,
      solvedY: imgY,
      isInnerPiece: piece.type.join(",").indexOf("0") === -1,
      isVisible: true,
      connections: [],
      numPiecesFromLeftEdge,
      numPiecesFromTopEdge,
    },
    piece
  );
};

const getJigsawShapeSvgString = (
  piece: SkeletonPiece | JigsawPieceData,
  pieceSize: number,
  startingPosition?: {
    x: number;
    y: number;
  }
) => {

  let svgString = "";

  let x = startingPosition?.x || 0;
  let y = startingPosition?.y || 0;

  const { connectorSize, connectorDistanceFromCorner } = getConnectorDimensions(pieceSize);
  const hasTopPlug = piece.type[0] === 1;
  const hasLeftPlug = piece.type[3] === 1;

  let topBoundary = hasTopPlug ? y + connectorSize : y;
  let leftBoundary = hasLeftPlug ? x + connectorSize : x;

  let topConnector = null,
    rightConnector = null,
    bottomConnector = null,
    leftConnector = null;

  const jigsawShapes = new jigsawPath(
    pieceSize,
    connectorSize
  );

  const getRotatedConnector = jigsawShapes.getRotatedConnector;

  svgString += `M ${leftBoundary} ${topBoundary} `;

  if (piece.type[0] === 1) {
    topConnector = getRotatedConnector(jigsawShapes.getPlug(), 0);
  } else if (piece.type[0] === -1) {
    topConnector = getRotatedConnector(jigsawShapes.getSocket(), 0);
  }
  // console.log(Generator.connectorDistanceFromCorner);

  if (topConnector) {
    svgString += `h ${connectorDistanceFromCorner} `;
    svgString += `c ${topConnector.cp1.x} ${topConnector.cp1.y}, ${topConnector.cp2.x} ${topConnector.cp2.y}, ${topConnector.dest.x} ${topConnector.dest.y} `;
    svgString += `h ${connectorDistanceFromCorner} `;
  } else {
    svgString += `h ${pieceSize} `;
  }

  if (piece.type[1] === 1) {
    rightConnector = getRotatedConnector(jigsawShapes.getPlug(), 90);
  } else if (piece.type[1] === -1) {
    rightConnector = getRotatedConnector(jigsawShapes.getSocket(), 90);
  }

  if (rightConnector !== null) {
    svgString += `v ${connectorDistanceFromCorner} `;
    svgString += `c ${rightConnector.cp1.x} ${rightConnector.cp1.y}, ${rightConnector.cp2.x} ${rightConnector.cp2.y}, ${rightConnector.dest.x} ${rightConnector.dest.y} `;
    svgString += `v ${connectorDistanceFromCorner} `;
  } else {
    svgString += `v ${pieceSize} `;
  }

  if (piece.type[2] === 1) {
    bottomConnector = getRotatedConnector(jigsawShapes.getPlug(), 180);
  } else if (piece.type[2] === -1) {
    bottomConnector = getRotatedConnector(jigsawShapes.getSocket(), 180);
  }

  if (bottomConnector) {
    svgString += `h -${connectorDistanceFromCorner} `;
    svgString += `c ${bottomConnector.cp1.x} ${bottomConnector.cp1.y}, ${bottomConnector.cp2.x} ${bottomConnector.cp2.y}, ${bottomConnector.dest.x} ${bottomConnector.dest.y} `;
    svgString += `h -${connectorDistanceFromCorner} `;
  } else {
    svgString += `h -${pieceSize} `;
  }

  if (piece.type[3] === 1) {
    leftConnector = getRotatedConnector(jigsawShapes.getPlug(), 270);
  } else if (piece.type[3] === -1) {
    leftConnector = getRotatedConnector(jigsawShapes.getSocket(), 270);
  }

  if (leftConnector !== null) {
    svgString += `v -${connectorDistanceFromCorner} `;
    svgString += `c ${leftConnector.cp1.x} ${leftConnector.cp1.y}, ${leftConnector.cp2.x} ${leftConnector.cp2.y}, ${leftConnector.dest.x} ${leftConnector.dest.y} `;
  }

  svgString += "z";

  return svgString;
};

export const getPiecePositionBasedOnAdjacentPieces = (piece: SkeletonPiece, currentPosition: { x: number, y: number }, connectorSize: number): { x: number; y: number } => {
  return {
    x: piece.pieceBehind?.type[1] === -1 ? currentPosition.x - connectorSize : currentPosition.x,
    y: piece.pieceAbove?.type[2] === -1 ? currentPosition.y - connectorSize : currentPosition.y,
  }
}

export const getPuzzleImpression = (pieces: SkeletonPiece[], puzzleConfig: PuzzleSize): void => {
  const canvas = createCanvas(puzzleConfig.puzzleWidth / 2, puzzleConfig.puzzleHeight / 2);
  const context2d = canvas.getContext("2d");

  canvas.width = 1300;
  canvas.height = 1300;

  const piecePosition = {
    x: 0,
    y: 0,
  }

  document.body.appendChild(canvas);

  canvas.style.position = "absolute";
  canvas.style.top = "30px";
  canvas.style.left = "100px";
  canvas.style.zIndex = 10 + "";

  if (context2d) {
    // context2d.strokeStyle = "#000";

    for (let n = 0, l = pieces.length; n < l; n++) {
      const currentPiece = pieces[n];
      const shape = getJigsawShapeSvgString(
        currentPiece,
        puzzleConfig.pieceSize,
        getPiecePositionBasedOnAdjacentPieces(currentPiece, piecePosition, puzzleConfig.connectorSize),
      );

      const path = new Path2D(shape);
      context2d.stroke(path);

      if (currentPiece.numPiecesFromLeftEdge === puzzleConfig.numberOfPiecesHorizontal - 1) {
        piecePosition.y += puzzleConfig.pieceSize;
        piecePosition.x = 0;
      } else {
        piecePosition.x += puzzleConfig.pieceSize;
      }
    }
  }

}

// exports.drawJigsawShape = drawJigsawShape;
// exports.default = PuzzleGenerator;

export default puzzleGenerator;
