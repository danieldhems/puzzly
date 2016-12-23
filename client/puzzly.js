import SpriteMap from './sprite-map'; 

class Puzzly {

	constructor(canvasId, imageUrl, numPieces){
		this.config = {
			pieceSize: {
				'500': 40,
				'1000': 30,
				'2000': 20
			},
			jigsawSquareSize: 121,
			jigsawPlugSize: 45,
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
			this.tmpCanvasWidth = window.innerWidth;
			this.tmpCanvasHeight = window.innerHeight;
			// drawImage(canvas, this.ctx, img, config.boardBoundary);

			let jigsawPiece1 = SpriteMap['side-l-st-prb'];
			let jigsawPiece2 = SpriteMap['corner-tl-sr-pb'];

			console.log(jigsawPiece1)
			console.log(jigsawPiece2)

			this.drawPiece(this.SourceImage, {x: 50, y: 50}, this.JigsawSprite, jigsawPiece1, 50, {x:50,y:50});
			this.drawPiece(this.SourceImage, {x: 50, y: 0}, this.JigsawSprite, jigsawPiece2, 50, {x:100,y:100});
			// makePieces(canvas, img, 1000, config.pieceSize['1000'], config.boardBoundary);
		}

		window.addEventListener('click', this.onWindowClick);

	}



	// Draw puzzle piece
	drawPiece(sourceImg, sourceImgCoords, jigsawSprite, piece, pieceSize, canvasCoords){
		// Get scale of intended piece size compared to sprite
		let scale = pieceSize / this.config.jigsawSquareSize;
		let pieceW = null;
		let pieceH = null;

		let lrRegex = new RegExp('[lr]', 'g');
		let tbRegex = new RegExp('[tb]', 'g');

		if(piece.connectors.plugs.length === 1){
			if(piece.connectors.plugs === 'l' || piece.connectors.plugs === 'r' ){
				pieceW = pieceSize + (this.config.jigsawPlugSize * scale);
				pieceH = pieceSize;
			}
			if(piece.connectors.plugs === 't' || piece.connectors.plugs === 'b' ){
				pieceH = pieceSize + (this.config.jigsawPlugSize * scale);
				pieceW = pieceSize;
			}
		} else {
			pieceW = pieceSize;
			pieceH = pieceSize;
			if(piece.connectors.plugs.indexOf('l') > -1){
				pieceW += (this.config.jigsawPlugSize * scale);
			}
			if(piece.connectors.plugs.indexOf('r') > -1){
				pieceW += (this.config.jigsawPlugSize * scale);
			}
			if(piece.connectors.plugs.indexOf('t') > -1){
				pieceH += (this.config.jigsawPlugSize * scale);
			}
			if(piece.connectors.plugs.indexOf('b') > -1){
				pieceH += (this.config.jigsawPlugSize * scale);
			}
		}

		this.tmpCtx.save();
		this.tmpCtx.drawImage(sourceImg, sourceImgCoords.x, sourceImgCoords.y, pieceSize, pieceSize, canvasCoords.x, canvasCoords.y, pieceSize, pieceSize);
		this.tmpCtx.globalCompositeOperation = 'destination-atop';
		this.tmpCtx.drawImage(jigsawSprite, piece.coords.x, piece.coords.y, piece.width, piece.height, canvasCoords.x, canvasCoords.y, pieceW, pieceH);
		this.ctx.drawImage(this.tmpCanvas, canvasCoords.x, canvasCoords.y);
		this.tmpCtx.restore();
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