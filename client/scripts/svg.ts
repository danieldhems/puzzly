import SingleMovable from "./SingleMovable";
import { STROKE_OFFSET, SVGNS } from "./constants";
import jigsawPath from "./jigsawPath";
import { ConnectorType, JigsawPieceData, SkeletonPiece } from "./types";

export function getSvg(
    id: string,
    pieces: JigsawPieceData[],
    puzzleWidth: number,
    puzzleHeight: number,
    imagePath: string
): string {
    // TODO Bad name
    const pieceInfo = pieces.map(getAttributesForPiece);
    const clipId = `clip-${id}`;

    const totalWidth = pieceInfo.reduce((accumulator, current) => {
        return accumulator + current.width
    }, 0);
    const totalHeight = pieceInfo.reduce((accumulator, current) => {
        return accumulator + current.height
    }, 0);

    const imageX = Math.min(...pieceInfo.map(info => info.puzzleX));
    const imageY = Math.min(...pieceInfo.map(info => info.puzzleY));

    return `
      <svg xmlns="${SVGNS}" width="${totalWidth + STROKE_OFFSET}" height="${totalHeight + STROKE_OFFSET}" viewBox="0 0 ${totalWidth + STROKE_OFFSET} ${totalHeight + STROKE_OFFSET}" class="puzzle-piece-group-svg">
        <defs>
            ${pieceInfo.map((info) =>
        `<path id="${info.shapeId}" d="${info.pathString}"></path>`
    )}
        </defs>
        <clipPath id="${clipId}">
            ${pieceInfo.map((info) => `<use href="#${info.shapeId}"></use>`)}
        </clipPath>
            ${pieceInfo.map(
        (info) =>
            `<use href="#${info.shapeId}" x="${STROKE_OFFSET}" y="${STROKE_OFFSET}"></use>`
    )}
            <image 
                class="svg-image" 
                clip-path="url(#${clipId})" 
                href="${imagePath}" 
                width="${puzzleWidth}" 
                height="${puzzleHeight}"
                x="-${imageX}"
                y="-${imageY}"
            />
            ${pieceInfo.map(
        (info) =>
            `<use href="#${info.shapeId}" fill="none" stroke="black" stroke-width="1"></use>`
    )}
      </svg>
    `;
}

export function getAttributesForPiece(piece: JigsawPieceData) {
    const { index, puzzleX, puzzleY, width, height, groupId } = piece;
    const svgStartPosition = {
        x: groupId ? puzzleX : 0,
        y: groupId ? puzzleY : 0,
    };
    return {
        shapeId: `shape-${index}`,
        clipId: `clip-${index}`,
        pathString: getJigsawShapeSvgString(piece, svgStartPosition),
        puzzleX,
        puzzleY,
        width,
        height,
    };
}

export function getSvgStringPart(
    startPosition: { x: number, y: number },
    connector: ConnectorType,
) {

}

/**
 * 
 * @param piece 
 * @param startingPosition 
 * @returns 
 */
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

    // TODO: Assuming all pieces are square - might not work for irregular shapes / sizes
    const pieceSize = piece.basePieceSize;

    const { connectorSize, connectorDistanceFromCorner: unroundedConnectorDistanceFromCorner } = piece;
    const connectorDistanceFromCorner = Math.floor(unroundedConnectorDistanceFromCorner);
    const hasTopPlug = piece.type[0] === 1;
    const hasLeftPlug = piece.type[3] === 1;

    let topBoundary = hasTopPlug ? y + connectorSize : y;
    let leftBoundary = hasLeftPlug ? x + connectorSize : x;

    let topConnector = null,
        rightConnector = null,
        bottomConnector = null,
        leftConnector = null;

    const jigsawShapes = new jigsawPath(pieceSize as number, connectorSize);

    const getRotatedConnector = jigsawShapes.getRotatedConnector;

    svgString += `M ${leftBoundary} ${topBoundary} `;

    if (piece.type[0] === 1) {
        topConnector = getRotatedConnector(jigsawShapes.getPlug(), 0);
    } else if (piece.type[0] === -1) {
        topConnector = getRotatedConnector(jigsawShapes.getSocket(), 0);
    }

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

// export const getShapeForGroupPerimeter = (pieces: SingleMovable[]): string => {
//     let pathString: string;

//     const lowestIndex = Math.min(...pieces.map(piece => piece.pieceData.index));
//     const firstPiece = pieces.find(piece => piece.pieceData.index === lowestIndex) as SingleMovable;

//     const firstPiecePosition = {
//         y: firstPiece?.pieceData.puzzleY,
//         x: firstPiece?.pieceData.puzzleX,
//     };

//     const firstPieceType = firstPiece.pieceData.type;
//     const firstPieceConnectorSize = firstPiece.pieceData.connectorSize;

//     const startPosition = {
//         y: firstPieceType[0] === 1 ? firstPiecePosition.y : firstPiecePosition.y + firstPieceConnectorSize,
//         x: firstPieceType[3] === 1 ? firstPiecePosition.x : firstPiecePosition.x + firstPieceConnectorSize,
//     };

//     pathString = `M ${startPosition.x} ${startPosition.y}`;

//     pieces.forEach(piece => {
//         const pieceData = piece.pieceData;
//         if (pieceData.type[0] === 1) {

//         }
//     });

//     return pathString;
// }
