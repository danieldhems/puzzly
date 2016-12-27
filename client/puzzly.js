import SpriteMap from './sprite-map'; 

class Puzzly {

	constructor(canvasId, imageUrl, numPieces){
		this.config = {
			pieceSize: {
				'500': 35,
				'1000': 30,
				'2000': 20
			},
			jigsawSquareSize: 123,
			jigsawPlugSize: 41,
			boardBoundary: 200,
			numPiecesOnVerticalSides: 27,
			numPiecesOnHorizontalSides: 38
		};

		this.pieces = [];

		console.log('Initiating puzzly: ', imageUrl, numPieces);
		
		this.canvas = document.getElementById(canvasId);
		this.tmpCanvas = document.getElementById('tmp-canvas');
		this.ctx = this.canvas.getContext('2d');
		this.tmpCtx = this.tmpCanvas.getContext('2d');

		this.SourceImage = new Image();
		this.SourceImage.src = imageUrl;

		this.JigsawSprite = new Image();
		this.JigsawSprite.src = './jigsaw-sprite.png';

		this.SourceImage.onload = () => {
			this.canvas.width = this.SourceImage.width + (this.config.boardBoundary*2);
			this.canvas.height = this.SourceImage.height + (this.config.boardBoundary*2);
			this.tmpCanvasWidth = this.canvas.width;
			this.tmpCanvasHeight = this.canvas.height;
			
			this.makePieces(this.SourceImage, 500, this.config.pieceSize['500'], this.config.boardBoundary);
		}

		window.addEventListener('click', this.onWindowClick);

	}

	

	onWindowClick(e){
		this.getClickTarget(e);
	}

	drawImage(canvas, ctx, img, boardBoundary){
		var cX = canvas.offsetLeft + boardBoundary;
		var cY = canvas.offsetTop + boardBoundary;

		ctx.drawImage(img, 0, 0, img.width, img.height, cX, cY, img.width, img.height);	
	}

	makePieces(img, numPieces, pieceSize){

		var boardLeft = this.canvas.offsetLeft + this.config.boardBoundary;
		var boardTop = this.canvas.offsetTop + this.config.boardBoundary;

		// prepare draw options
		var curImgX = 0;
		var curImgY = 0;
		var curCanvasX = boardLeft;
		var curCanvasY = boardTop;

		let done = false;
		let i=0;

		let adjacentPieceBehind = null;
		let adjacentPieceAbove = null;
		let endOfRow = false;

		while(!done){
			// this.ctx.strokeStyle = '#000';
			// this.ctx.strokeRect(curCanvasX, curCanvasY, pieceSize, pieceSize);

			if(this.pieces.length > 0){
				adjacentPieceBehind = this.pieces[i-1];
			}
			if(this.pieces.length > this.config.numPiecesOnHorizontalSides){
				adjacentPieceAbove = this.pieces[i - this.config.numPiecesOnHorizontalSides];
			}

			// console.log(this.pieces);
			console.log('adjacents', adjacentPieceBehind, adjacentPieceAbove);
			let candidatePieces = this.getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow);
			console.log(candidatePieces);

			let currentPiece = candidatePieces[ Math.floor(Math.random() * candidatePieces.length) ];
			
			this.assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, currentPiece, i);
			this.drawPiece({x: curImgX, y: curImgY}, {x: curCanvasX, y: curCanvasY}, currentPiece);

			// reached last piece, start next row
			if(this.pieces.length % this.config.numPiecesOnHorizontalSides === 0){
				curImgX = 0;
				curImgY += pieceSize;
				curCanvasX = boardLeft;
				curCanvasY += pieceSize;
			} else {
				curImgX += pieceSize;
				curCanvasX += pieceSize;
			}

			if(this.pieces.length === this.config.numPiecesOnHorizontalSides * this.config.numPiecesOnVerticalSides) done = true;

			i++;
		}
	}

	// Draw puzzle piece
	drawPiece(sourceImgCoords, canvasCoords, piece){

		let dims = this.getPieceDimensions(piece, this.config.pieceSize['1000']);

		this.tmpCtx.save();
		this.tmpCtx.drawImage(this.SourceImage, sourceImgCoords.x, sourceImgCoords.y, dims.w, dims.h, 0, 0, dims.w, dims.h);
		this.tmpCtx.globalCompositeOperation = 'destination-atop';
		this.tmpCtx.drawImage(this.JigsawSprite, piece.coords.x, piece.coords.y, piece.width, piece.height, 0, 0, dims.w, dims.h);
		this.ctx.drawImage(this.tmpCanvas, canvasCoords.x, canvasCoords.y);
		this.tmpCtx.restore();
	}

	getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow){
		let candidatePieces = [];
		// let plugs = lastPiece.connectors.plugs;
		// let sockets = lastPiece.connectors.sockets;
		if(!adjacentPieceBehind && !adjacentPieceAbove){
			return SpriteMap.filter((o) => o.type.indexOf('corner-tl') > -1 );
		}

		if(!adjacentPieceAbove){
			let pieceType = adjacentPieceBehind.type;

			console.log(pieceType)
			// Does lastPiece have a plug on its right side?
			let lastPieceHasRightPlug = adjacentPieceBehind.connectors.plugs.indexOf('r') > -1;
			// Does lastPiece have a socket on its right side?
			let lastPieceHasRightSocket = adjacentPieceBehind.connectors.sockets.indexOf('r') > -1;
			
			for(let i=0, l=SpriteMap.length; i<l; i++){
				let iterateeIsTopSide = SpriteMap[i].type.indexOf('side-t') > -1;
				let iterateeHasLeftSocket = SpriteMap[i].connectors.sockets.indexOf('l') > -1;
				let iterateeHasLeftPlug = SpriteMap[i].connectors.plugs.indexOf('l') > -1;
				if(iterateeIsTopSide && lastPieceHasRightPlug && iterateeHasLeftSocket){
					candidatePieces.push(SpriteMap[i]);
				} else if(iterateeIsTopSide && lastPieceHasRightSocket && iterateeHasLeftPlug){
					candidatePieces.push(SpriteMap[i]);
				}
			}
		}

		return candidatePieces;
	}

	getPieceDimensions(piece, pieceSize){
		let scale = pieceSize / this.config.jigsawSquareSize;
		let dims = {
			w: null,
			h: null
		};
		if(piece.connectors.plugs.length === 1){
			if(piece.connectors.plugs === 'l' || piece.connectors.plugs === 'r' ){
				dims.w = pieceSize + (this.config.jigsawPlugSize * scale);
				dims.h = pieceSize;
			}
			if(piece.connectors.plugs === 't' || piece.connectors.plugs === 'b' ){
				dims.h = pieceSize + (this.config.jigsawPlugSize * scale);
				dims.w = pieceSize;
			}
		} else {
			dims.w = pieceSize;
			dims.h = pieceSize;
			if(piece.connectors.plugs.indexOf('l') > -1){
				dims.w += this.config.jigsawPlugSize * scale;
			}
			if(piece.connectors.plugs.indexOf('r') > -1){
				dims.w += this.config.jigsawPlugSize * scale;
			}
			if(piece.connectors.plugs.indexOf('t') > -1){
				dims.h += this.config.jigsawPlugSize * scale;
			}
			if(piece.connectors.plugs.indexOf('b') > -1){
				dims.h += this.config.jigsawPlugSize * scale;
			}
		}
		return dims;
	}


	assignInitialPieceData(imgX, imgY, canvX, canvY, piece, i){
		var data = Object.assign({
			id: i,
			imgX: imgX,
			imgY: imgY,
			currentX: canvX,
			currentY: canvY,
			solvedX: canvX,
			solvedY: canvY
		}, piece);
		this.pieces.push(data);
		return data;
	}

	hasCollision(source, target){
		var pieceBoundary = {
			top: Math.round(target.currentY),
			right: Math.round(target.currentX) + config.pieceSize,
			bottom: Math.round(target.currentY) + config.pieceSize,
			left: Math.round(target.currentX)
		};
		return source.x > pieceBoundary.left && source.x < pieceBoundary.right && source.y < pieceBoundary.bottom && source.y > pieceBoundary.top;
	}

	getCellByCoords(coords){
		for(var i=pieces.length-1;i>-1;i--){
			var piece = pieces[i];
			if(hasCollision(coords, piece)){
				return piece;
			}
		}
		return null;
	}

	getClickTarget(e){
		var coords = {
			x: e.clientX,
			y: e.clientY
		};
		console.log(getCellByCoords(coords));
	}
}

export default Puzzly;