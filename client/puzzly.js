;(function Puzzly(){
	
	var Puzzly = function(){

		this.config = {
			boardSize: {
				w: 800,
				h: 600
			},
			boardBoundary: {
				t: 150,
				r: 300,
				b: 150,
				l: 300
			},
			numPieces: 1000
		};

		this.init = function(canvasId, imageUrl, numPieces){
			console.log('Initiating puzzly: ', imageUrl, numPieces);
			this.canvas = document.getElementById(canvasId);
			this.ctx = this.canvas.getContext('2d');

			this.img = new Image();
			this.img.src = imageUrl;
			console.log('image loaded: ', this.img.width, this.img.height);
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;

			this.img.onload = function(img){
				console.log(img);
				this.config.pieceSize = this.setPieceSize(this.img, numPieces);
				this.drawPieces(this.ctx, this.img, 1000);
			}.bind(this);

		}

		// Add piece size property to main config based on the image and the number of pieces chosen by the user
		// Returns unitless number, intended to be used as pixels
		this.setPieceSize = function(img, numPieces){
			return Math.ceil( Math.sqrt( (img.width*img.height)/this.config.numPieces ) );
		}

		this.drawPieces = function(ctx, img, numPieces){

			console.log(img);

			var opts = {};
			
			// prepare draw options
			opts.curImgX = 0;
			opts.curImgY = 0;
			opts.curCanvasX = this.config.boardBoundary.l;
			opts.curCanvasY = this.config.boardBoundary.t;
			opts.drawWidth = this.config.pieceSize;
			opts.drawHeight = Math.ceil(img.height/10);

			var rowSize = 100;
			var rowCount = 0;

			for(var i=0;i<numPieces;i++){


				// start new row every 100 cells
				if(i!==0&&i%rowSize===0){
					
					rowCount = rowCount+1;

					opts.curImgX = 0;
					opts.curImgY = rowCount * opts.drawHeight;
					opts.curCanvasX = this.config.boardBoundary.l;
					opts.curCanvasY = rowCount===0?this.config.boardBoundary.t:opts.curCanvasY + opts.drawHeight +1;

				}

				// do draw
				ctx.drawImage(img, opts.curImgX, opts.curImgY, opts.drawWidth, opts.drawHeight, opts.curCanvasX, opts.curCanvasY, opts.drawWidth, opts.drawHeight);

				// update current coords
				opts.curImgX = opts.curImgX + opts.drawWidth;
				opts.curCanvasX = opts.curCanvasX + opts.drawWidth + 1;

			}
		}

		return this;
	}

	window.Puzzly = new Puzzly();

})();