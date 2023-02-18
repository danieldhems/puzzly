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
	shadowColor: "grey",
	strokeStyle: "#000"
}

const PuzzleGenerator = async function(imagePath, puzzleConfig, spriteName, shadowSpriteName) {
	loadedImage = await loadImage(imagePath);

	const connectorWidthRatio = 30;
	
	GeneratorConfig.debugOptions = puzzleConfig.debugOptions;
	GeneratorConfig.spriteName = spriteName;
	GeneratorConfig.shadowSpriteName = shadowSpriteName;
	GeneratorConfig.connectorWidthRatio = connectorWidthRatio;
	GeneratorConfig.connectorRatio = GeneratorConfig.connectorDistanceFromCornerRatio = 50 - (connectorWidthRatio/2);
	GeneratorConfig.piecesPerSideHorizontal = Math.sqrt(puzzleConfig.selectedNumPieces);
	GeneratorConfig.piecesPerSideVertical = Math.sqrt(puzzleConfig.selectedNumPieces);
	GeneratorConfig.selectedNumberOfPieces = puzzleConfig.selectedNumPieces;

	GeneratorConfig.pieceSize = Math.floor(puzzleConfig.boardSize / GeneratorConfig.piecesPerSideHorizontal);

	GeneratorConfig.stageWidth = puzzleConfig.stageWidth;
	GeneratorConfig.stageHeight = puzzleConfig.stageHeight;

	GeneratorConfig.connectorDistanceFromCorner = GeneratorConfig.pieceSize / 100 * GeneratorConfig.connectorDistanceFromCornerRatio;
	GeneratorConfig.connectorWidth = GeneratorConfig.pieceSize / 100 * GeneratorConfig.connectorWidthRatio;
	GeneratorConfig.connectorSize = Math.floor(GeneratorConfig.pieceSize / 100 * GeneratorConfig.connectorRatio);
	GeneratorConfig.connectorLateralControlPointDistance = GeneratorConfig.connectorSize * 1.2;
	GeneratorConfig.largestPieceSpan = GeneratorConfig.pieceSize + (GeneratorConfig.connectorSize * 2);

	console.log("GeneratorConfig", GeneratorConfig)
	
	return {
		...GeneratorConfig,
		generateDataForPuzzlePieces
	}
}

const createPuzzlePiece = async (data, ctxForSprite, ctxForShadowSprite, writeToOwnFile = false) => {
	const shadowCnv = createCanvas(data.imgW, data.imgH);
	const shdCtx = shadowCnv.getContext("2d");
	shadowCnv.width = data.imgW;
	shadowCnv.height = data.imgH;

	let shdPath = new Path2D();
	const { path } = drawJigsawShape(shdCtx, shdPath, data);
	shdCtx.fill(path, GeneratorConfig.shadowColor);

	const shadowImgData = shdCtx.getImageData(0, 0, data.imgW, data.imgH);
	ctxForShadowSprite.putImageData(shadowImgData, data.spriteX, data.spriteY);

	const tmpCnv = createCanvas(data.imgW, data.imgH);
	const tmpCtx = tmpCnv.getContext("2d");
	tmpCtx.imageSmoothingEnabled = false;
	tmpCtx.strokeStyle = GeneratorConfig.strokeStyle;
	tmpCtx.lineWidth = GeneratorConfig.strokeWidth;
	tmpCnv.width = data.imgW;
	tmpCnv.height = data.imgH;
	
	tmpCtx.clip(path);
	tmpCtx.drawImage(loadedImage, data.imgX, data.imgY, data.imgW, data.imgH, 0, 0, data.imgW, data.imgH);
	tmpCtx.stroke(path);

	const img = await loadImage(tmpCnv.toDataURL());
	ctxForSprite.drawImage(img, data.spriteX, data.spriteY);

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
}

const assignInitialPieceData = (puzzleId, imgX, imgY, piece, numPiecesFromLeftEdge, numPiecesFromTopEdge, i) => {
	let { width, height } = getPieceWidthAndHeightWithConnectors(piece);

	width = Math.floor(width);
	height = Math.floor(height);
	
	const piecePositionOnSprite = {
		x: Math.floor(GeneratorConfig.largestPieceSpan * 1.1 * numPiecesFromLeftEdge),
		y: Math.floor(GeneratorConfig.largestPieceSpan * 1.1 * numPiecesFromTopEdge)
	};

	const rightLimit = GeneratorConfig.stageWidth - GeneratorConfig.largestPieceSpan - (GeneratorConfig.stageWidth / 100);
	const bottomLimit = GeneratorConfig.stageHeight - GeneratorConfig.largestPieceSpan - (GeneratorConfig.stageHeight / 100);

	// fish
	const randPos = {
		x: getRandomInt(1, rightLimit),
		y: getRandomInt(1, bottomLimit),
	}

	const { strokeWidth } = GeneratorConfig;

	return Object.assign({
		id: i,
		puzzleId,
		imgX: imgX,
		imgY: imgY,
		spriteX: piecePositionOnSprite.x,
		spriteY: piecePositionOnSprite.y,
		pageX: GeneratorConfig.debugOptions.noDispersal ? piecePositionOnSprite.x : randPos.x,
		pageY: GeneratorConfig.debugOptions.noDispersal ? piecePositionOnSprite.y : randPos.y,
		imgW: width,
		imgH: height,
		pieceWidth: width + strokeWidth,
		pieceHeight: height + strokeWidth,
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

const generateDataForPuzzlePieces = async(puzzleId) => {
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

	const cnvWidth = cnvHeight = GeneratorConfig.largestPieceSpan * 1.1 * GeneratorConfig.piecesPerSideHorizontal;
	const cnv = createCanvas(cnvWidth, cnvHeight);
	const ctx = cnv.getContext("2d");
	ctx.webkitImageSmoothingEnabled = true;
	
	const shdCnv = createCanvas(cnvWidth, cnvHeight);
	const shdCtx = shdCnv.getContext("2d")
	shdCtx.webkitImageSmoothingEnabled = true;

	while(!done){
		let currentPiece = {};
		// All pieces not on top row
		if(pieces.length >= GeneratorConfig.piecesPerSideHorizontal){
			adjacentPieceAbove = pieces[pieces.length - GeneratorConfig.piecesPerSideHorizontal];
		}

		// Last piece in row, next piece should be a corner or right side
		if(pieces.length > 1 && pieces.length % (GeneratorConfig.piecesPerSideHorizontal - 1) === 0){
			endOfRow = true;
		} else {
			endOfRow = false;
		}

		if(rowCount === GeneratorConfig.piecesPerSideVertical){
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
		const { svgString } = drawJigsawShape(null, null, currentPiece);
		currentPiece.svgPathString = svgString;
		currentPiece = assignInitialPieceData(puzzleId, curImgX, curImgY, currentPiece, numPiecesFromLeftEdge, numPiecesFromTopEdge, i);
		// console.log("generated piece", currentPiece)

		pieces.push(currentPiece);

		createPuzzlePiece(currentPiece, ctx, shdCtx);

		// reached last piece, start next row
		if(pieces.length % GeneratorConfig.piecesPerSideHorizontal === 0){
			curImgX = 0;

			const firstPieceOnRowAbove = pieces[pieces.length - GeneratorConfig.piecesPerSideHorizontal];

			curImgY = firstPieceOnRowAbove.imgY + firstPieceOnRowAbove.imgH - GeneratorConfig.connectorSize;

			numPiecesFromLeftEdge = 0;
			numPiecesFromTopEdge++;

			rowCount++;
		} else {
			if(rowCount > 1){
				const nextPieceAbove = pieces[pieces.length - GeneratorConfig.piecesPerSideHorizontal];

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

const drawJigsawShape = (ctx, path, piece, showGuides = false, stroke = false) => {
	let svgString = "";

	let x = 0;
	let y = 0;

	const hasTopPlug = pieceHelper.has(piece.type, 'plug', 'top')
	const hasLeftPlug = pieceHelper.has(piece.type, 'plug', 'left')
	
	let topBoundary = hasTopPlug ? y + GeneratorConfig.connectorSize : y;
	let bottomBoundary = hasTopPlug ? y + GeneratorConfig.pieceSize + GeneratorConfig.connectorSize : y + GeneratorConfig.pieceSize;
	let leftBoundary = hasLeftPlug ? x + GeneratorConfig.connectorSize : x;
	let rightBoundary = hasLeftPlug ? x + GeneratorConfig.pieceSize + GeneratorConfig.connectorSize : x + GeneratorConfig.pieceSize;

	let topConnector = null, rightConnector = null, bottomConnector = null, leftConnector = null;
	
	const jigsawShapes = new jigsawPath(GeneratorConfig.pieceSize, GeneratorConfig.connectorSize, GeneratorConfig.connectorWidth);
	
	path && path.moveTo(leftBoundary, topBoundary);
	svgString += `M${leftBoundary} ${topBoundary} `;

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
		path && path.lineTo(leftBoundary + GeneratorConfig.connectorDistanceFromCorner, topBoundary);
		svgString += `H ${leftBoundary + GeneratorConfig.connectorDistanceFromCorner} `;

		path && path.bezierCurveTo(topConnector.cp1.x, topConnector.cp1.y, topConnector.cp2.x, topConnector.cp2.y, topConnector.destX, topConnector.destY);
		svgString += `C ${topConnector.cp1.x} ${topConnector.cp1.y}, ${topConnector.cp2.x} ${topConnector.cp2.y}, ${topConnector.destX} ${topConnector.destY} `;
	}
	path && path.lineTo(rightBoundary, topBoundary);
	svgString += `H ${rightBoundary} `;

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
		path && path.lineTo(rightBoundary, topBoundary + GeneratorConfig.connectorDistanceFromCorner);
		svgString += `V ${topBoundary + GeneratorConfig.connectorDistanceFromCorner} `;

		path && path.bezierCurveTo(rightConnector.cp1.x, rightConnector.cp1.y, rightConnector.cp2.x, rightConnector.cp2.y, rightConnector.destX, rightConnector.destY);
		svgString += `C ${rightConnector.cp1.x} ${rightConnector.cp1.y}, ${rightConnector.cp2.x} ${rightConnector.cp2.y}, ${rightConnector.destX} ${rightConnector.destY} `;
	}
	path && path.lineTo(rightBoundary, bottomBoundary);
	svgString += `V ${bottomBoundary} `;

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
		path && path.lineTo(rightBoundary - GeneratorConfig.connectorDistanceFromCorner, bottomBoundary);
		svgString += `H ${rightBoundary - GeneratorConfig.connectorDistanceFromCorner} `;

		path && path.bezierCurveTo(bottomConnector.cp1.x, bottomConnector.cp1.y, bottomConnector.cp2.x, bottomConnector.cp2.y, bottomConnector.destX, bottomConnector.destY);
		svgString += `C ${bottomConnector.cp1.x} ${bottomConnector.cp1.y}, ${bottomConnector.cp2.x} ${bottomConnector.cp2.y}, ${bottomConnector.destX} ${bottomConnector.destY} `;
	}
	path && path.lineTo(leftBoundary, bottomBoundary)
	svgString += `H ${leftBoundary} `;

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
		path && path.lineTo(leftBoundary, bottomBoundary - GeneratorConfig.connectorDistanceFromCorner);
		svgString += `V ${bottomBoundary - GeneratorConfig.connectorDistanceFromCorner} `;

		path && path.bezierCurveTo(leftConnector.cp1.x, leftConnector.cp1.y, leftConnector.cp2.x, leftConnector.cp2.y, leftConnector.destX, leftConnector.destY);
		svgString += `C ${leftConnector.cp1.x} ${leftConnector.cp1.y}, ${leftConnector.cp2.x} ${leftConnector.cp2.y}, ${leftConnector.destX} ${leftConnector.destY} `;
	}
	path && path.lineTo(leftBoundary, topBoundary);
	svgString += `V ${topBoundary} `;

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

	return { path, svgString };
}

exports.default = PuzzleGenerator;
