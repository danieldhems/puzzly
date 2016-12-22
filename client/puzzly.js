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
			jigsawPlugSize: 41,
			boardBoundary: 200,
			numPieces: 1000
		};

		this.Pieces = [];

		console.log('Initiating puzzly: ', imageUrl, numPieces);
		
		this.canvas = document.getElementById(canvasId);
		this.ctx = canvas.getContext('2d');

		this.SourceImage = new Image();
		this.SourceImage.src = imageUrl;

		this.JigsawSprite = new Image();
		this.JigsawSprite.src = './jigsaw-sprite.png';

		this.SourceImage.onload = () => {
			canvas.width = this.SourceImage.width + (this.config.boardBoundary*2);
			canvas.height = this.SourceImage.height + (this.config.boardBoundary*2);
			// drawImage(canvas, this.ctx, img, config.boardBoundary);

			this.drawPiece(this.SourceImage, {x: 50, y: 50}, this.JigsawSprite, SpriteMap, 'side-l-stb-pr', 50);
			// makePieces(canvas, img, 1000, config.pieceSize['1000'], config.boardBoundary);
		}

		window.addEventListener('click', this.onWindowClick);

	}



	// Draw puzzle piece
	drawPiece(sourceImg, sourceImgCoords, jigsawSprite, SpriteMap, pieceType, pieceSize){
		// Get jigsaw piece sprite data
		let piece = SpriteMap[pieceType];

		// Get scale of intended piece size compared to sprite
		let scale = pieceSize / this.config.jigsawSquareSize;

		// Implement logic to add scaled overlap width / height of plug size for jigsaw pieces,
		// depending on which sides the plugs are on e.g. top, right, bottom, left
		let pieceW = pieceSize + (this.config.jigsawPlugSize * scale);
		let pieceH = pieceSize;

		this.ctx.drawImage(sourceImg, sourceImgCoords.x, sourceImgCoords.y, pieceSize, pieceSize, 50, 50, pieceSize, pieceSize);
		this.ctx.globalCompositeOperation = 'destination-atop';
		this.ctx.drawImage(jigsawSprite, piece.coords.x, piece.coords.y, piece.width, piece.height, 50, 50, pieceW, pieceH);
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