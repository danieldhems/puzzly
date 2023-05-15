import jigsawPath from "./jigsawPath.js";
import Utils from "./utils.js";

let loadedImage;

const CONNECTOR_SIZE_PERC = 30;
const SHOULDER_SIZE_PERC = 35;

const GeneratorConfig = {
  connectorRatio: null,
  piecesPerSideHorizontal: null,
  piecesPerSideVertical: null,
  selectedNumberOfPieces: null,
  pieceSize: null,
  connectorDistanceFromCorner: null,
  connectorSize: null,
  connectorLateralControlPointDistance: null,
  largestPieceSpan: null,
  strokeWidth: 1,
  shadowColor: "grey",
  strokeStyle: "#000",
};

const UPLOAD_DIR = "uploads";

const PuzzleGenerator = async function (imagePath, puzzleConfig) {
  GeneratorConfig.debugOptions = puzzleConfig.debugOptions;
  GeneratorConfig.image = await loadImage(imagePath);

  GeneratorConfig.spritePath = puzzleConfig.spritePath;

  GeneratorConfig.piecesPerSideHorizontal = Math.sqrt(
    puzzleConfig.selectedNumPieces
  );
  GeneratorConfig.piecesPerSideVertical = Math.sqrt(
    puzzleConfig.selectedNumPieces
  );
  GeneratorConfig.selectedNumberOfPieces = puzzleConfig.selectedNumPieces;

  GeneratorConfig.pieceSize =
    puzzleConfig.pieceSize ||
    Math.floor(
      puzzleConfig.boardSize / GeneratorConfig.piecesPerSideHorizontal
    );

  GeneratorConfig.totalWidth =
    GeneratorConfig.piecesPerSideHorizontal * GeneratorConfig.pieceSize;
  GeneratorConfig.totalHeight =
    GeneratorConfig.piecesPerSideVertical * GeneratorConfig.pieceSize;

  GeneratorConfig.strokeWidth = puzzleConfig.strokeWidth;

  GeneratorConfig.stageWidth = puzzleConfig.stageWidth;
  GeneratorConfig.stageHeight = puzzleConfig.stageHeight;

  GeneratorConfig.connectorDistanceFromCorner =
    (GeneratorConfig.pieceSize / 100) * SHOULDER_SIZE_PERC;
  GeneratorConfig.connectorSize = Math.floor(
    (GeneratorConfig.pieceSize / 100) * CONNECTOR_SIZE_PERC
  );

  GeneratorConfig.connectorLateralControlPointDistance =
    GeneratorConfig.connectorSize * 1.2;
  GeneratorConfig.largestPieceSpan =
    GeneratorConfig.pieceSize + GeneratorConfig.connectorSize * 2;

  GeneratorConfig.spriteSpacing =
    GeneratorConfig.piecesPerSideVertical *
    GeneratorConfig.largestPieceSpan *
    1.1;

  console.log("GeneratorConfig", GeneratorConfig);

  return {
    ...GeneratorConfig,
    generateDataForPuzzlePieces,
    drawJigsawShape,
  };
};

const loadImage = (path) => {
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

const generateDataForPuzzlePieces = async (puzzleId) => {
  const pieces = [];

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
    GeneratorConfig.spriteSpacing,
    GeneratorConfig.spriteSpacing * 2
  );
  const ctx = cnv.getContext("2d");
  ctx.webkitImageSmoothingEnabled = true;

  while (!done) {
    let currentPiece = {};
    // All pieces not on top row
    if (pieces.length >= GeneratorConfig.piecesPerSideHorizontal) {
      adjacentPieceAbove =
        pieces[pieces.length - GeneratorConfig.piecesPerSideHorizontal];
    }

    // Last piece in row, next piece should be a corner or right side
    if (
      pieces.length > 1 &&
      pieces.length % (GeneratorConfig.piecesPerSideHorizontal - 1) === 0
    ) {
      endOfRow = true;
    } else {
      endOfRow = false;
    }

    if (rowCount === GeneratorConfig.piecesPerSideVertical) {
      finalRow = true;
    }

    const previousPiece = pieces[pieces.length - 1];
    if (pieces.length > 0 && !previousPiece?.type.join(",")[1] !== 0) {
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
      puzzleId,
      curImgX,
      curImgY,
      currentPiece,
      numPiecesFromLeftEdge,
      numPiecesFromTopEdge,
      i
    );
    const { svgString } = drawJigsawShape(currentPiece);
    currentPiece.svgPathString = svgString;

    // console.log("generated piece", currentPiece);

    pieces.push(currentPiece);

    await createPuzzlePiece(currentPiece, ctx);

    // reached last piece, start next row
    if (pieces.length % GeneratorConfig.piecesPerSideHorizontal === 0) {
      curImgX = 0;

      const firstPieceOnRowAbove =
        pieces[pieces.length - GeneratorConfig.piecesPerSideHorizontal];

      curImgY =
        firstPieceOnRowAbove.imgY +
        firstPieceOnRowAbove.imgH -
        GeneratorConfig.connectorSize;

      numPiecesFromLeftEdge = 0;
      numPiecesFromTopEdge++;

      rowCount++;
    } else {
      if (rowCount > 1) {
        const nextPieceAbove =
          pieces[pieces.length - GeneratorConfig.piecesPerSideHorizontal];

        if (
          Utils.has(currentPiece.type, "plug", "top") &&
          Utils.has(nextPieceAbove.type, "plug", "bottom")
        ) {
          curImgY += GeneratorConfig.connectorSize;
        } else if (
          Utils.has(currentPiece.type, "socket", "top") &&
          Utils.has(nextPieceAbove.type, "socket", "bottom")
        ) {
          curImgY -= GeneratorConfig.connectorSize;
        }
      }

      if (Utils.has(currentPiece.type, "socket", "right")) {
        curImgX += currentPiece.imgW - GeneratorConfig.connectorSize;
      } else if (Utils.has(currentPiece.type, "plug", "right")) {
        curImgX += currentPiece.imgW - GeneratorConfig.connectorSize;
      }

      numPiecesFromLeftEdge++;
    }

    i++;

    if (i >= GeneratorConfig.selectedNumberOfPieces) {
      done = true;
    }
  }

  // writeToPngFile(cnv, GeneratorConfig.spritePath);

  return { sprite: cnv.toDataURL(), pieces };
};

const createCanvas = (width, height) => {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  return el;
};

const createPuzzlePiece = async (data, ctxForSprite) => {
  // console.log(data);
  const shadowCnv = createCanvas(data.imgW, data.imgH);
  const shdCtx = shadowCnv.getContext("2d");
  shadowCnv.width = data.imgW;
  shadowCnv.height = data.imgH;

  const { path: pathString } = drawJigsawShape(data);

  shdCtx.fillStyle = GeneratorConfig.shadowColor;
  const path = new Path2D(pathString);
  shdCtx.fill(path);

  const shadowImgData = shdCtx.getImageData(0, 0, data.imgW, data.imgH);
  ctxForSprite.putImageData(
    shadowImgData,
    data.spriteShadowX,
    data.spriteShadowY
  );

  const tmpCnv = createCanvas(data.imgW, data.imgH);
  const tmpCtx = tmpCnv.getContext("2d");
  tmpCtx.imageSmoothingEnabled = false;
  tmpCtx.strokeStyle = GeneratorConfig.strokeStyle;
  tmpCtx.lineWidth = GeneratorConfig.strokeWidth;
  tmpCnv.width = data.imgW;
  tmpCnv.height = data.imgH;

  const p = new Path2D(pathString);
  tmpCtx.clip(p);
  tmpCtx.drawImage(
    GeneratorConfig.image,
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

  const img = await loadImage(tmpCnv.toDataURL());
  // document.body.appendChild(img);
  ctxForSprite.drawImage(img, data.spriteX, data.spriteY, data.imgW, data.imgH);
};

const getPieceWidthAndHeightWithConnectors = (piece) => {
  let actualWidth = GeneratorConfig.pieceSize;
  let actualHeight = GeneratorConfig.pieceSize;

  if (Utils.has(piece.type, "plug", "left")) {
    actualWidth += GeneratorConfig.connectorSize;
  }
  if (Utils.has(piece.type, "plug", "right")) {
    actualWidth += GeneratorConfig.connectorSize;
  }

  if (Utils.has(piece.type, "plug", "top")) {
    actualHeight += GeneratorConfig.connectorSize;
  }
  if (Utils.has(piece.type, "plug", "bottom")) {
    actualHeight += GeneratorConfig.connectorSize;
  }

  return {
    width: actualWidth,
    height: actualHeight,
  };
};

const getConnectors = (
  adjacentPieceBehind,
  adjacentPieceAbove,
  endOfRow,
  finalRow
) => {
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

  const connectorChoices = [-1, 1];

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
      const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      const rightConnector = 0;
      const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
      const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
      return [topConnector, rightConnector, bottomConnector, leftConnector];
    }

    // First piece of each row, should be left side
    if (pieceAboveIsTopLeftCorner || (!finalRow && pieceAboveIsLeftSide)) {
      const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
      const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
      const leftConnector = 0;
      return [topConnector, rightConnector, bottomConnector, leftConnector];
    }

    // All middle pieces
    if ((!finalRow && pieceAboveIsInnerPiece) || pieceAboveIsTopSide) {
      const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
      const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
      const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
      return [topConnector, rightConnector, bottomConnector, leftConnector];
    }

    if (finalRow && pieceAboveIsLeftSide) {
      const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
      const bottomConnector = 0;
      const leftConnector = 0;
      return [topConnector, rightConnector, bottomConnector, leftConnector];
    }

    if (
      finalRow &&
      pieceAboveIsInnerPiece &&
      (pieceBehindIsBottomLeftCorner || pieceBehindIsBottomSide)
    ) {
      const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
      const bottomConnector = 0;
      const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
      return [topConnector, rightConnector, bottomConnector, leftConnector];
    }

    // Very last piece, should be corner bottom right
    if (pieceAboveIsRightSide && pieceBehindIsBottomSide) {
      const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
      const rightConnector = 0;
      const bottomConnector = 0;
      const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
      return [topConnector, rightConnector, bottomConnector, leftConnector];
    }
  }
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const assignInitialPieceData = (
  puzzleId,
  imgX,
  imgY,
  piece,
  numPiecesFromLeftEdge,
  numPiecesFromTopEdge,
  i
) => {
  let { width, height } = getPieceWidthAndHeightWithConnectors(piece);

  width = Math.floor(width);
  height = Math.floor(height);

  const piecePositionOnSprite = {
    x: Math.floor(
      GeneratorConfig.largestPieceSpan * 1.1 * numPiecesFromLeftEdge
    ),
    y: Math.floor(
      GeneratorConfig.largestPieceSpan * 1.1 * numPiecesFromTopEdge
    ),
  };

  const rightLimit =
    GeneratorConfig.stageWidth -
    GeneratorConfig.largestPieceSpan -
    GeneratorConfig.stageWidth / 100;
  const bottomLimit =
    GeneratorConfig.stageHeight -
    GeneratorConfig.largestPieceSpan -
    GeneratorConfig.stageHeight / 100;

  // fish
  const randPos = {
    x: getRandomInt(1, rightLimit),
    y: getRandomInt(1, bottomLimit),
  };

  return Object.assign(
    {
      id: i,
      puzzleId,
      imgX: imgX,
      imgY: imgY,
      spriteX: piecePositionOnSprite.x,
      spriteY: piecePositionOnSprite.y,
      spriteShadowX: piecePositionOnSprite.x,
      spriteShadowY: piecePositionOnSprite.y + GeneratorConfig.spriteSpacing,
      pageX: GeneratorConfig.debugOptions.noDispersal
        ? piecePositionOnSprite.x
        : randPos.x,
      pageY: GeneratorConfig.debugOptions.noDispersal
        ? piecePositionOnSprite.y
        : randPos.y,
      imgW: width,
      imgH: height,
      pieceWidth: width,
      pieceHeight: height,
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

const getRandomPositionOutsideBoardArea = (sector) => {
  const randSectorBoundingBox = this.getSectorBoundingBox(sector);

  return {
    left: this.getRandomInt(
      randSectorBoundingBox.left,
      randSectorBoundingBox.right - this.largestPieceSpan
    ),
    top: this.getRandomInt(
      randSectorBoundingBox.top,
      randSectorBoundingBox.bottom - this.largestPieceSpan
    ),
  };
};

const drawJigsawShape = (piece) => {
  let svgString = "";

  let x = 0;
  let y = 0;

  const hasTopPlug = Utils.has(piece.type, "plug", "top");
  const hasLeftPlug = Utils.has(piece.type, "plug", "left");

  let topBoundary = hasTopPlug ? y + GeneratorConfig.connectorSize : y;
  let leftBoundary = hasLeftPlug ? x + GeneratorConfig.connectorSize : x;

  let topConnector = null,
    rightConnector = null,
    bottomConnector = null,
    leftConnector = null;

  const jigsawShapes = new jigsawPath(GeneratorConfig);

  const getRotatedConnector = jigsawShapes.getRotatedConnector;

  svgString += `M ${leftBoundary} ${topBoundary} `;

  if (Utils.has(piece.type, "plug", "top")) {
    topConnector = getRotatedConnector(jigsawShapes.getPlug(), 0);
  } else if (Utils.has(piece.type, "socket", "top")) {
    topConnector = getRotatedConnector(jigsawShapes.getSocket(), 0);
  }

  if (topConnector) {
    svgString += `h ${GeneratorConfig.connectorDistanceFromCorner} `;
    svgString += `c ${topConnector.cp1.x} ${topConnector.cp1.y}, ${topConnector.cp2.x} ${topConnector.cp2.y}, ${topConnector.dest.x} ${topConnector.dest.y} `;
    svgString += `h ${GeneratorConfig.connectorDistanceFromCorner} `;
  } else {
    svgString += `h ${GeneratorConfig.pieceSize} `;
  }

  if (Utils.has(piece.type, "plug", "right")) {
    rightConnector = getRotatedConnector(jigsawShapes.getPlug(), 90);
  } else if (Utils.has(piece.type, "socket", "right")) {
    rightConnector = getRotatedConnector(jigsawShapes.getSocket(), 90);
  }

  if (rightConnector !== null) {
    svgString += `v ${GeneratorConfig.connectorDistanceFromCorner} `;
    svgString += `c ${rightConnector.cp1.x} ${rightConnector.cp1.y}, ${rightConnector.cp2.x} ${rightConnector.cp2.y}, ${rightConnector.dest.x} ${rightConnector.dest.y} `;
    svgString += `v ${GeneratorConfig.connectorDistanceFromCorner} `;
  } else {
    svgString += `v ${GeneratorConfig.pieceSize} `;
  }

  if (Utils.has(piece.type, "plug", "bottom")) {
    bottomConnector = getRotatedConnector(jigsawShapes.getPlug(), 180);
  } else if (Utils.has(piece.type, "socket", "bottom")) {
    bottomConnector = getRotatedConnector(jigsawShapes.getSocket(), 180);
  }

  if (bottomConnector) {
    svgString += `h -${GeneratorConfig.connectorDistanceFromCorner} `;
    svgString += `c ${bottomConnector.cp1.x} ${bottomConnector.cp1.y}, ${bottomConnector.cp2.x} ${bottomConnector.cp2.y}, ${bottomConnector.dest.x} ${bottomConnector.dest.y} `;
    svgString += `h -${GeneratorConfig.connectorDistanceFromCorner} `;
  } else {
    svgString += `h -${GeneratorConfig.pieceSize} `;
  }

  if (Utils.has(piece.type, "plug", "left")) {
    leftConnector = getRotatedConnector(jigsawShapes.getPlug(), 270);
  } else if (Utils.has(piece.type, "socket", "left")) {
    leftConnector = getRotatedConnector(jigsawShapes.getSocket(), 270);
  }

  if (leftConnector !== null) {
    svgString += `v -${GeneratorConfig.connectorDistanceFromCorner} `;
    svgString += `c ${leftConnector.cp1.x} ${leftConnector.cp1.y}, ${leftConnector.cp2.x} ${leftConnector.cp2.y}, ${leftConnector.dest.x} ${leftConnector.dest.y} `;
  }

  svgString += "z";

  return { pieceType: piece.type, path: svgString };
};

// exports.drawJigsawShape = drawJigsawShape;
// exports.default = PuzzleGenerator;

export default PuzzleGenerator;
