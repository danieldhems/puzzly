;(function Puzzly(){
	
	var Puzzly = function(){

		this.config = {
			boardSize: {
				w: 800,
				h: 600
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

			this.img.onload = function(img){
				this.canvas.width = this.img.width + (this.config.boardBoundary*2);
				this.canvas.height = this.img.height + (this.config.boardBoundary*2);
				this.config.pieceSize = this.setPieceSize(this.img, numPieces);
				this.drawImage(this.canvas, this.ctx, this.img, this.config.boardBoundary);
				this.makePieces(this.canvas, this.img, numPieces, this.config.pieceSize, this.config.boardBoundary);
			}.bind(this);

			window.addEventListener('click', this.onWindowClick);

		}

		this.onWindowClick = function(e){
			this.getClickTarget(e);
		}.bind(this);

		// Add piece size property to main config based on the image and the number of pieces chosen by the user
		// Returns unitless number, intended to be used as pixels
		this.setPieceSize = function(img, numPieces){
			var naturalPieceSize = Math.sqrt( (img.width*img.height)/numPieces);
			// var scaledPieceSize = naturalPieceSize / (this.canvas.width*this.canvas.height);
			return naturalPieceSize;
		}

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
				if(curImgX > img.width){
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