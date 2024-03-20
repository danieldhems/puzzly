import { JigsawPieceData, PuzzleCreatorOptions } from "./types";
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
declare const puzzleGenerator: (imagePath: string, puzzleConfig: PuzzleCreatorOptions) => Promise<PuzzleGenerator>;
export default puzzleGenerator;
