import jigsawPath from "./jigsawPath.js";
import { ConnectorType, JigsawPieceData, PuzzleCreatorOptions } from "./types";

// How big the connectors should be (how far they stick of from the piece's body), expressed as a percentage of the body of the piece
const CONNECTOR_SIZE_PERC = 30;
// How far in from the corner the connector should be.
// This may need to be re-addressed when we approach wild shapes as we may prefer to randomise this.
const SHOULDER_SIZE_PERC = 35;
const SHADOW_COLOR = "#353836";
const STROKE_COLOR = "#000";
const STROKE_WIDTH = 1;

const Generator = {} as PuzzleGenerator;

export type PuzzleGenerator = {
  connectorRatio: number;
  piecesPerSideHorizontal: number;
  piecesPerSideVertical: number;
  selectedNumberOfPieces: number;
  pieceSize: number;
  connectorDistanceFromCorner: number;
  connectorSize: number;
  connectorLateralControlPointDistance: number;
  largestPieceSpan: number;
  strokeWidth: number;
  strokeColor: string;
  spriteSpacing: number;
  stageWidth: number;
  stageHeight: number;
  debugOptions: {
    noDispersal: boolean;
  };
  image: HTMLImageElement;
  shadowColor: string;
  strokeStyle: string;
  generateDataForPuzzlePieces: () => Promise<{
    spriteEncodedString: string;
    pieces: JigsawPieceData[];
  }>;
  drawJigsawShape: (piece: JigsawPieceData) => string;
};

const puzzleGenerator = async function (
  imagePath: string,
  puzzleConfig: PuzzleCreatorOptions
): Promise<PuzzleGenerator> {
  console.log("puzzle config", puzzleConfig);
  Generator.debugOptions = puzzleConfig.debugOptions;

  Generator.image = await loadImage(imagePath);

  Generator.piecesPerSideHorizontal = Math.sqrt(puzzleConfig.selectedNumPieces);
  Generator.piecesPerSideVertical = Math.sqrt(puzzleConfig.selectedNumPieces);
  Generator.selectedNumberOfPieces = puzzleConfig.selectedNumPieces;

  // pieces will be generated at their full size according to the source image's dimensions
  Generator.pieceSize = Math.floor(
    puzzleConfig.boardSize / Generator.piecesPerSideHorizontal
  );

  Generator.strokeWidth = STROKE_WIDTH;
  Generator.strokeColor = STROKE_COLOR;
  Generator.shadowColor = SHADOW_COLOR;

  Generator.stageWidth = puzzleConfig.stageWidth;
  Generator.stageHeight = puzzleConfig.stageHeight;

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
    drawJigsawShape,
  };
};

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
    );

    currentPiece = assignInitialPieceData(
      curImgX,
      curImgY,
      currentPiece,
      numPiecesFromLeftEdge,
      numPiecesFromTopEdge,
      i
    );

    const svgPath = drawJigsawShape(currentPiece);
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
      if (rowCount > 1) {
        const nextPieceAbove =
          pieces[pieces.length - Generator.piecesPerSideHorizontal];

        if (currentPiece.type[0] === 1 && nextPieceAbove.type[2] === -1) {
          curImgY += Generator.connectorSize;
        } else if (
          currentPiece.type[0] === -1 &&
          nextPieceAbove.type[2] === -1
        ) {
          curImgY -= Generator.connectorSize;
        }
      }

      if (currentPiece.type[1] === -1) {
        curImgX += currentPiece.imgW - Generator.connectorSize;
      } else if (currentPiece.type[1] === 1) {
        curImgX += currentPiece.imgW - Generator.connectorSize;
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
  // console.log("createPuzzlePiece", data);

  const shadowCnv = createCanvas(data.imgW, data.imgH);
  const shdCtx = shadowCnv.getContext("2d");
  shadowCnv.width = data.imgW;
  shadowCnv.height = data.imgH;

  const svgPath = drawJigsawShape(data);

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
): ConnectorType[] => {
  const pieceAboveIsTopRightCorner =
    adjacentPieceAbove?.type[0] === 0 && adjacentPieceAbove?.type[1] === 0;
  const pieceAboveIsRightSide = adjacentPieceAbove?.type[1] === 0;
  const pieceAboveIsTopLeftCorner =
    adjacentPieceAbove?.type[3] === 0 && adjacentPieceAbove?.type[0] === 0;
  const pieceAboveIsLeftSide = adjacentPieceAbove?.type[3] === 0;
  const pieceAboveIsTopSide = adjacentPieceAbove?.type[0] === 0;
  const pieceAboveIsInnerPiece =
    adjacentPieceAbove?.type.join(",").indexOf("0") === -1;

  const pieceBehindIsBottomLeftCorner =
    adjacentPieceBehind?.type[2] === 0 && adjacentPieceBehind?.type[3] === 0;
  const pieceBehindIsBottomSide = adjacentPieceBehind?.type[2] === 0;

  const pieceAboveHasBottomPlug = adjacentPieceAbove?.type[2] === 1;
  const pieceBehindHasRightPlug = adjacentPieceBehind?.type[1] === 1;

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
    let topConnector, rightConnector, bottomConnector, leftConnector;
    // Last piece of each row, should be right side
    if (pieceAboveIsTopRightCorner || (!finalRow && pieceAboveIsRightSide)) {
      topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      rightConnector = 0;
      bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
      leftConnector = pieceBehindHasRightPlug ? -1 : 1;
    }

    // First piece of each row, should be left side
    if (pieceAboveIsTopLeftCorner || (!finalRow && pieceAboveIsLeftSide)) {
      topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
      bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
      leftConnector = 0;
    }

    // All middle pieces
    if ((!finalRow && pieceAboveIsInnerPiece) || pieceAboveIsTopSide) {
      topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
      bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
      leftConnector = pieceBehindHasRightPlug ? -1 : 1;
    }

    if (finalRow && pieceAboveIsLeftSide) {
      topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
      bottomConnector = 0;
      leftConnector = 0;
    }

    if (
      finalRow &&
      pieceAboveIsInnerPiece &&
      (pieceBehindIsBottomLeftCorner || pieceBehindIsBottomSide)
    ) {
      topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
      bottomConnector = 0;
      leftConnector = pieceBehindHasRightPlug ? -1 : 1;
    }

    // Very last piece, should be corner bottom right
    if (pieceAboveIsRightSide && pieceBehindIsBottomSide) {
      topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      rightConnector = 0;
      bottomConnector = 0;
      leftConnector = pieceBehindHasRightPlug ? -1 : 1;
    }

    return [
      topConnector,
      rightConnector,
      bottomConnector,
      leftConnector,
    ] as ConnectorType[];
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

  const rightLimit =
    Generator.stageWidth -
    Generator.largestPieceSpan -
    Generator.stageWidth / 100;
  const bottomLimit =
    Generator.stageHeight -
    Generator.largestPieceSpan -
    Generator.stageHeight / 100;

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

const drawJigsawShape = (piece: JigsawPieceData) => {
  let svgString = "";

  let x = 0;
  let y = 0;

  const hasTopPlug = piece.type[0] === 1;
  const hasLeftPlug = piece.type[3] === 1;

  let topBoundary = hasTopPlug ? y + Generator.connectorSize : y;
  let leftBoundary = hasLeftPlug ? x + Generator.connectorSize : x;

  let topConnector = null,
    rightConnector = null,
    bottomConnector = null,
    leftConnector = null;

  const jigsawShapes = new jigsawPath(
    Generator.pieceSize,
    Generator.connectorSize
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
    svgString += `h ${Generator.connectorDistanceFromCorner} `;
    svgString += `c ${topConnector.cp1.x} ${topConnector.cp1.y}, ${topConnector.cp2.x} ${topConnector.cp2.y}, ${topConnector.dest.x} ${topConnector.dest.y} `;
    svgString += `h ${Generator.connectorDistanceFromCorner} `;
  } else {
    svgString += `h ${Generator.pieceSize} `;
  }

  if (piece.type[1] === 1) {
    rightConnector = getRotatedConnector(jigsawShapes.getPlug(), 90);
  } else if (piece.type[1] === -1) {
    rightConnector = getRotatedConnector(jigsawShapes.getSocket(), 90);
  }

  if (rightConnector !== null) {
    svgString += `v ${Generator.connectorDistanceFromCorner} `;
    svgString += `c ${rightConnector.cp1.x} ${rightConnector.cp1.y}, ${rightConnector.cp2.x} ${rightConnector.cp2.y}, ${rightConnector.dest.x} ${rightConnector.dest.y} `;
    svgString += `v ${Generator.connectorDistanceFromCorner} `;
  } else {
    svgString += `v ${Generator.pieceSize} `;
  }

  if (piece.type[2] === 1) {
    bottomConnector = getRotatedConnector(jigsawShapes.getPlug(), 180);
  } else if (piece.type[2] === -1) {
    bottomConnector = getRotatedConnector(jigsawShapes.getSocket(), 180);
  }

  if (bottomConnector) {
    svgString += `h -${Generator.connectorDistanceFromCorner} `;
    svgString += `c ${bottomConnector.cp1.x} ${bottomConnector.cp1.y}, ${bottomConnector.cp2.x} ${bottomConnector.cp2.y}, ${bottomConnector.dest.x} ${bottomConnector.dest.y} `;
    svgString += `h -${Generator.connectorDistanceFromCorner} `;
  } else {
    svgString += `h -${Generator.pieceSize} `;
  }

  if (piece.type[3] === 1) {
    leftConnector = getRotatedConnector(jigsawShapes.getPlug(), 270);
  } else if (piece.type[3] === -1) {
    leftConnector = getRotatedConnector(jigsawShapes.getSocket(), 270);
  }

  if (leftConnector !== null) {
    svgString += `v -${Generator.connectorDistanceFromCorner} `;
    svgString += `c ${leftConnector.cp1.x} ${leftConnector.cp1.y}, ${leftConnector.cp2.x} ${leftConnector.cp2.y}, ${leftConnector.dest.x} ${leftConnector.dest.y} `;
  }

  svgString += "z";

  return svgString;
};

// exports.drawJigsawShape = drawJigsawShape;
// exports.default = PuzzleGenerator;

export default puzzleGenerator;