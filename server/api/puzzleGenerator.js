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
	connectorLateralControlPointDistance: null,
	largestPieceSpan: null,
	strokeWidth: 1,
	shadowOffsetRatio: 5,
	shadowColor: "black",
	strokeStyle: "#000"
}

const generatePuzzle = async (imagePath, puzzleConfig, spriteName, shadowSpriteName) => {
	loadedImage = await loadImage(imagePath);

	const connectorWitdhRatio = 30;
	
	GeneratorConfig.spriteName = spriteName;
	GeneratorConfig.shadowSpriteName = shadowSpriteName;
	GeneratorConfig.connectorWidthRatio = connectorWitdhRatio;
	GeneratorConfig.connectorRatio = GeneratorConfig.connectorDistanceFromCornerRatio = 50 - (connectorWitdhRatio/2);
	GeneratorConfig.piecesPerSideHorizontal = Math.sqrt(puzzleConfig.selectedNumPieces);
	GeneratorConfig.piecesPerSideVertical = Math.sqrt(puzzleConfig.selectedNumPieces);
	GeneratorConfig.selectedNumberOfPieces = puzzleConfig.selectedNumPieces;
	GeneratorConfig.pieceSize = loadedImage.naturalWidth / GeneratorConfig.piecesPerSideHorizontal;
	GeneratorConfig.connectorDistanceFromCorner = GeneratorConfig.pieceSize / 100 * GeneratorConfig.connectorDistanceFromCornerRatio;
	GeneratorConfig.connectorWidth = GeneratorConfig.pieceSize / 100 * GeneratorConfig.connectorWidthRatio;
	GeneratorConfig.connectorSize = GeneratorConfig.pieceSize / 100 * GeneratorConfig.connectorRatio;
	GeneratorConfig.connectorLateralControlPointDistance = GeneratorConfig.connectorSize * 1.2;
	GeneratorConfig.largestPieceSpan = GeneratorConfig.pieceSize + (GeneratorConfig.connectorSize * 2);
	GeneratorConfig.shadowOffset = GeneratorConfig.pieceSize / 100 * GeneratorConfig.shadowOffsetRatio;

	console.log("GeneratorConfig", GeneratorConfig)
	
	return await generateDataForPuzzlePieces(GeneratorConfig.piecesPerSideHorizontal, GeneratorConfig.piecesPerSideVertical);
}

const createPuzzlePiece = async (data, ctxForSprite, ctxForShadowSprite, writeToOwnFile = false) => {
	const shadowCnv = createCanvas(data.imgW, data.imgH);
	const shdCtx = shadowCnv.getContext("2d");
	shadowCnv.width = data.imgW;
	shadowCnv.height = data.imgH;

	let shdPath = new Path2D();
	const pathResult = drawJigsawShape(shdCtx, shdPath, data, { x: 0, y: 0 });
	shdCtx.fill(pathResult, GeneratorConfig.shadowColor);

	const shadowImgData = shdCtx.getImageData(0, 0, data.imgW, data.imgH);
	ctxForShadowSprite.putImageData(shadowImgData, data.pageX, data.pageY);

	const tmpCnv = createCanvas(data.imgW, data.imgH);
	const tmpCtx = tmpCnv.getContext("2d");
	tmpCtx.imageSmoothingEnabled = false;
	tmpCtx.strokeStyle = GeneratorConfig.strokeStyle;
	tmpCtx.lineWidth = GeneratorConfig.strokeWidth;
	tmpCnv.width = data.imgW;
	tmpCnv.height = data.imgH;
	
	tmpCtx.clip(pathResult);
	tmpCtx.drawImage(loadedImage, data.imgX, data.imgY, data.imgW, data.imgH, 0, 0, data.imgW, data.imgH);
	tmpCtx.stroke(pathResult);

	const img = await loadImage(tmpCnv.toDataURL());
	ctxForSprite.drawImage(img, data.pageX, data.pageY);

	if(writeToOwnFile){
		writeToPngFile(tmpCnv, `${data.id}`);
	}
}

const writeToPngFile = async (cnv, fileName) => {
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

	const { strokeWidth, shadowOffset, shadowBlur } = GeneratorConfig;

	return Object.assign({
		id: i,
		imgX: imgX,
		imgY: imgY,
		pageX: piecePositionOnSprite.x,
		pageY: piecePositionOnSprite.y,
		imgW: width,
		imgH: height,
		pieceWidth: width + shadowOffset + strokeWidth,
		pieceHeight: height + shadowOffset + strokeWidth,
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

	const shdCnv = createCanvas(cnvWidth, cnvHeight);
	const shdCtx = shdCnv.getContext("2d")

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

		createPuzzlePiece(currentPiece, ctx, shdCtx, true);

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
	writeToPngFile(shdCnv, GeneratorConfig.shadowSpriteName);

	return pieces;
}

const drawJigsawShape = (ctx, path, piece, {x, y}, showGuides = false, stroke = false) => {
	// console.log('drawJigsawShape', piece)

	const strokeWidth = GeneratorConfig.strokeWidth;

	const hasTopPlug = pieceHelper.has(piece.type, 'plug', 'top')
	const hasLeftPlug = pieceHelper.has(piece.type, 'plug', 'left')
	
	let topBoundary = hasTopPlug ? y + GeneratorConfig.connectorSize : y;
	let bottomBoundary = hasTopPlug ? y + GeneratorConfig.pieceSize + GeneratorConfig.connectorSize : y + GeneratorConfig.pieceSize;
	let leftBoundary = hasLeftPlug ? x + GeneratorConfig.connectorSize : x;
	let rightBoundary = hasLeftPlug ? x + GeneratorConfig.pieceSize + GeneratorConfig.connectorSize : x + GeneratorConfig.pieceSize;

	// topBoundary += strokeWidth;
	// rightBoundary += strokeWidth;
	// bottomBoundary += strokeWidth;
	// leftBoundary += strokeWidth;

	let topConnector = null, rightConnector = null, bottomConnector = null, leftConnector = null;
	
	const jigsawShapes = new jigsawPath(GeneratorConfig.pieceSize, GeneratorConfig.connectorSize, GeneratorConfig.connectorWidth);
	
	path.moveTo(leftBoundary, topBoundary);

	let pos = {
		x: leftBoundary + GeneratorConfig.connectorDistanceFromCorner,
		y: topBoundary
	};
	if(pieceHelper.has(piece.type, 'plug', 'top')){
		topConnector = jigsawShapes.getPlug("top", pos);
	} else if(pieceHelper.has(piece.type, 'socket', 'top')){
		topConnector = jigsawShapes.getSocket("top", pos);
	}

	if(topConnector){
		path.lineTo(leftBoundary + GeneratorConfig.connectorDistanceFromCorner, topBoundary);
		// path.quadraticCurveTo(topConnector.firstCurve.cpX, topConnector.firstCurve.cpY, topConnector.firstCurve.destX, topConnector.firstCurve.destY);
		// path.bezierCurveTo(topConnector.secondCurve.cp1.x, topConnector.secondCurve.cp1.y, topConnector.secondCurve.cp2.x, topConnector.secondCurve.cp2.y, topConnector.secondCurve.destX, topConnector.secondCurve.destY)
		// path.bezierCurveTo(topConnector.thirdCurve.cp1.x, topConnector.thirdCurve.cp1.y, topConnector.thirdCurve.cp2.x, topConnector.thirdCurve.cp2.y, topConnector.thirdCurve.destX, topConnector.thirdCurve.destY)
		// path.quadraticCurveTo(topConnector.fourthCurve.cpX, topConnector.fourthCurve.cpY, topConnector.fourthCurve.destX, topConnector.fourthCurve.destY);
		path.bezierCurveTo(topConnector.cp1.x, topConnector.cp1.y, topConnector.cp2.x, topConnector.cp2.y, topConnector.destX, topConnector.destY)
	}
	path.lineTo(rightBoundary, topBoundary);

	pos = {
		x: rightBoundary,
		y: topBoundary + GeneratorConfig.connectorDistanceFromCorner
	};
	if(pieceHelper.has(piece.type, 'plug', 'right')){
		rightConnector = jigsawShapes.getPlug("right", pos);
	} else if(pieceHelper.has(piece.type, 'socket', 'right')){
		rightConnector = jigsawShapes.getSocket("right", pos);
	}

	if(rightConnector !== null){
		path.lineTo(rightBoundary, topBoundary + GeneratorConfig.connectorDistanceFromCorner);
		// path.quadraticCurveTo(rightConnector.firstCurve.cpX, rightConnector.firstCurve.cpY, rightConnector.firstCurve.destX, rightConnector.firstCurve.destY);
		// path.bezierCurveTo(rightConnector.secondCurve.cp1.x, rightConnector.secondCurve.cp1.y, rightConnector.secondCurve.cp2.x, rightConnector.secondCurve.cp2.y, rightConnector.secondCurve.destX, rightConnector.secondCurve.destY)
		// path.bezierCurveTo(rightConnector.thirdCurve.cp1.x, rightConnector.thirdCurve.cp1.y, rightConnector.thirdCurve.cp2.x, rightConnector.thirdCurve.cp2.y, rightConnector.thirdCurve.destX, rightConnector.thirdCurve.destY);
		// path.quadraticCurveTo(rightConnector.fourthCurve.cpX, rightConnector.fourthCurve.cpY, rightConnector.fourthCurve.destX, rightConnector.fourthCurve.destY);
		path.bezierCurveTo(rightConnector.cp1.x, rightConnector.cp1.y, rightConnector.cp2.x, rightConnector.cp2.y, rightConnector.destX, rightConnector.destY)
	}
	path.lineTo(rightBoundary, bottomBoundary)

	pos = {
		x: rightBoundary - GeneratorConfig.connectorDistanceFromCorner,
		y: bottomBoundary
	}
	if(pieceHelper.has(piece.type, 'plug', 'bottom')){
		bottomConnector = jigsawShapes.getPlug("bottom", pos);
	} else if(pieceHelper.has(piece.type, 'socket', 'bottom')){
		bottomConnector = jigsawShapes.getSocket("bottom", pos);
	}

	if(bottomConnector){
		path.lineTo(rightBoundary - GeneratorConfig.connectorDistanceFromCorner, bottomBoundary);
		// path.quadraticCurveTo(bottomConnector.firstCurve.cpX, bottomConnector.firstCurve.cpY, bottomConnector.firstCurve.destX, bottomConnector.firstCurve.destY);
		// path.bezierCurveTo(bottomConnector.secondCurve.cp1.x, bottomConnector.secondCurve.cp1.y, bottomConnector.secondCurve.cp2.x, bottomConnector.secondCurve.cp2.y, bottomConnector.secondCurve.destX, bottomConnector.secondCurve.destY)
		// path.bezierCurveTo(bottomConnector.thirdCurve.cp1.x, bottomConnector.thirdCurve.cp1.y, bottomConnector.thirdCurve.cp2.x, bottomConnector.thirdCurve.cp2.y, bottomConnector.thirdCurve.destX, bottomConnector.thirdCurve.destY);
		// path.quadraticCurveTo(bottomConnector.fourthCurve.cpX, bottomConnector.fourthCurve.cpY, bottomConnector.fourthCurve.destX, bottomConnector.fourthCurve.destY);
		path.bezierCurveTo(bottomConnector.cp1.x, bottomConnector.cp1.y, bottomConnector.cp2.x, bottomConnector.cp2.y, bottomConnector.destX, bottomConnector.destY)
	}
	path.lineTo(leftBoundary, bottomBoundary)

	pos = {
		x: leftBoundary,
		y: bottomBoundary - GeneratorConfig.connectorDistanceFromCorner
	}
	if(pieceHelper.has(piece.type, 'plug', 'left')){
		leftConnector = jigsawShapes.getPlug("left", pos);
	} else if(pieceHelper.has(piece.type, 'socket', 'left')){
		leftConnector = jigsawShapes.getSocket("left", pos);
	}
	if(leftConnector !== null){
		path.lineTo(leftBoundary, bottomBoundary - GeneratorConfig.connectorDistanceFromCorner);
		// path.quadraticCurveTo(leftConnector.firstCurve.cpX, leftConnector.firstCurve.cpY, leftConnector.firstCurve.destX, leftConnector.firstCurve.destY);
		// path.bezierCurveTo(leftConnector.secondCurve.cp1.x, leftConnector.secondCurve.cp1.y, leftConnector.secondCurve.cp2.x, leftConnector.secondCurve.cp2.y, leftConnector.secondCurve.destX, leftConnector.secondCurve.destY)
		// path.bezierCurveTo(leftConnector.thirdCurve.cp1.x, leftConnector.thirdCurve.cp1.y, leftConnector.thirdCurve.cp2.x, leftConnector.thirdCurve.cp2.y, leftConnector.thirdCurve.destX, leftConnector.thirdCurve.destY);
		// path.quadraticCurveTo(leftConnector.fourthCurve.cpX, leftConnector.fourthCurve.cpY, leftConnector.fourthCurve.destX, leftConnector.fourthCurve.destY);
		path.bezierCurveTo(leftConnector.cp1.x, leftConnector.cp1.y, leftConnector.cp2.x, leftConnector.cp2.y, leftConnector.destX, leftConnector.destY)
	}
	path.lineTo(leftBoundary, topBoundary);

	if(showGuides){
		if(topConnector) jigsawShapes.drawPlugGuides(ctx, topConnector)
		if(rightConnector) jigsawShapes.drawPlugGuides(ctx, rightConnector)
		if(bottomConnector) jigsawShapes.drawPlugGuides(ctx, bottomConnector)
		if(leftConnector) jigsawShapes.drawPlugGuides(ctx, leftConnector)
	}

	if(stroke){
		ctx.strokeStyle = GeneratorConfig.strokeStyle;
		ctx.stroke(path)
	}

	return path;
}

exports.default = generatePuzzle;
