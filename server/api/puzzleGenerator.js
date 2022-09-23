const fs = require("fs");
require("canvas-5-polyfill").default;
const { createCanvas, loadImage } = require("canvas");
const pieceHelper = require("../pieceHelpers").default;
const jigsawPath = require("../jigsawPath").default;

class PuzzleGenerator {
  constructor(imagePath, puzzleConfig){

    this.connectorRatio = this.connectorDistanceFromCornerRatio = 33;
    this.piecesPerSideHorizontal = Math.sqrt(puzzleConfig.selectedNumPieces);
    this.piecesPerSideVertical = Math.sqrt(puzzleConfig.selectedNumPieces);
    this.selectedNumberOfPieces = puzzleConfig.selectedNumPieces;
		
    this.start(imagePath);
  }
	
  async start(imagePath){
		const img = await loadImage(imagePath);
    this.image = img;
    this.pieceSize = this.image.naturalWidth / this.piecesPerSideHorizontal;
		this.connectorDistanceFromCorner = Math.ceil(this.pieceSize / 100 * this.connectorDistanceFromCornerRatio);
    this.connectorSize = this.pieceSize / 100 * this.connectorRatio;
		this.largestPieceSpan = this.pieceSize + (this.connectorSize * 2);
    this.generateDataForPuzzlePieces(this.image, this.piecesPerSideHorizontal);
  }

  createPuzzlePiece(data, ctxForSprite, writeToOwnFile = false){
		const tmpCnv = createCanvas(data.imgW, data.imgH);
		tmpCnv.width = data.imgW;
		tmpCnv.height = data.imgH;
		const tmpCtx = tmpCnv.getContext("2d");
		tmpCtx.imageSmoothingEnabled = false;
		tmpCtx.strokeStyle = '#000';

    let path = new Path2D();
		
		const pathResult = this.drawJigsawShape(tmpCtx, path, data, { x: 0, y: 0 });
		tmpCtx.clip(pathResult);
    tmpCtx.drawImage(this.image, data.imgX, data.imgY, data.imgW, data.imgH, 0, 0, tmpCnv.width, tmpCnv.height);
		
		const tmpImgData = tmpCtx.getImageData(0, 0, tmpCnv.width, tmpCnv.height);
		ctxForSprite.putImageData(tmpImgData, data.spriteX, data.spriteY)
    
		if(writeToOwnFile){
			writeToPngFile(cnv, data.id);
		}
  }
	
	async writeToPngFile(cnv, fileName){
		const out = fs.createWriteStream(`${fileName}.png`);
		const stream = cnv.createPNGStream();
		stream.pipe(out);
		out.on('finish', () => {
			console.log(`PNG file ${fileName}.png was created.`)
		})
	}

  getPieceWidthAndHeightWithConnectors(piece){
		let actualWidth = this.pieceSize;
		let actualHeight = this.pieceSize;

		if(pieceHelper.has(piece.type, 'plug', 'left')){
			actualWidth += this.connectorSize; 
		}
		if(pieceHelper.has(piece.type, 'plug', 'right')){
			actualWidth += this.connectorSize; 
		}

		if(pieceHelper.has(piece.type, 'plug', 'top')){
			actualHeight += this.connectorSize;
		}
		if(pieceHelper.has(piece.type, 'plug', 'bottom')){
			actualHeight += this.connectorSize;
		}

		return {
			width: actualWidth,
			height: actualHeight,
		}
	}

  getConnectors(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow){
    const pieceAboveIsTopRightCorner = adjacentPieceAbove?.type[0] === 0 && adjacentPieceAbove?.type[1] === 0;
    const pieceAboveIsRightSide = adjacentPieceAbove?.type[1] === 0;
    const pieceAboveIsTopLeftCorner = adjacentPieceAbove?.type[3] === 0 && adjacentPieceAbove?.type[0] === 0;
    const pieceAboveIsLeftSide = adjacentPieceAbove?.type[3] === 0;
    const pieceAboveIsTopSide = adjacentPieceAbove?.type[0] === 0;
    const pieceAboveIsInnerPiece = adjacentPieceAbove?.type.join(",").indexOf("0") === -1; 
    
    const pieceBehindIsBottomLeftCorner = adjacentPieceBehind?.type[2] === 0 && adjacentPieceBehind?.type[3] === 0;
    const pieceBehindIsBottomSide = adjacentPieceBehind?.type[2] === 0;

    const pieceAboveHasBottomPlug = adjacentPieceAbove?.type[2] === 1;
    const pieceBehindHasRightPlug = adjacentPieceBehind?.type[1] === 1;

		const connectorChoices = [-1,1];

		// Top left corner piece
		if(!adjacentPieceBehind && !adjacentPieceAbove){
			const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
			const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
			return [0,rightConnector,bottomConnector,0]
		}

		// First row pieces
		if(!adjacentPieceAbove){
			const rightConnector = endOfRow ? 0 : connectorChoices[Math.floor(Math.random() * 2)];
			const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
      // piece behind has right plug?
			const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
			return [0,rightConnector,bottomConnector,leftConnector];
		}
		// All pieces after top row
		else {
			// Last piece of each row, should be right side
			if(pieceAboveIsTopRightCorner || (!finalRow && pieceAboveIsRightSide)){
				const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
				const rightConnector = 0;
				const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}
			
			// First piece of each row, should be left side
			if(pieceAboveIsTopLeftCorner || (!finalRow && pieceAboveIsLeftSide)){
				const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
				const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const leftConnector = 0;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}
			
			// All middle pieces
			if((!finalRow && pieceAboveIsInnerPiece) || pieceAboveIsTopSide){
				const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
				const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}

			if(finalRow && pieceAboveIsLeftSide){
				const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
				const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const bottomConnector = 0;
				const leftConnector = 0;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}
			
			if(finalRow && pieceAboveIsInnerPiece && (pieceBehindIsBottomLeftCorner || pieceBehindIsBottomSide)){
				const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
				const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const bottomConnector = 0;
				const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}

			// Very last piece, should be corner bottom right
			if(pieceAboveIsRightSide && pieceBehindIsBottomSide){
				const topConnector = pieceAboveHasBottomPlug ? -1 : 1;
				const rightConnector = 0;
				const bottomConnector = 0;
				const leftConnector = pieceBehindHasRightPlug ? -1 : 1;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}
		}
	}

  assignInitialPieceData(imgX, imgY, solvedX, solvedY, piece, numPiecesFromLeftEdge, numPiecesFromTopEdge, i){
		const pieceDimensions = this.getPieceWidthAndHeightWithConnectors(piece);
		const piecePositionOnSprite = { x: this.largestPieceSpan * numPiecesFromLeftEdge, y: this.largestPieceSpan * numPiecesFromTopEdge };
		return Object.assign({
			id: i,
			imgX,
			imgY,
			imgW: pieceDimensions.width,
			imgH: pieceDimensions.height,
			solvedX,
			solvedY,
			spriteX: piecePositionOnSprite.x,
			spriteY: piecePositionOnSprite.y,
			isInnerPiece: piece.type.join(",").indexOf("0") === -1,
			isVisible: true,
			connections: [],
			numPiecesFromLeftEdge,
			numPiecesFromTopEdge,
		}, piece);
	}

  async generateDataForPuzzlePieces(image, piecesPerSideHorizontal, piecesPerSideVertical = null) {
    const pieces = [];

    var curImgX = 0;
    var curImgY = 0;
    var numPiecesFromLeftEdge = 0;
    var numPiecesFromTopEdge = 0;
  
    let done = false;
    let i=0;
  
    let adjacentPieceBehind = null;
    let adjacentPieceAbove = null;
    let endOfRow = false;
    let rowCount = 1;
    let finalRow = false;
  
		const cnvWidth = this.largestPieceSpan * this.piecesPerSideHorizontal;
		const cnvHeight = this.largestPieceSpan * this.piecesPerSideVertical;
		const cnv = createCanvas(cnvWidth, cnvHeight);
		const ctx = cnv.getContext("2d");
  
    while(!done){
      let currentPiece = {};
      // All pieces not on top row
      if(pieces.length >= piecesPerSideHorizontal){
        adjacentPieceAbove = pieces[pieces.length - piecesPerSideHorizontal];
      }
  
      // Last piece in row, next piece should be a corner or right side
      if(pieces.length > 1 && pieces.length % (piecesPerSideHorizontal - 1) === 0){
        endOfRow = true;
      } else {
        endOfRow = false;
      }
  
      if(rowCount === piecesPerSideVertical){
        finalRow = true;
      }
  
      const previousPiece = pieces[pieces.length-1];
      if(pieces.length > 0 && !previousPiece?.type.join(",")[1] !== 0){
        adjacentPieceBehind = pieces[i-1];
      }
  
      if(previousPiece?.type[1] === 0){
        adjacentPieceBehind = null;
      }
  
      currentPiece.type = this.getConnectors(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow);
      currentPiece = this.assignInitialPieceData(curImgX, curImgY, curImgX, curImgY, currentPiece, numPiecesFromLeftEdge, numPiecesFromTopEdge, i);
      // console.log(currentPiece)
  
      pieces.push(currentPiece);
      this.createPuzzlePiece(currentPiece, ctx);
  
      // reached last piece, start next row
      if(pieces.length % piecesPerSideHorizontal === 0){
        curImgX = 0;

        const firstPieceOnRowAbove = pieces[pieces.length - piecesPerSideHorizontal];
  
        curImgY = firstPieceOnRowAbove.imgY + firstPieceOnRowAbove.imgH - this.connectorSize;
  
        numPiecesFromLeftEdge = 0;
        numPiecesFromTopEdge++;
  
        rowCount++;
      } else {
        if(rowCount > 1){
          const nextPieceAbove = pieces[pieces.length - piecesPerSideHorizontal];
  
          if(pieceHelper.has(currentPiece.type, "plug", "top") && pieceHelper.has(nextPieceAbove.type, "plug", "bottom")){
            curImgY += this.connectorSize;
          } else if(pieceHelper.has(currentPiece.type, "socket", "top") && pieceHelper.has(nextPieceAbove.type, "socket", "bottom")){
            curImgY -= this.connectorSize;
          }
        }
        
        if(pieceHelper.has(currentPiece.type, "socket", "right")){
          curImgX += currentPiece.imgW - this.connectorSize;
        } else if(pieceHelper.has(currentPiece.type, "plug", "right")){
          curImgX += currentPiece.imgW - this.connectorSize;
        }
  
        numPiecesFromLeftEdge ++;
      }
      
      i++;
  
      if(i >= this.selectedNumberOfPieces) done = true;
    }

		this.writeToPngFile(cnv, "puzzle");

    return pieces;
  }

  drawJigsawShape(ctx, path, piece, {x, y}, showGuides = false, stroke = false){
		// console.log('drawJigsawShape', piece)

		const hasTopPlug = pieceHelper.has(piece.type, 'plug', 'top')
		const hasLeftPlug = pieceHelper.has(piece.type, 'plug', 'left')
		
		const topBoundary = hasTopPlug ? y + this.connectorSize : y;
		const bottomBoundary = hasTopPlug ? y + this.pieceSize + this.connectorSize : y + this.pieceSize;
		const leftBoundary = hasLeftPlug ? x + this.connectorSize : x;
		const rightBoundary = hasLeftPlug ? x + this.pieceSize + this.connectorSize : x + this.pieceSize;

		let topConnector = null, rightConnector = null, bottomConnector = null, leftConnector = null;
		
    const jigsawShapes = new jigsawPath(this.pieceSize, this.connectorSize, this.connectorDistanceFromCorner);
		
		path.moveTo(leftBoundary, topBoundary);

		if(pieceHelper.has(piece.type, 'plug', 'top')){
			topConnector = jigsawShapes.getTopPlug(leftBoundary, topBoundary, rightBoundary);
		} else if(pieceHelper.has(piece.type, 'socket', 'top')){
			topConnector = jigsawShapes.getTopSocket(leftBoundary, topBoundary, rightBoundary);
		}

		if(topConnector){
			path.lineTo(leftBoundary + this.connectorDistanceFromCorner, topBoundary);
			path.quadraticCurveTo(topConnector.firstCurve.cpX, topConnector.firstCurve.cpY, topConnector.firstCurve.destX, topConnector.firstCurve.destY);
			path.bezierCurveTo(topConnector.secondCurve.cp1.x, topConnector.secondCurve.cp1.y, topConnector.secondCurve.cp2.x, topConnector.secondCurve.cp2.y, topConnector.secondCurve.destX, topConnector.secondCurve.destY)
			path.bezierCurveTo(topConnector.thirdCurve.cp1.x, topConnector.thirdCurve.cp1.y, topConnector.thirdCurve.cp2.x, topConnector.thirdCurve.cp2.y, topConnector.thirdCurve.destX, topConnector.thirdCurve.destY)
			path.quadraticCurveTo(topConnector.fourthCurve.cpX, topConnector.fourthCurve.cpY, topConnector.fourthCurve.destX, topConnector.fourthCurve.destY);
		}
		path.lineTo(rightBoundary, topBoundary);

		if(pieceHelper.has(piece.type, 'plug', 'right')){
			rightConnector = jigsawShapes.getRightPlug(topBoundary, rightBoundary, bottomBoundary);	
		} else if(pieceHelper.has(piece.type, 'socket', 'right')){
			rightConnector = jigsawShapes.getRightSocket(topBoundary, rightBoundary, bottomBoundary);
		}

		if(rightConnector !== null){
			path.lineTo(rightBoundary, topBoundary + this.connectorDistanceFromCorner);
			path.quadraticCurveTo(rightConnector.firstCurve.cpX, rightConnector.firstCurve.cpY, rightConnector.firstCurve.destX, rightConnector.firstCurve.destY);
			path.bezierCurveTo(rightConnector.secondCurve.cp1.x, rightConnector.secondCurve.cp1.y, rightConnector.secondCurve.cp2.x, rightConnector.secondCurve.cp2.y, rightConnector.secondCurve.destX, rightConnector.secondCurve.destY)
			path.bezierCurveTo(rightConnector.thirdCurve.cp1.x, rightConnector.thirdCurve.cp1.y, rightConnector.thirdCurve.cp2.x, rightConnector.thirdCurve.cp2.y, rightConnector.thirdCurve.destX, rightConnector.thirdCurve.destY);
			path.quadraticCurveTo(rightConnector.fourthCurve.cpX, rightConnector.fourthCurve.cpY, rightConnector.fourthCurve.destX, rightConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary + this.pieceSize, topBoundary + this.pieceSize)

		if(pieceHelper.has(piece.type, 'plug', 'bottom')){
			bottomConnector = jigsawShapes.getBottomPlug(leftBoundary + this.pieceSize, topBoundary + this.pieceSize, leftBoundary, piece.imgW);
		} else if(pieceHelper.has(piece.type, 'socket', 'bottom')){
			bottomConnector = jigsawShapes.getBottomSocket(leftBoundary + this.pieceSize, topBoundary + this.pieceSize, leftBoundary, piece.imgW);
		}

		if(bottomConnector){
			path.lineTo(leftBoundary + this.pieceSize - this.connectorDistanceFromCorner, topBoundary + this.pieceSize);
			path.quadraticCurveTo(bottomConnector.firstCurve.cpX, bottomConnector.firstCurve.cpY, bottomConnector.firstCurve.destX, bottomConnector.firstCurve.destY);
			path.bezierCurveTo(bottomConnector.secondCurve.cp1.x, bottomConnector.secondCurve.cp1.y, bottomConnector.secondCurve.cp2.x, bottomConnector.secondCurve.cp2.y, bottomConnector.secondCurve.destX, bottomConnector.secondCurve.destY)
			path.bezierCurveTo(bottomConnector.thirdCurve.cp1.x, bottomConnector.thirdCurve.cp1.y, bottomConnector.thirdCurve.cp2.x, bottomConnector.thirdCurve.cp2.y, bottomConnector.thirdCurve.destX, bottomConnector.thirdCurve.destY);
			path.quadraticCurveTo(bottomConnector.fourthCurve.cpX, bottomConnector.fourthCurve.cpY, bottomConnector.fourthCurve.destX, bottomConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary, topBoundary + this.pieceSize)

		if(pieceHelper.has(piece.type, 'plug', 'left')){
			leftConnector = jigsawShapes.getLeftPlug(topBoundary + this.pieceSize, leftBoundary, topBoundary, piece.imgH);
		} else if(pieceHelper.has(piece.type, 'socket', 'left')){
			leftConnector = jigsawShapes.getLeftSocket(topBoundary + this.pieceSize, leftBoundary, topBoundary, piece.imgH);
		}
		if(leftConnector !== null){
			path.lineTo(leftBoundary, topBoundary + this.pieceSize - this.connectorDistanceFromCorner);
			path.quadraticCurveTo(leftConnector.firstCurve.cpX, leftConnector.firstCurve.cpY, leftConnector.firstCurve.destX, leftConnector.firstCurve.destY);
			path.bezierCurveTo(leftConnector.secondCurve.cp1.x, leftConnector.secondCurve.cp1.y, leftConnector.secondCurve.cp2.x, leftConnector.secondCurve.cp2.y, leftConnector.secondCurve.destX, leftConnector.secondCurve.destY)
			path.bezierCurveTo(leftConnector.thirdCurve.cp1.x, leftConnector.thirdCurve.cp1.y, leftConnector.thirdCurve.cp2.x, leftConnector.thirdCurve.cp2.y, leftConnector.thirdCurve.destX, leftConnector.thirdCurve.destY);
			path.quadraticCurveTo(leftConnector.fourthCurve.cpX, leftConnector.fourthCurve.cpY, leftConnector.fourthCurve.destX, leftConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary, topBoundary);

		if(showGuides){
			if(topConnector) this.drawPlugGuides(ctx, topConnector)
			if(rightConnector) this.drawPlugGuides(ctx, rightConnector)
			if(bottomConnector) this.drawPlugGuides(ctx, bottomConnector)
			if(leftConnector) this.drawPlugGuides(ctx, leftConnector)
		}

		if(stroke){
      ctx.strokeStyle = "#fff";
			ctx.stroke(path)
		}

		return path;
	}
}

exports.default = PuzzleGenerator;
