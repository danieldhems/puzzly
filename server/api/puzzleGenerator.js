require("canvas-5-polyfill").default;
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const pieceHelper = require("../pieceHelpers").default;
const jigsawPath = require("../jigsawPath").default;

let loadedImage;

const GeneratorConfig = {
	spriteName: null,
	connectorRatio: null,
	piecesPerSideHorizontal: null,
	piecesPerSideVertical: null,
	selectedNumberOfPieces: null,
	pieceSize: null,
	connectorDistanceFromCorner: null,
	connectorSize: null,
	largestPieceSpan: null,
	strokeWidth: 1,
}

const generatePuzzle = async (imagePath, puzzleConfig, spriteName) => {
	loadedImage = await loadImage(imagePath);
	
	GeneratorConfig.spriteName = spriteName;
	GeneratorConfig.connectorRatio = GeneratorConfig.connectorDistanceFromCornerRatio = 33;
	GeneratorConfig.piecesPerSideHorizontal = Math.sqrt(puzzleConfig.selectedNumPieces);
	GeneratorConfig.piecesPerSideVertical = Math.sqrt(puzzleConfig.selectedNumPieces);
	GeneratorConfig.selectedNumberOfPieces = puzzleConfig.selectedNumPieces;
	console.log("loaded image", loadedImage.naturalWidth)
	GeneratorConfig.pieceSize = loadedImage.naturalWidth / GeneratorConfig.piecesPerSideHorizontal;
	GeneratorConfig.connectorDistanceFromCorner = Math.ceil(GeneratorConfig.pieceSize / 100 * GeneratorConfig.connectorDistanceFromCornerRatio);
	GeneratorConfig.connectorSize = GeneratorConfig.pieceSize / 100 * GeneratorConfig.connectorRatio;
	GeneratorConfig.largestPieceSpan = GeneratorConfig.pieceSize + (GeneratorConfig.connectorSize * 2);

	console.log("GeneratorConfig", GeneratorConfig)
	
	return await generateDataForPuzzlePieces(GeneratorConfig.piecesPerSideHorizontal, GeneratorConfig.piecesPerSideVertical);
}

const createPuzzlePiece = async (data, ctxForSprite, writeToOwnFile = false) => {
	const tmpCnv = createCanvas(data.imgW, data.imgH);
	tmpCnv.width = data.imgW;
	tmpCnv.height = data.imgH;
	const tmpCtx = tmpCnv.getContext("2d");
	tmpCtx.imageSmoothingEnabled = false;
	tmpCtx.strokeStyle = '#000';

	let path = new Path2D();
	
	const pathResult = drawJigsawShape(tmpCtx, path, data, { x: 0, y: 0 }, false, true);
	tmpCtx.clip(pathResult);
	tmpCtx.drawImage(loadedImage, data.imgX, data.imgY, data.imgW, data.imgH, 0, 0, tmpCnv.width, tmpCnv.height);
	
	const tmpImgData = tmpCtx.getImageData(0, 0, tmpCnv.width, tmpCnv.height);
	ctxForSprite.putImageData(tmpImgData, data.pageX, data.pageY)
	
	if(writeToOwnFile){
		// console.log(`writing puzzle piece to file ${data.id}`)
		writeToPngFile(tmpCnv, `${data.id}`);
	}
}

const writeToPngFile = (cnv, fileName) => {
	const out = fs.createWriteStream(`${fileName}.png`);
	const stream = cnv.createPNGStream();
	stream.pipe(out);
	out.on('finish', () => {
		// console.log(`PNG file ${fileName}.png was created.`)
	})
	out.on('error', (e) => {
		console.error(e)
	})
}

const getPieceWidthAndHeightWithConnectors = (piece) => {
	let actualWidth = GeneratorConfig.pieceSize;
	let actualHeight = GeneratorConfig.pieceSize;

	if(pieceHelper.has(piece.type, 'plug', 'left')){
		actualWidth += GeneratorConfig.connectorSize; 
	}
	if(pieceHelper.has(piece.type, 'plug', 'right')){
		actualWidth += GeneratorConfig.connectorSize; 
	}

	if(pieceHelper.has(piece.type, 'plug', 'top')){
		actualHeight += GeneratorConfig.connectorSize;
	}
	if(pieceHelper.has(piece.type, 'plug', 'bottom')){
		actualHeight += GeneratorConfig.connectorSize;
	}

	return {
		width: actualWidth,
		height: actualHeight,
	}
}

const getConnectors = (adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow) => {
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

const assignInitialPieceData = (imgX, imgY, piece, numPiecesFromLeftEdge, numPiecesFromTopEdge, i) => {
	const { width, height } = getPieceWidthAndHeightWithConnectors(piece);
	
	const piecePositionOnSprite = {
		x: GeneratorConfig.largestPieceSpan * 1.1 * numPiecesFromLeftEdge,
		y: GeneratorConfig.largestPieceSpan * 1.1 * numPiecesFromTopEdge
	};

	return Object.assign({
		id: i,
		imgX: imgX,
		imgY: imgY,
		pageX: piecePositionOnSprite.x,
		pageY: piecePositionOnSprite.y,
		imgW: width,
		imgH: height,
		solvedX: imgX,
		solvedY: imgY,
		isInnerPiece: piece.type.join(",").indexOf("0") === -1,
		isVisible: true,
		connections: [],
		numPiecesFromLeftEdge,
		numPiecesFromTopEdge,
	}, piece);
}

const getRandomPositionOutsideBoardArea = (sector) => {
	const randSectorBoundingBox = this.getSectorBoundingBox(sector);
	
	return {
		left: this.getRandomInt(randSectorBoundingBox.left, randSectorBoundingBox.right - this.largestPieceSpan),
		top: this.getRandomInt(randSectorBoundingBox.top, randSectorBoundingBox.bottom - this.largestPieceSpan),
	}
}

const generateDataForPuzzlePieces = async(piecesPerSideHorizontal, piecesPerSideVertical = null) => {
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

	const cnvWidth = cnvHeight = GeneratorConfig.largestPieceSpan * 1.1 * piecesPerSideHorizontal;
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

		currentPiece.type = getConnectors(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow);
		currentPiece = assignInitialPieceData(curImgX, curImgY, currentPiece, numPiecesFromLeftEdge, numPiecesFromTopEdge, i);
		// console.log("generated piece", currentPiece)

		pieces.push(currentPiece);
		createPuzzlePiece(currentPiece, ctx);

		// reached last piece, start next row
		if(pieces.length % piecesPerSideHorizontal === 0){
			curImgX = 0;

			const firstPieceOnRowAbove = pieces[pieces.length - piecesPerSideHorizontal];

			curImgY = firstPieceOnRowAbove.imgY + firstPieceOnRowAbove.imgH - GeneratorConfig.connectorSize;

			numPiecesFromLeftEdge = 0;
			numPiecesFromTopEdge++;

			rowCount++;
		} else {
			if(rowCount > 1){
				const nextPieceAbove = pieces[pieces.length - piecesPerSideHorizontal];

				if(pieceHelper.has(currentPiece.type, "plug", "top") && pieceHelper.has(nextPieceAbove.type, "plug", "bottom")){
					curImgY += GeneratorConfig.connectorSize;
				} else if(pieceHelper.has(currentPiece.type, "socket", "top") && pieceHelper.has(nextPieceAbove.type, "socket", "bottom")){
					curImgY -= GeneratorConfig.connectorSize;
				}
			}
			
			if(pieceHelper.has(currentPiece.type, "socket", "right")){
				curImgX += currentPiece.imgW - GeneratorConfig.connectorSize;
			} else if(pieceHelper.has(currentPiece.type, "plug", "right")){
				curImgX += currentPiece.imgW - GeneratorConfig.connectorSize;
			}

			numPiecesFromLeftEdge ++;
		}
		
		i++;

		if(i >= GeneratorConfig.selectedNumberOfPieces) {
			done = true;
		}
	}

	writeToPngFile(cnv, GeneratorConfig.spriteName);

	return pieces;
}

const drawJigsawShape = (ctx, path, piece, {x, y}, showGuides = false, stroke = false) => {
	// console.log('drawJigsawShape', piece)

	const strokeWidth = GeneratorConfig.strokeWidth;

	const hasTopPlug = pieceHelper.has(piece.type, 'plug', 'top')
	const hasLeftPlug = pieceHelper.has(piece.type, 'plug', 'left')
	
	const topBoundary = hasTopPlug ? y + GeneratorConfig.connectorSize : y;
	const bottomBoundary = hasTopPlug ? y + GeneratorConfig.pieceSize + GeneratorConfig.connectorSize : y + GeneratorConfig.pieceSize;
	const leftBoundary = hasLeftPlug ? x + GeneratorConfig.connectorSize : x;
	const rightBoundary = hasLeftPlug ? x + GeneratorConfig.pieceSize + GeneratorConfig.connectorSize : x + GeneratorConfig.pieceSize;

	let topConnector = null, rightConnector = null, bottomConnector = null, leftConnector = null;
	
	const jigsawShapes = new jigsawPath(GeneratorConfig.pieceSize, GeneratorConfig.connectorSize, GeneratorConfig.connectorDistanceFromCorner);
	
	path.moveTo(leftBoundary + strokeWidth, topBoundary + strokeWidth);

	if(pieceHelper.has(piece.type, 'plug', 'top')){
		topConnector = jigsawShapes.getTopPlug(leftBoundary, topBoundary, rightBoundary, strokeWidth);
	} else if(pieceHelper.has(piece.type, 'socket', 'top')){
		topConnector = jigsawShapes.getTopSocket(leftBoundary, topBoundary, rightBoundary);
	}

	if(topConnector){
		path.lineTo(leftBoundary + GeneratorConfig.connectorDistanceFromCorner, topBoundary + strokeWidth);
		path.quadraticCurveTo(topConnector.firstCurve.cpX, topConnector.firstCurve.cpY, topConnector.firstCurve.destX, topConnector.firstCurve.destY);
		path.bezierCurveTo(topConnector.secondCurve.cp1.x, topConnector.secondCurve.cp1.y, topConnector.secondCurve.cp2.x, topConnector.secondCurve.cp2.y, topConnector.secondCurve.destX, topConnector.secondCurve.destY)
		path.bezierCurveTo(topConnector.thirdCurve.cp1.x, topConnector.thirdCurve.cp1.y, topConnector.thirdCurve.cp2.x, topConnector.thirdCurve.cp2.y, topConnector.thirdCurve.destX, topConnector.thirdCurve.destY)
		path.quadraticCurveTo(topConnector.fourthCurve.cpX, topConnector.fourthCurve.cpY, topConnector.fourthCurve.destX, topConnector.fourthCurve.destY);
	}
	path.lineTo(rightBoundary - strokeWidth, topBoundary + strokeWidth);

	if(pieceHelper.has(piece.type, 'plug', 'right')){
		rightConnector = jigsawShapes.getRightPlug(topBoundary, rightBoundary, bottomBoundary, strokeWidth);	
	} else if(pieceHelper.has(piece.type, 'socket', 'right')){
		rightConnector = jigsawShapes.getRightSocket(topBoundary, rightBoundary, bottomBoundary);
	}

	if(rightConnector !== null){
		path.lineTo(rightBoundary - strokeWidth, topBoundary + GeneratorConfig.connectorDistanceFromCorner);
		path.quadraticCurveTo(rightConnector.firstCurve.cpX, rightConnector.firstCurve.cpY, rightConnector.firstCurve.destX, rightConnector.firstCurve.destY);
		path.bezierCurveTo(rightConnector.secondCurve.cp1.x, rightConnector.secondCurve.cp1.y, rightConnector.secondCurve.cp2.x, rightConnector.secondCurve.cp2.y, rightConnector.secondCurve.destX, rightConnector.secondCurve.destY)
		path.bezierCurveTo(rightConnector.thirdCurve.cp1.x, rightConnector.thirdCurve.cp1.y, rightConnector.thirdCurve.cp2.x, rightConnector.thirdCurve.cp2.y, rightConnector.thirdCurve.destX, rightConnector.thirdCurve.destY);
		path.quadraticCurveTo(rightConnector.fourthCurve.cpX, rightConnector.fourthCurve.cpY, rightConnector.fourthCurve.destX, rightConnector.fourthCurve.destY);
	}
	path.lineTo(rightBoundary - strokeWidth, topBoundary + GeneratorConfig.pieceSize)

	if(pieceHelper.has(piece.type, 'plug', 'bottom')){
		bottomConnector = jigsawShapes.getBottomPlug(leftBoundary + GeneratorConfig.pieceSize, topBoundary + GeneratorConfig.pieceSize, leftBoundary, strokeWidth);
	} else if(pieceHelper.has(piece.type, 'socket', 'bottom')){
		bottomConnector = jigsawShapes.getBottomSocket(leftBoundary + GeneratorConfig.pieceSize, topBoundary + GeneratorConfig.pieceSize, leftBoundary);
	}

	if(bottomConnector){
		path.lineTo(leftBoundary + GeneratorConfig.pieceSize - GeneratorConfig.connectorDistanceFromCorner, topBoundary + GeneratorConfig.pieceSize);
		path.quadraticCurveTo(bottomConnector.firstCurve.cpX, bottomConnector.firstCurve.cpY, bottomConnector.firstCurve.destX, bottomConnector.firstCurve.destY);
		path.bezierCurveTo(bottomConnector.secondCurve.cp1.x, bottomConnector.secondCurve.cp1.y, bottomConnector.secondCurve.cp2.x, bottomConnector.secondCurve.cp2.y, bottomConnector.secondCurve.destX, bottomConnector.secondCurve.destY)
		path.bezierCurveTo(bottomConnector.thirdCurve.cp1.x, bottomConnector.thirdCurve.cp1.y, bottomConnector.thirdCurve.cp2.x, bottomConnector.thirdCurve.cp2.y, bottomConnector.thirdCurve.destX, bottomConnector.thirdCurve.destY);
		path.quadraticCurveTo(bottomConnector.fourthCurve.cpX, bottomConnector.fourthCurve.cpY, bottomConnector.fourthCurve.destX, bottomConnector.fourthCurve.destY);
	}
	path.lineTo(leftBoundary, topBoundary + GeneratorConfig.pieceSize)

	if(pieceHelper.has(piece.type, 'plug', 'left')){
		leftConnector = jigsawShapes.getLeftPlug(topBoundary + GeneratorConfig.pieceSize, leftBoundary, topBoundary, strokeWidth);
	} else if(pieceHelper.has(piece.type, 'socket', 'left')){
		leftConnector = jigsawShapes.getLeftSocket(topBoundary + GeneratorConfig.pieceSize, leftBoundary, topBoundary);
	}
	if(leftConnector !== null){
		path.lineTo(leftBoundary, topBoundary + GeneratorConfig.pieceSize - GeneratorConfig.connectorDistanceFromCorner);
		path.quadraticCurveTo(leftConnector.firstCurve.cpX, leftConnector.firstCurve.cpY, leftConnector.firstCurve.destX, leftConnector.firstCurve.destY);
		path.bezierCurveTo(leftConnector.secondCurve.cp1.x, leftConnector.secondCurve.cp1.y, leftConnector.secondCurve.cp2.x, leftConnector.secondCurve.cp2.y, leftConnector.secondCurve.destX, leftConnector.secondCurve.destY)
		path.bezierCurveTo(leftConnector.thirdCurve.cp1.x, leftConnector.thirdCurve.cp1.y, leftConnector.thirdCurve.cp2.x, leftConnector.thirdCurve.cp2.y, leftConnector.thirdCurve.destX, leftConnector.thirdCurve.destY);
		path.quadraticCurveTo(leftConnector.fourthCurve.cpX, leftConnector.fourthCurve.cpY, leftConnector.fourthCurve.destX, leftConnector.fourthCurve.destY);
	}
	path.lineTo(leftBoundary, topBoundary);

	if(showGuides){
		if(topConnector) GeneratorConfig.drawPlugGuides(ctx, topConnector)
		if(rightConnector) GeneratorConfig.drawPlugGuides(ctx, rightConnector)
		if(bottomConnector) GeneratorConfig.drawPlugGuides(ctx, bottomConnector)
		if(leftConnector) GeneratorConfig.drawPlugGuides(ctx, leftConnector)
	}

	if(stroke){
		ctx.strokeStyle = "#fff";
		ctx.stroke(path)
	}

	return path;
}

exports.default = generatePuzzle;
