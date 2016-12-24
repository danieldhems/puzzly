import SpriteMap from './sprite-map'; 

class Puzzly {

	constructor(canvasId, imageUrl, numPieces){
		this.config = {
			pieceSize: {
				'500': Math.sqrt(500),
				'1000': 30,
				'2000': 20
			},
			jigsawSquareSize: 123,
			jigsawPlugSize: 41,
			boardBoundary: 200,
			numPieces: 1000
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
			// drawImage(canvas, this.ctx, img, config.boardBoundary);

			let jigsawPiece1 = SpriteMap['side-l-st-prb'];
			let jigsawPiece2 = SpriteMap['corner-tl-sr-pb'];
			let jigsawPiece3 = SpriteMap['side-l-ptrb'];
			let jigsawPiece4 = SpriteMap['side-m-ptrbl'];

			this.ctx.strokeRect(0,0,this.canvas.width, this.canvas.height);
			
			this.drawPiece(this.SourceImage, {x: 50, y: 50}, this.JigsawSprite, jigsawPiece1, this.config.pieceSize['500'], {x:50,y:100});
			this.drawPiece(this.SourceImage, {x: 50, y: 24}, this.JigsawSprite, jigsawPiece2, this.config.pieceSize['500'], {x:500,y:550});
			this.drawPiece(this.SourceImage, {x: 200, y: 24}, this.JigsawSprite, jigsawPiece3, this.config.pieceSize['500'], {x:20,y:350});
			this.drawPiece(this.SourceImage, {x: 250, y: 24}, this.JigsawSprite, jigsawPiece4, this.config.pieceSize['500'], {x:20,y:250});
			
			this.makePieces(this.canvas, this.SourceImage, 500, this.config.pieceSize['500'], this.config.boardBoundary);
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

		var boardLeft = this.canvas.offsetLeft + boardBoundary;
		var boardTop = this.canvas.offsetTop + boardBoundary;

		// prepare draw options
		var curImgX = 0;
		var curImgY = 0;
		var curCanvasX = boardLeft;
		var curCanvasY = boardTop;

		for(var i=0;i<numPieces;i++){
			// do draw

			var initialPieceData = this.assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, pieceSize, i);

			this.ctx.strokeStyle = '#000';
			this.ctx.strokeRect(curCanvasX, curCanvasY, pieceSize, pieceSize);

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

	getCandidatePieces(currentPiece, rowPosition, rowLength, previousRow){
		switch(currentPiece.orientation){
			case 'corner':
				// next piece must:
				// - be side or middle
				// - be able to connect to current piece

				// Is end of row
				if(rowPosition === rowLength - 1){

				}
				//
				else {
					let hasPlug = currentPiece.connectors.plugs.indexOf('r');
					let hasSocket = currentPiece.connectors.plugs.indexOf('r');
					if(currentPiece.connectors.indexOf())
				}
				break;
			case 'side':

				break;
			case 'middle':

				break;
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