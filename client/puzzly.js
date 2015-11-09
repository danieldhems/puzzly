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

		this.init = function(canvasId, imageId, numPieces){
			this.canvas = document.getElementById(canvasId);
			this.ctx = this.canvas.getContext('2d');

			this.img = document.getElementById(imageId);
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;

			this.config.pieceSize = this.setPieceSize(this.img, numPieces);

			this.drawPieces(this.ctx, this.img, 1000);
		}

		// Add piece size property to main config based on the image and the number of pieces chosen by the user
		// Returns unitless number, intended to be used as pixels
		this.setPieceSize = function(img, numPieces){
			return Math.ceil( Math.sqrt( (img.width*img.height)/this.config.numPieces ) );
		}

		this.drawPieces = function(ctx, img, numPieces){

			var opts = {};
			opts.curX = 0;
			opts.curY = 0;

			var rowSize = 100;
			var rowCount = 1;

			for(var i=0;i<numPieces;i++){
				// Set width of clipped image that will be drawn
				// Also update curX and curY to reflect new start position after draw
				opts.drawWidth = this.config.pieceSize;
				opts.drawHeight = this.config.pieceSize;

				// start new row every 100 cells
				if(i%rowSize===0){

					rowCount = rowCount+1;
					opts.curY = rowCount * opts.drawHeight;
					opts.canvasStartY = this.config.boardBoundary.t + (rowCount * opts.drawStartY);

				} else {
					opts.drawStartX = opts.curX;
					opts.drawStartY = opts.curY;
					opts.canvasStartX = this.config.boardBoundary.l + opts.drawStartX;
					opts.canvasStartY = this.config.boardBoundary.t + (rowCount * opts.drawStartY);
				}

				ctx.drawImage(img, opts.drawStartX, opts.drawStartY, opts.drawWidth, opts.drawHeight, opts.canvasStartX, opts.canvasStartY, opts.drawWidth, opts.drawHeight);

				opts.curX = opts.drawStartX + opts.drawWidth;

			}
		}

		return this;
	}

	window.Puzzly = new Puzzly();

})();