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

		this.init = function(canvasId, imageUrl, numPieces){
			console.log('Initiating puzzly: ', imageUrl, numPieces);
			this.canvas = document.getElementById(canvasId);
			this.ctx = this.canvas.getContext('2d');
			this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

			this.img = new Image();
			this.img.src = imageUrl;

			this.img.onload = function(img){
				this.canvas.width = this.img.width;
				this.canvas.height = this.img.height;
				this.config.pieceSize = this.setPieceSize(this.img, numPieces);
				console.log(this.config.pieceSize);
				this.drawPieces(this.ctx, this.img, numPieces, this.config.pieceSize);
			}.bind(this);

		}

		// Add piece size property to main config based on the image and the number of pieces chosen by the user
		// Returns unitless number, intended to be used as pixels
		this.setPieceSize = function(img, numPieces){
			var naturalPieceSize = Math.sqrt( (img.width*img.height)/numPieces);
			// var scaledPieceSize = naturalPieceSize / (this.canvas.width*this.canvas.height);
			return naturalPieceSize;
		}

		this.drawPieces = function(ctx, img, numPieces, pieceSize){

			var opts = {};
			
			var boardLeft = this.canvas.offsetLeft + this.config.boardBoundary
			var boardTop = this.canvas.offsetTop + this.config.boardBoundary

			// prepare draw options
			opts.curImgX = 0;
			opts.curImgY = 0;
			opts.curCanvasX = boardLeft;
			opts.curCanvasY = boardTop;

			for(var i=0;i<numPieces;i++){
				// do draw
				ctx.drawImage(img, opts.curImgX, opts.curImgY, pieceSize, pieceSize, opts.curCanvasX, opts.curCanvasY, pieceSize, pieceSize);

				// reached last piece, start next row
				if(opts.curImgX > img.width){
					opts.curImgX = 0;
					opts.curImgY += pieceSize;
					opts.curCanvasX = boardLeft;
					opts.curCanvasY += pieceSize;
				} else {
					opts.curImgX += pieceSize;
					opts.curCanvasX += pieceSize;
				}
			}
		}

		return this;
	}

	window.Puzzly = new Puzzly();

})();