;(function Puzzly(){
	
	var Puzzly = function(){

		this.config = {
			pieceSize: {
				'500': 40,
				'1000': 30,
				'2000': 20
			},
			boardBoundary: 200,
			numPieces: 1000
		};

		this.pieces = [];

		this.init = function(canvasId, imageUrl, numPieces){
			console.log('Initiating puzzly: ', imageUrl, numPieces);
			this.canvas = document.getElementById(canvasId);
			this.ctx = this.canvas.getContext('2d');
			this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

			this.img = new Image();
			this.img.src = imageUrl;

			this.jigsawSprite = new Image();
			this.jigsawSprite.src = './jigsaw-sprite.png';

			this.img.onload = function(img){
				this.canvas.width = this.img.width + (this.config.boardBoundary*2);
				this.canvas.height = this.img.height + (this.config.boardBoundary*2);
				this.drawImage(this.canvas, this.ctx, this.img, this.config.boardBoundary);
				this.drawComposite();
				// this.makePieces(this.canvas, this.img, 1000, this.config.pieceSize['1000'], this.config.boardBoundary);
			}.bind(this);

			window.addEventListener('click', this.onWindowClick);

		}

		this.drawComposite = function(){
			this.ctx.drawImage(this.img, 50, 50, 300, 300, 50, 50, 300, 300);
			// this.ctx.globalCompositeOperation = 'source-in';
			this.ctx.globalCompositeOperation = 'destination-atop';
			this.ctx.drawImage(this.jigsawSprite, 50, 0, 135, 135, 50, 50, 50, 50);
		}

		this.onWindowClick = function(e){
			this.getClickTarget(e);
		}.bind(this);

		this.drawImage = function(canvas, ctx, img, boardBoundary){
			var cX = canvas.offsetLeft + boardBoundary;
			var cY = canvas.offsetTop + boardBoundary;

			ctx.drawImage(img, 0, 0, img.width, img.height, cX, cY, img.width, img.height);	
		}

		this.makePieces = function(canvas, img, numPieces, pieceSize, boardBoundary){

			var ctx = canvas.getContext('2d');

			var boardLeft = canvas.offsetLeft + boardBoundary;
			var boardTop = canvas.offsetTop + boardBoundary;

			// prepare draw options
			var curImgX = 0;
			var curImgY = 0;
			var curCanvasX = boardLeft;
			var curCanvasY = boardTop;

			for(var i=0;i<numPieces;i++){
				// do draw

				var initialPieceData = this.assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, pieceSize, i);

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

		this.assignInitialPieceData = function(imgX, imgY, canvX, canvY, pieceSize, i){
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

		this.hasCollision = function(source, target){
			var pieceBoundary = {
				top: Math.round(target.currentY),
				right: Math.round(target.currentX) + this.config.pieceSize,
				bottom: Math.round(target.currentY) + this.config.pieceSize,
				left: Math.round(target.currentX)
			};
			return source.x > pieceBoundary.left && source.x < pieceBoundary.right && source.y < pieceBoundary.bottom && source.y > pieceBoundary.top;
		}

		this.getCellByCoords = function(coords){
			for(var i=this.pieces.length-1;i>-1;i--){
				var piece = this.pieces[i];
				if(this.hasCollision(coords, piece)){
					return piece;
				}
			}
			return null;
		}

		this.getClickTarget = function(e){
			var coords = {
				x: e.clientX,
				y: e.clientY
			};
			console.log(this.getCellByCoords(coords));
		}

		return this;
	}

	window.Puzzly = new Puzzly();

})();