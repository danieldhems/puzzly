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
			numPiecesOnHorizontalSides: 38,
			backgroundImages: [
				{
					name: 'wood',
					path: './bg-wood.jpg'
				}
			]
		};

		this.pieces = [];

		// console.log('Initiating puzzly: ', imageUrl, numPieces);
		
		this.canvas = document.getElementById(canvasId);
		this.tmpCanvas = document.getElementById('tmp-canvas');
		this.bgCanvas = document.getElementById('tmp-canvas');
		this.ctx = this.canvas.getContext('2d');
		this.tmpCtx = this.tmpCanvas.getContext('2d');
		this.bgCtx = this.bgCanvas.getContext('2d');

		this.SourceImage = new Image();
		this.SourceImage.src = imageUrl;

		this.BgImage = new Image();
		this.BgImage.src = this.config.backgroundImages[0].path;

		this.JigsawSprite = new Image();
		this.JigsawSprite.src = './jigsaw-sprite.png';

		const imgs = [
			this.SourceImage,
			this.BgImage,
			this.JigsawSprite
		];

		this.preloadImages(imgs);

	}

	init(){
		this.canvas.width = this.SourceImage.width + (this.config.boardBoundary*2);
		this.canvas.height = this.SourceImage.height + (this.config.boardBoundary*2);
		this.tmpCanvas.style.width = this.canvas.width;
		this.tmpCanvas.style.height = this.canvas.height;
		this.bgCanvas.width = this.SourceImage.width + (this.config.boardBoundary*2);
		this.bgCanvas.height = this.SourceImage.height + (this.config.boardBoundary*2);

		this.drawBackground();
		this.makePieces(this.SourceImage, 500, this.config.pieceSize['500']);

		window.addEventListener('mousedown', (e) => {
			this.onMouseDown(e);
		});
		window.addEventListener('mouseup', (e) => {
			this.onMouseUp();
		});
		window.addEventListener('mousemove', (e) => {
			this.onMouseMove(e);
		});
	}

	draw(mouseX, mouseY){
		this.drawBackground();
		this.drawPiece(this.movingPiece.imgX, this.movingPiece.imgY, mouseX, mouseY, this.movingPiece, this.config.pieceSize['500']);
	}

	onMouseDown(e){
		this.movingPiece = this.getClickTarget(e);
		this.isMouseDown = true;
	}

	onMouseUp(){
		this.movingPiece = null;
		this.isMouseDown = false;
	}

	onMouseMove(e){
		if(this.isMouseDown){
			this.draw(e.clientX, e.clientY);
			this.movingPiece.currentX = e.clientX;
			this.movingPiece.currentY = e.clientY;
		}
	}

	preloadImages(imgs, cb){
		let promises = [];
		for(let i=0,l=imgs.length;i<l;i++){
			promises.push(this.loadImage(imgs[i]));
		}
		Promise.all(promises).then( () => {
			this.init()
		})
	}

	loadImage(img){
		return new Promise( (resolve, reject) => {
			img.onload = () => {
				resolve(img);
			};
			img.onerror = () => {
				reject(img);
			};
		})
	}

	drawImage(img, imgX, imgY, imgW, imgH, inBoardArea){
		if(inBoardArea){
			var cX = this.canvas.ObjectffsetLeft + this.config.boardBoundary;
			var cY = this.canvas.offsetTop + this.config.boardBoundary;
		}

		// this.tmpCtx.drawImage(img, imgX, imgY, imgW, imgH);
		this.ctx.drawImage(img, 0, 0, imgW, imgH)	
	}

	makePieces(img, numPieces, pieceSize){

		var boardLeft = this.canvas.offsetLeft + this.config.boardBoundary;
		var boardTop = this.canvas.offsetTop + this.config.boardBoundary;

		// prepare draw options
		var curImgX = 300;
		var curImgY = 300;
		var curCanvasX = boardLeft;
		var curCanvasY = boardTop;

		let done = false;
		let i=0;

		let adjacentPieceBehind = null;
		let adjacentPieceAbove = null;
		let endOfRow = false;
		let lastPiece = null;
		let rowCount = 1;
		let finalRow = false;

		while(i<1){

			// console.log(this.pieces)
			// All pieces not on top row
			if(this.pieces.length > this.config.numPiecesOnHorizontalSides - 1){
				adjacentPieceAbove = this.pieces[this.pieces.length - this.config.numPiecesOnHorizontalSides];
			}

			// Last piece in row, next piece should be a corner or right side
			if(this.pieces.length > 1 && this.pieces.length % (this.config.numPiecesOnHorizontalSides - 1) === 0){
				endOfRow = true;
			} else {
				endOfRow = false;
			}

			if(rowCount === this.config.numPiecesOnVerticalSides-1){
				finalRow = true;
			}

			if(this.pieces.length > 0){
				adjacentPieceBehind = this.pieces[i-1];
			}

			let candidatePieces = this.getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow);			
			let currentPiece = candidatePieces[ Math.floor(Math.random() * candidatePieces.length) ];
			this.drawPiece(curImgX, curImgY, curCanvasX, curCanvasY, currentPiece, pieceSize);
			this.assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, currentPiece, i);

			// reached last piece, start next row
			if(this.pieces.length % this.config.numPiecesOnHorizontalSides === 0){
				curImgX = 0;
				curImgY += pieceSize;
				curCanvasX = boardLeft;
				curCanvasY += pieceSize;
				rowCount++;
			} else {
				curImgX += pieceSize;
				curCanvasX += pieceSize;
			}

			i++;

			if(currentPiece.type.indexOf('corner-br') > -1) done = true;
		}
	}

	getCanvasCoordsAndDimensionsForPiece(x,y,piece, pieceSize){
		const scale = pieceSize / this.config.jigsawSquareSize;
		let w,h = pieceSize;
		if(piece.connectors.plugs.length === 1){
			if(piece.connectors.plugs === 'l' || piece.connectors.plugs === 'r' ){
				w = pieceSize + (this.config.jigsawPlugSize * scale);
				h = pieceSize;
			}
			if(piece.connectors.plugs === 't' || piece.connectors.plugs === 'b' ){
				h = pieceSize + (this.config.jigsawPlugSize * scale);
				w = pieceSize;
			}
		} else {
			if(piece.connectors.plugs.indexOf('l') > -1){
				w += this.config.jigsawPlugSize * scale;
				x -= plugSizeToScale;
			}
			if(piece.connectors.plugs.indexOf('r') > -1){
				w += this.config.jigsawPlugSize * scale;
			}
			if(piece.connectors.plugs.indexOf('t') > -1){
				h += this.config.jigsawPlugSize * scale;
				y -= plugSizeToScale;
			}
			if(piece.connectors.plugs.indexOf('b') > -1){
				h += this.config.jigsawPlugSize * scale;
			}
		}

		return {
			x,y,w,h
		}
	}

	getImageCoordsAndDimensionsForPiece(iX,iY,pieceSize,piece){
		let plugSizeToScale = pieceSize / this.config.jigsawSquareSize * this.config.jigsawPlugSize;
		let iW,iH = pieceSize;
		if(piece.connectors.plugs.indexOf('l') > -1){
			iX -= plugSizeToScale;
			iW += plugSizeToScale;
		}

		if(piece.connectors.plugs.indexOf('t') > -1){
			iY -= plugSizeToScale;
			iH += plugSizeToScale;
		}

		if(piece.connectors.plugs.indexOf('r') > -1){
			iW += plugSizeToScale;
		}

		if(piece.connectors.plugs.indexOf('b') > -1){
			iH += plugSizeToScale;
		}
		return {
			x: iX,
			y: iY,
			w: iW,
			h: iH
		}	
	}

	getImgData(sourceImgData, pieceData){
		this.tmpCtx.save();
		this.tmpCtx.drawImage(this.SourceImage, sourceImgData.x, sourceImgData.y, sourceImgData.w, sourceImgData.h, 0, 0, sourceImgData.w, sourceImgData.h);
		this.tmpCtx.globalCompositeOperation = 'destination-atop';
		this.tmpCtx.drawImage(this.JigsawSprite, pieceData.x, pieceData.y, pieceData.width, pieceData.height, 0, 0, sourceImgData.w, sourceImgData.h);
		return this.tmpCtx.getImageData(0,0,pieceData.width,pieceData.height);
	}

	// Draw puzzle piece
	drawPiece(sourceImgX, sourceImgY, canvasX, canvasY, piece, pieceSize){
		let plugSizeToScale = pieceSize / this.config.jigsawSquareSize * this.config.jigsawPlugSize;

		const pieceData = this.getCanvasCoordsAndDimensionsForPiece(canvasX, canvasY, piece, pieceSize);
		const imgData = this.getImageCoordsAndDimensionsForPiece(sourceImgX, sourceImgY, pieceSize, piece)

		if(!piece.imgData){
			piece.imgData = this.getImgData(imgData, pieceData);
		}

		console.log(piece.imgData)

		this.ctx.putImageData(piece.imgData, canvasX, canvasY);
		this.tmpCtx.restore();
	}

	drawBackground(){
		this.bgCtx.save();
		this.bgCtx.globalCompositeOperation = 'destination-over';
		this.bgCtx.drawImage(this.BgImage, 0, 0, this.BgImage.width, this.BgImage.height);
		this.ctx.drawImage(this.bgCanvas, 0, 0, this.BgImage.width, this.BgImage.height, 0, 0, this.canvas.width, this.canvas.height);
		this.bgCtx.restore();
	}

	getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow){
		let candidatePieces = [];
		let pieces = null;

		// Top left corner piece
		if(!adjacentPieceBehind && !adjacentPieceAbove){
			return SpriteMap.filter((o) => o.type.indexOf('corner-tl') > -1 );
		}

		// First row pieces
		if(!adjacentPieceAbove){
			let pieceType = adjacentPieceBehind.type;

			// Does lastPiece have a plug on its right side?
			let lastPieceHasRightPlug = adjacentPieceBehind.connectors.plugs.indexOf('r') > -1;
			// Does lastPiece have a socket on its right side?
			let lastPieceHasRightSocket = adjacentPieceBehind.connectors.sockets.indexOf('r') > -1;
			let iterateeIsCorrectType;

			pieces = SpriteMap.filter( (o) => {
				if(endOfRow){
					return o.type.indexOf('corner-tr') > -1;
				} else {
					return o.type.indexOf('side-t') > -1;
				}
			});

			for(let i=0, l=pieces.length; i<l; i++){
				let iterateeHasLeftSocket = pieces[i].connectors.sockets.indexOf('l') > -1;
				let iterateeHasLeftPlug = pieces[i].connectors.plugs.indexOf('l') > -1;
				if(lastPieceHasRightPlug && iterateeHasLeftSocket){
					candidatePieces.push(pieces[i]);
				} else if(lastPieceHasRightSocket && iterateeHasLeftPlug){
					candidatePieces.push(pieces[i]);
				}
			}
		}
		// All piece after top row
		else {

			// Last piece of each row, should be right side
			if(adjacentPieceAbove.type.indexOf('corner-tr') > -1 || adjacentPieceAbove.type.indexOf('side-r') > -1){
				pieces = SpriteMap.filter( (o) => o.type.indexOf('side-r') > -1)
			}

			// Very last piece, should be corner bottom right
			if(adjacentPieceAbove.type.indexOf('side-r') > -1 && adjacentPieceBehind.type.indexOf('side-b') > -1){
				pieces = SpriteMap.filter( (o) => o.type.indexOf('corner-br') > -1)
			}

			// First piece of each row, should be left side
			if(!finalRow && (adjacentPieceBehind.type.indexOf('corner-tr') > -1 || adjacentPieceBehind.type.indexOf('side-r') > -1)){
				
				pieces = SpriteMap.filter( (o) => o.type.indexOf('side-l') > -1);

				let pieceAboveHasSocket = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
				let pieceAboveHasPlug = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;

				for(let i=0, l=pieces.length; i<l; i++){
					let iterateeHasTopSocket = pieces[i].connectors.sockets.indexOf('t') > -1;
					let iterateeHasTopPlug = pieces[i].connectors.plugs.indexOf('t') > -1;
					if(pieceAboveHasSocket && iterateeHasTopPlug){
						candidatePieces.push(pieces[i]);
					} else if(pieceAboveHasPlug && iterateeHasTopSocket){
						candidatePieces.push(pieces[i]);
					}
				}

				return candidatePieces;
			}

			// All middle pieces
			if(adjacentPieceAbove.type.indexOf('middle') > -1 || adjacentPieceAbove.type.indexOf('side-t') > -1){
				pieces = SpriteMap.filter( (o) => o.type.indexOf('middle') > -1);
			}

			// ALl pieces on bottom row
			if(finalRow){
				// if(adjacentPieceAbove) console.log('adjacentPieceAbove', adjacentPieceAbove.type, adjacentPieceAbove.id);
				// if(adjacentPieceBehind) console.log('adjacentPieceBehind', adjacentPieceBehind.type, adjacentPieceBehind.id);
				
				if(adjacentPieceAbove.type.indexOf('side-l') > -1){
					pieces = SpriteMap.filter( (o) => o.type.indexOf('corner-bl') > -1);	

					let pieceAboveHasSocket = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
					let pieceAboveHasPlug = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;

					for(let i=0, l=pieces.length; i<l; i++){
						let iterateeHasTopSocket = pieces[i].connectors.sockets.indexOf('t') > -1;
						let iterateeHasTopPlug = pieces[i].connectors.plugs.indexOf('t') > -1;
						if(pieceAboveHasSocket && iterateeHasTopPlug){
							candidatePieces.push(pieces[i]);
						} else if(pieceAboveHasPlug && iterateeHasTopSocket){
							candidatePieces.push(pieces[i]);
						}
					}

					 return candidatePieces;
				}
				
				if(adjacentPieceAbove.type.indexOf('middle') > -1){
					pieces = SpriteMap.filter( (o) => o.type.indexOf('side-b') > -1);
				}

				if(adjacentPieceAbove.type.indexOf('side-r') > -1 && adjacentPieceBehind.type.indexOf('side-b') > -1){
					pieces = SpriteMap.filter( (o) => o.type.indexOf('corner-br') > -1);
				}
			}
			
			let pieceAboveHasSocket = adjacentPieceAbove.connectors.sockets.indexOf('b') > -1;
			let pieceAboveHasPlug = adjacentPieceAbove.connectors.plugs.indexOf('b') > -1;
			let pieceBehindHasSocket = adjacentPieceBehind.connectors.sockets.indexOf('r') > -1;
			let pieceBehindHasPlug = adjacentPieceBehind.connectors.plugs.indexOf('r') > -1;

			for(let i=0, l=pieces.length; i<l; i++){
				let iterateeHasTopSocket = pieces[i].connectors.sockets.indexOf('t') > -1;
				let iterateeHasTopPlug = pieces[i].connectors.plugs.indexOf('t') > -1;
				let iterateeHasLeftSocket = pieces[i].connectors.sockets.indexOf('l') > -1;
				let iterateeHasLeftPlug = pieces[i].connectors.plugs.indexOf('l') > -1;
				
				if(pieceAboveHasSocket && iterateeHasTopPlug && pieceBehindHasSocket && iterateeHasLeftPlug){
					candidatePieces.push(pieces[i]);
				} else if(pieceAboveHasPlug && iterateeHasTopSocket && pieceBehindHasPlug && iterateeHasLeftSocket){
					candidatePieces.push(pieces[i]);
				} else if(pieceAboveHasSocket && iterateeHasTopPlug && pieceBehindHasPlug && iterateeHasLeftSocket){
					candidatePieces.push(pieces[i]);
				} else if(pieceAboveHasPlug && iterateeHasTopSocket && pieceBehindHasSocket && iterateeHasLeftPlug){
					candidatePieces.push(pieces[i]);
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
			boundingBox: {
				top: canvY,
				right: canvX + this.config.pieceSize['500'],
				bottom: canvY + this.config.pieceSize['500'],
				left: canvX
			},
			solvedX: canvX,
			solvedY: canvY,
			isSolved: false
		}, piece);
		this.pieces.push(data);
		return data;
	}

	hasCollision(source, target){
		return source.x > target.boundingBox.left && source.x < target.boundingBox.right && source.y < target.boundingBox.bottom && source.y > target.boundingBox.top;
	}

	getCellByCoords(coords){
		for(var i=this.pieces.length-1;i>-1;i--){
			var piece = this.pieces[i];
			if(this.hasCollision(coords, piece)){
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
		return this.getCellByCoords(coords);
	}
}

export default Puzzly;