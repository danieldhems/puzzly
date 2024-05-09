export enum Orientation {
    Landscape = "Landscape",
    Portrait = "Portrait",
    Square = "Square",
}

export interface PuzzleSize {
    numberOfPiecesHorizontal?: number;
    numberOfPiecesVertical?: number;
    pieceSize: number;
    puzzleWidth: number;
    puzzleHeight: number;
}

export enum PuzzleAxis {
    Horizontal = "Horizontal",
    Vertical = "Vertical",
  }

export function getPuzzleSizes(
    imageWidth: number, 
    imageHeight: number, 
    minimumPieceSize: number, 
    minimumNumberOfPieces: number
) {
    const shortSide: PuzzleAxis | null =
      imageWidth < imageHeight ? PuzzleAxis.Horizontal
      : imageHeight < imageWidth ? PuzzleAxis.Vertical
      : null;

  let n: number = minimumNumberOfPieces;
  let divisionResult: number;

  const puzzleSizes: PuzzleSize[] = [];

  if(shortSide){
      do {
          let shortSideKeyName: string;
          let longSideKeyName: string;
          let puzzleWidth: number;
          let puzzleHeight: number;
          let numberOfPiecesOnLongSide: number;

          divisionResult = Math.ceil(
            shortSide === PuzzleAxis.Horizontal
            ? imageHeight / n
            : imageWidth / n
        );

          if(shortSide === PuzzleAxis.Horizontal) {
            // Portrait puzzle
            shortSideKeyName = "numberOfPiecesHorizontal";
            longSideKeyName = "numberOfPiecesVertical";
            puzzleWidth = imageWidth;
            const longSideConfig = getConfigForForAdjacentSideByPieceSize(
                imageHeight,
                divisionResult
            );
            numberOfPiecesOnLongSide = longSideConfig.numberOfPieces;
            puzzleHeight = longSideConfig.totalLength;
          } else {
            // Landscape puzzle
            shortSideKeyName = "numberOfPiecesVertical";
            longSideKeyName = "numberOfPiecesHorizontal";
            puzzleHeight = imageHeight;
            const longSideConfig = getConfigForForAdjacentSideByPieceSize(
                imageWidth,
                divisionResult
            );
            numberOfPiecesOnLongSide = longSideConfig.numberOfPieces;
            puzzleWidth = longSideConfig.totalLength;
          }

          puzzleSizes.push({
              [shortSideKeyName]: n,
              [longSideKeyName]: numberOfPiecesOnLongSide,
              pieceSize: divisionResult,
              puzzleWidth,
              puzzleHeight,
          });

          n++;
      } while (divisionResult > minimumPieceSize)
  
      return puzzleSizes;
  } else {
      // Square puzzles
  }
}

/**
 * Calculate the maximum number of pieces we can have along a given edge
 * by simple addition based on a known size.
 * 
 * i.e. keep adding the known piece size while it still fits within the length
 * 
 * Use this to get the number of pieces for the longer edge once we know
 * the number of pieces and their sizes for the shorter egde.
 * 
 * @param edgeLength number
 * @param interval number
 * @returns { numberOfPieces: number, totalLength: number }
 */
export function getConfigForForAdjacentSideByPieceSize(
    edgeLength: number,
    pieceSize: number,
): {
    numberOfPieces: number,
    totalLength: number
} {
    let n: number = 1;
    let sum: number = 0;

    do {
        sum += pieceSize;
        n=n+1;
    } while (sum < edgeLength)

    return {
        numberOfPieces: n,
        totalLength: sum
    }
}

const imageWidth = 1920;
const imageHeight = 1024;
console.log(getPuzzleSizes(imageWidth, imageHeight, 40, 9))
