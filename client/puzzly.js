import SpriteMap from './sprite-map'; 

class Puzzly {

	constructor(canvasId, imageUrl, numPieces){
		this.config = {
			pieceSize: {
				'500': 40,
				'1000': 30,
				'2000': 20
			},
			jigsawSquareSize: 123,
			jigsawPlugSize: 41,
			boardBoundary: 200,
			numPieces: 1000
		};

		this.Pieces = [];

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
			// drawImage(canvas, this.ctx, img, config.boardBoundary);

			let jigsawPiece1 = SpriteMap['side-l-st-prb'];
			let jigsawPiece2 = SpriteMap['corner-tl-sr-pb'];
			let jigsawPiece3 = SpriteMap['side-l-ptrb'];

			this.ctx.strokeRect(0,0,this.canvas.width, this.canvas.height);
			this.drawPiece(this.SourceImage, {x: 50, y: 50}, this.JigsawSprite, jigsawPiece1, 50, {x:50,y:100});
			this.drawPiece(this.SourceImage, {x: 50, y: 24}, this.JigsawSprite, jigsawPiece2, 50, {x:500,y:550});
			this.drawPiece(this.SourceImage, {x: 200, y: 24}, this.JigsawSprite, jigsawPiece3, 50, {x:20,y:350});
			// makePieces(canvas, img, 1000, config.pieceSize['1000'], config.boardBoundary);
		}

		window.addEventListener('click', this.onWindowClick);

	}



	// Draw puzzle piece
	drawPiece(sourceImg, sourceImgCoords, jigsawSprite, piece, pieceSize, canvasCoords){

		let dims = this.getPieceDimensions(piece, pieceSize);

		this.tmpCtx.save();
		this.tmpCtx.drawImage(sourceImg, sourceImgCoords.x, sourceImgCoords.y, dims.w, dims.h, 0, 0, dims.w, dims.h);
		this.tmpCtx.globalCompositeOperation = 'destination-atop';
		this.tmpCtx.drawImage(jigsawSprite, piece.coords.x, piece.coords.y, piece.width, piece.height, 0, 0, dims.w, dims.h);
		this.ctx.drawImage(this.tmpCanvas, canvasCoords.x, canvasCoords.y);
		this.tmpCtx.restore();
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

	onWindowClick(e){
		this.getClickTarget(e);
	}

	drawImage(canvas, ctx, img, boardBoundary){
		var cX = canvas.offsetLeft + boardBoundary;
		var cY = canvas.offsetTop + boardBoundary;

		ctx.drawImage(img, 0, 0, img.width, img.height, cX, cY, img.width, img.height);	
	}

	makePieces(canvas, img, numPieces, pieceSize, boardBoundary){

		ctx = canvas.getContext('2d');

		var boardLeft = canvas.offsetLeft + boardBoundary;
		var boardTop = canvas.offsetTop + boardBoundary;

		// prepare draw options
		var curImgX = 0;
		var curImgY = 0;
		var curCanvasX = boardLeft;
		var curCanvasY = boardTop;

		for(var i=0;i<numPieces;i++){
			// do draw

			var initialPieceData = assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, pieceSize, i);

			ctx.strokeStyle = '#000';
			ctx.strokeRect(curCanvasX, curCanvasY, pieceSize, pieceSize);

			// reached last piece, start next row
			if(curImgX === img.width - pieceSize){
				curImgX = 0;
				curImgY += pieceSize;
				curCanvasX = boardLeft;
				curCanvasY += pieceSize;
			} else {
				curImgX += pieceSize;
				curCanvasX += pieceSize;
			}
		}
	}

	assignInitialPieceData(imgX, imgY, canvX, canvY, pieceSize, i){
		var data = {
			id: i,
			imgX: imgX,
			imgY: imgY,
			currentX: canvX,
			currentY: canvY,
			solvedX: canvX,
			solvedY: canvY
		};
		pieces.push(data);
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