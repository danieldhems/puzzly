"use strict";

var gm = require('gm');
var path = require('path');
var SpriteMap = require('./sprite-map');

var sourceImgPath = path.join(__dirname, './halflife-3-2.jpg');
var spriteImgPath = path.join(__dirname, './jigsaw-sprite.png');
var newImg = path.join(__dirname, './pieces/new.png');

const config = {
	pieceSize: {
		'500': 35,
		'1000': 30,
		'2000': 20
	},
	jigsawSquareSize: 123,
	jigsawPlugSize: 41,
	boardBoundary: 200,
	numPiecesOnVerticalSides: 27,
	numPiecesOnHorizontalSides: 38,
	backgroundImages: [
		{
			name: 'wood',
			path: './bg-wood.jpg'
		}
	]
};

const pieces = [];

makePieces(30);

function makePieces(pieceSize){

	// prepare draw options
	var curImgX = 0;
	var curImgY = 0;

	let done = false;
	let i=0;

	let adjacentPieceBehind = null;
	let adjacentPieceAbove = null;
	let endOfRow = false;
	let lastPiece = null;
	let rowCount = 1;
	let finalRow = false;

	while(i<5){

		// console.log(pieces)
		// All pieces not on top row
		if(pieces.length > config.numPiecesOnHorizontalSides - 1){
			adjacentPieceAbove = pieces[pieces.length - config.numPiecesOnHorizontalSides];
		}

		// Last piece in row, next piece should be a corner or right side
		if(pieces.length > 1 && pieces.length % (config.numPiecesOnHorizontalSides - 1) === 0){
			endOfRow = true;
		} else {
			endOfRow = false;
		}

		if(rowCount === config.numPiecesOnVerticalSides-1){
			finalRow = true;
		}

		if(pieces.length > 0){
			adjacentPieceBehind = pieces[i-1];
		}

		// Get next piece
		let candidatePieces = getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow);
		let currentPiece = candidatePieces[ Math.floor(Math.random() * candidatePieces.length) ];
	
		// Get coords and size for next piece and produce composite image
		// console.log('args', curImgX, curImgY, currentPiece, 30)
		let imgDimensionsAndCoords = getSourceImageDimensionsAndCoordsForPiece(curImgX, curImgY, currentPiece, 30);
		// console.log(imgDimensionsAndCoords);
		// console.log(currentPiece);
		let pieceDims = getPieceDimensions(currentPiece, pieceSize);
		makeComposite(imgDimensionsAndCoords.x, imgDimensionsAndCoords.y, imgDimensionsAndCoords.w, imgDimensionsAndCoords.h, currentPiece.coords.x, currentPiece.coords.y, currentPiece.width, currentPiece.height);
	
		// assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, currentPiece, i);

		// reached last piece, start next row
		if(pieces.length % config.numPiecesOnHorizontalSides === 0){
			curImgX = 0;
			curImgY += pieceSize;
			rowCount++;
		} else {
			curImgX += pieceSize;
		}

		i++;

		if(currentPiece.type.indexOf('corner-br') > -1) done = true;
	}
}

let arr = [];
let gmstate = gm(arr);

function makeComposite(sourceImgX, sourceImgY, sourceImgW, sourceImgH, jigsawSpriteX, jigsawSpriteY, jigsawSpriteW, jigsawSpriteH){

	// console.log(sourceImgX, sourceImgY, sourceImgW, sourceImgH)
	// console.log( jigsawSpriteX, jigsawSpriteY, jigsawSpriteW, jigsawSpriteH)

	var tmpJigsawSpriteFilename = './tmp/tmp-piece-'+sourceImgX+'-'+sourceImgY+'.png';
	var tmpSourceFilename = './tmp/tmp-source-'+sourceImgX+'-'+sourceImgY+'.png';
	var composedPieceFilename = './pieces/piece-'+sourceImgX+'-'+sourceImgY+'.png';

	gm(spriteImgPath)
	.crop(jigsawSpriteW, jigsawSpriteH, jigsawSpriteX, jigsawSpriteY)
	.resize(sourceImgW, sourceImgH)
	.toBuffer( function(err, jigsawBuffer){
		if(err) console.log(err);
		console.log('jigsawBuffer:', jigsawBuffer);

		gm(sourceImgPath)
		.crop(sourceImgW, sourceImgH, sourceImgX, sourceImgY)
		.toBuffer( function(err, imageBuffer){
			if(err) console.log(err);
			console.log('imageBuffer:', imageBuffer);

			gm()
			.command('composite')
			.compose('atop')
			.in(imageBuffer)
			.in(jigsawBuffer)
			.write(composedPieceFilename, function(err){
				if(err){
					console.log(err)
				} else {
					gmstate.append()
					console.log('done');
				}
			});

		});
		
	});


}



// Draw puzzle piece
function getSourceImageDimensionsAndCoordsForPiece(sourceImgX, sourceImgY, piece, pieceSize){
	// console.log('getting', pieceSize)
	let plugSizeToScale = pieceSize / config.jigsawSquareSize * config.jigsawPlugSize;

	let iX = sourceImgX;
	let iY = sourceImgY;
	let iW = pieceSize;
	let iH = pieceSize;

	if(piece.connectors.plugs.indexOf('l') > -1){
		iX -= plugSizeToScale;
		iW += plugSizeToScale;
	}

	if(piece.connectors.plugs.indexOf('t') > -1){
		iY -= plugSizeToScale;
		iH += plugSizeToScale;
	}

	if(piece.connectors.plugs.indexOf('r') > -1){
		iW += plugSizeToScale;
	}

	if(piece.connectors.plugs.indexOf('b') > -1){
		iH += plugSizeToScale;
	}

	return {
		x: iX,
		y: iY,
		w: iW,
		h: iH
	}
}

function getPieceDimensions(piece, pieceSize){
	let scale = pieceSize / config.jigsawSquareSize;
	let dims = {
		w: null,
		h: null
	};
	if(piece.connectors.plugs.length === 1){
		if(piece.connectors.plugs === 'l' || piece.connectors.plugs === 'r' ){
			dims.w = pieceSize + (config.jigsawPlugSize * scale);
			dims.h = pieceSize;
		}
		if(piece.connectors.plugs === 't' || piece.connectors.plugs === 'b' ){
			dims.h = pieceSize + (config.jigsawPlugSize * scale);
			dims.w = pieceSize;
		}
	} else {
		dims.w = pieceSize;
		dims.h = pieceSize;
		if(piece.connectors.plugs.indexOf('l') > -1){
			dims.w += config.jigsawPlugSize * scale;
		}
		if(piece.connectors.plugs.indexOf('r') > -1){
			dims.w += config.jigsawPlugSize * scale;
		}
		if(piece.connectors.plugs.indexOf('t') > -1){
			dims.h += config.jigsawPlugSize * scale;
		}
		if(piece.connectors.plugs.indexOf('b') > -1){
			dims.h += config.jigsawPlugSize * scale;
		}
	}
	return dims;
}

function getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow){
	let candidatePieces = [];
	let pieces = null;

	// Top left corner piece
	if(!adjacentPieceBehind && !adjacentPieceAbove){
		return SpriteMap.filter((o) => o.type.indexOf('corner-tl') > -1 );
	}

	// First row pieces
	if(!adjacentPieceAbove){
		let pieceType = adjacentPieceBehind.type;

		// Does lastPiece have a plug on its right side?
		let lastPieceHasRightPlug = adjacentPieceBehind.connectors.plugs.indexOf('r') > -1;
		// Does lastPiece have a socket on its right side?
		let lastPieceHasRightSocket = adjacentPieceBehind.connectors.sockets.indexOf('r') > -1;
		let iterateeIsCorrectType;

		pieces = SpriteMap.filter( (o) => {
			if(endOfRow){
				return o.type.indexOf('corner-tr') > -1;
			} else {
				return o.type.indexOf('side-t') > -1;
			}
		});

		for(let i=0, l=pieces.length; i<l; i++){
			let iterateeHasLeftSocket = pieces[i].connectors.sockets.indexOf('l') > -1;
			let iterateeHasLeftPlug = pieces[i].connectors.plugs.indexOf('l') > -1;
			if(lastPieceHasRightPlug && iterateeHasLeftSocket){
				candidatePieces.push(pieces[i]);
			} else if(lastPieceHasRightSocket && iterateeHasLeftPlug){
				candidatePieces.push(pieces[i]);
			}
		}
	}
	// All piece after top row
	else {

		// Last piece of each row, should be right side
		if(adjacentPieceAbove.type.indexOf('corner-tr') > -1 || adjacentPieceAbove.type.indexOf('side-r') > -1){
			pieces = SpriteMap.filter( (o) => o.type.indexOf('side-r') > -1)
		}

		// Very last piece, should be corner bottom right
		if(adjacentPieceAbove.type.indexOf('side-r') > -1 && adjacentPieceBehind.type.indexOf('side-b') > -1){
			pieces = SpriteMap.filter( (o) => o.type.indexOf('corner-br') > -1)
		}

		// First piece of each row, should be left side
		if(!finalRow && (adjacentPieceBehind.type.indexOf('corner-tr') > -1 || adjacentPieceBehind.type.indexOf('side-r') > -1)){
			
			pieces = SpriteMap.filter( (o) => o.type.indexOf('side-l') > -1);

			let pieceAboveHasSocket = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
			let pieceAboveHasPlug = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;

			for(let i=0, l=pieces.length; i<l; i++){
				let iterateeHasTopSocket = pieces[i].connectors.sockets.indexOf('t') > -1;
				let iterateeHasTopPlug = pieces[i].connectors.plugs.indexOf('t') > -1;
				if(pieceAboveHasSocket && iterateeHasTopPlug){
					candidatePieces.push(pieces[i]);
				} else if(pieceAboveHasPlug && iterateeHasTopSocket){
					candidatePieces.push(pieces[i]);
				}
			}

			return candidatePieces;
		}

		// All middle pieces
		if(adjacentPieceAbove.type.indexOf('middle') > -1 || adjacentPieceAbove.type.indexOf('side-t') > -1){
			pieces = SpriteMap.filter( (o) => o.type.indexOf('middle') > -1);
		}

		// ALl pieces on bottom row
		if(finalRow){
			// if(adjacentPieceAbove) console.log('adjacentPieceAbove', adjacentPieceAbove.type, adjacentPieceAbove.id);
			// if(adjacentPieceBehind) console.log('adjacentPieceBehind', adjacentPieceBehind.type, adjacentPieceBehind.id);
			
			if(adjacentPieceAbove.type.indexOf('side-l') > -1){
				pieces = SpriteMap.filter( (o) => o.type.indexOf('corner-bl') > -1);	

				let pieceAboveHasSocket = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
				let pieceAboveHasPlug = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;

				for(let i=0, l=pieces.length; i<l; i++){
					let iterateeHasTopSocket = pieces[i].connectors.sockets.indexOf('t') > -1;
					let iterateeHasTopPlug = pieces[i].connectors.plugs.indexOf('t') > -1;
					if(pieceAboveHasSocket && iterateeHasTopPlug){
						candidatePieces.push(pieces[i]);
					} else if(pieceAboveHasPlug && iterateeHasTopSocket){
						candidatePieces.push(pieces[i]);
					}
				}

				 return candidatePieces;
			}
			
			if(adjacentPieceAbove.type.indexOf('middle') > -1){
				pieces = SpriteMap.filter( (o) => o.type.indexOf('side-b') > -1);
			}

			if(adjacentPieceAbove.type.indexOf('side-r') > -1 && adjacentPieceBehind.type.indexOf('side-b') > -1){
				pieces = SpriteMap.filter( (o) => o.type.indexOf('corner-br') > -1);
			}
		}
		
		let pieceAboveHasSocket = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
		let pieceAboveHasPlug = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;
		let pieceBehindHasSocket = adjacentPieceBehind.connectors.sockets.indexOf('r') > -1;
		let pieceBehindHasPlug = adjacentPieceBehind.connectors.plugs.indexOf('r') > -1;

		for(let i=0, l=pieces.length; i<l; i++){
			let iterateeHasTopSocket = pieces[i].connectors.sockets.indexOf('t') > -1;
			let iterateeHasTopPlug = pieces[i].connectors.plugs.indexOf('t') > -1;
			let iterateeHasLeftSocket = pieces[i].connectors.sockets.indexOf('l') > -1;
			let iterateeHasLeftPlug = pieces[i].connectors.plugs.indexOf('l') > -1;
			
			if(pieceAboveHasSocket && iterateeHasTopPlug && pieceBehindHasSocket && iterateeHasLeftPlug){
				candidatePieces.push(pieces[i]);
			} else if(pieceAboveHasPlug && iterateeHasTopSocket && pieceBehindHasPlug && iterateeHasLeftSocket){
				candidatePieces.push(pieces[i]);
			} else if(pieceAboveHasSocket && iterateeHasTopPlug && pieceBehindHasPlug && iterateeHasLeftSocket){
				candidatePieces.push(pieces[i]);
			} else if(pieceAboveHasPlug && iterateeHasTopSocket && pieceBehindHasSocket && iterateeHasLeftPlug){
				candidatePieces.push(pieces[i]);
			}
		}
	}

	return candidatePieces;
}