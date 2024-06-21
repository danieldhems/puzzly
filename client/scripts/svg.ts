import { SVGNS } from "./constants";
import jigsawPath from "./jigsawPath";
import { getConnectorDimensions } from "./puzzleGenerator";
import { JigsawPieceData, SkeletonPiece } from "./types";

export function getSvg(
    id: string,
    pieces: JigsawPieceData[],
    boardWidth: number,
    boardHeight: number,
    imagePath: string
): string {
    const pieceInfo = pieces.map(getAttributesForPiece);
    const clipId = `clip-${id}`;

    return `
      <svg xmlns="${SVGNS}" width="${boardWidth}" height="${boardHeight}" viewBox="0 0 ${boardWidth} ${boardHeight}" class="puzzle-piece-group-svg">
        <defs>
            ${pieceInfo.map(info => (
        `<path id="${info.shapeId}" d="${info.pathString}"></path>`
    ))}
        </defs>
        <clipPath id="${clipId}">
            ${pieceInfo.map(info => (
        `<use href="#${info.shapeId}"></use>`
    ))}
        </clipPath>
        ${pieceInfo.map(info => (
        `<use href="#${info.shapeId}" fill="none" stroke="black" stroke-width="1"></use>`
    ))}
        ${pieceInfo.map(info => (
        `<use href="#${info.shapeId}" fill="black" x="2" y="2"></use>`
    ))}
        <image class="svg-image" clip-path="url(#${id})" href="${imagePath}" width="${boardWidth}" height="${boardHeight}" />
      </svg>
    `;
}

export function getAttributesForPiece(piece: JigsawPieceData) {
    const { index, puzzleX, puzzleY } = piece;
    return {
        shapeId: `shape-${index}`,
        clipId: `clip-${index}`,
        pathString: getJigsawShapeSvgString(piece, { x: puzzleX, y: puzzleY }),
        puzzleX,
        puzzleY,
    }
}

export const getJigsawShapeSvgString = (
    piece: SkeletonPiece | JigsawPieceData,
    startingPosition?: {
        x: number;
        y: number;
    }
) => {

    let svgString = "";

    let x = startingPosition?.x || 0;
    let y = startingPosition?.y || 0;

    // TODO: Assuming all pieces are square - won't work for irregular shapes / sizes
    const pieceSize = piece.basePieceSize;

    // 
    const { connectorSize, connectorDistanceFromCorner } = getConnectorDimensions(pieceSize as number);
    const hasTopPlug = piece.type[0] === 1;
    const hasLeftPlug = piece.type[3] === 1;

    let topBoundary = hasTopPlug ? y + connectorSize : y;
    let leftBoundary = hasLeftPlug ? x + connectorSize : x;

    let topConnector = null,
        rightConnector = null,
        bottomConnector = null,
        leftConnector = null;

    const jigsawShapes = new jigsawPath(
        pieceSize as number,
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