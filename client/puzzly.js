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

		console.log('Initiating puzzly: ', imageUrl, numPieces);
		
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

		window.addEventListener('click', this.onWindowClick);

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
		var curImgX = 0;
		var curImgY = 0;
		var curCanvasX = boardLeft;
		var curCanvasY = boardTop;

		let done = false;
		let i=0;

		let adjacentPieceBehind = null;
		let adjacentPieceAbove = null;
		let endOfRow = false;
		let lastPiece = null;

		while(!done){

			// All pieces not on top row
			if(this.pieces.length >= this.config.numPiecesOnHorizontalSides){
				adjacentPieceAbove = this.pieces[this.pieces.length - this.config.numPiecesOnHorizontalSides];
			}

			// Last piece in row, next piece should be a corner or right side
			if(i % (this.config.numPiecesOnHorizontalSides - 1) === 0){
				endOfRow = true;
			} else {
				endOfRow = false;
			}

			if(this.pieces.length > 0){
				adjacentPieceBehind = this.pieces[i-1];
			}

			let candidatePieces = this.getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow);
			console.log('candidates', candidatePieces);
			let currentPiece = candidatePieces[ Math.floor(Math.random() * candidatePieces.length) ];

			this.assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, currentPiece, i);
			this.drawPiece({x: curImgX, y: curImgY}, {x: curCanvasX, y: curCanvasY}, currentPiece);

			// reached last piece, start next row
			if(this.pieces.length % this.config.numPiecesOnHorizontalSides === 0){
				curImgX = 0;
				curImgY += pieceSize;
				curCanvasX = boardLeft;
				curCanvasY += pieceSize;
			} else {
				curImgX += pieceSize;
				curCanvasX += pieceSize;
			}

			if(this.pieces.length === this.config.numPiecesOnHorizontalSides * this.config.numPiecesOnVerticalSides) done = true;

			i++;
		}
	}

	// Draw puzzle piece
	drawPiece(sourceImgCoords, canvasCoords, piece){
		let dims = this.getPieceDimensions(piece, this.config.pieceSize['1000']);

		this.tmpCtx.save();
		this.tmpCtx.drawImage(this.SourceImage, sourceImgCoords.x, sourceImgCoords.y, dims.w, dims.h, 0, 0, dims.w, dims.h);
		this.tmpCtx.globalCompositeOperation = 'destination-atop';
		this.tmpCtx.drawImage(this.JigsawSprite, piece.coords.x, piece.coords.y, piece.width, piece.height, 0, 0, dims.w, dims.h);
		this.ctx.drawImage(this.tmpCanvas, canvasCoords.x, canvasCoords.y);
		this.tmpCtx.restore();
	}

	drawBackground(){
		this.bgCtx.save();
		this.bgCtx.globalCompositeOperation = 'destination-over';
		this.bgCtx.drawImage(this.BgImage, 0, 0, this.BgImage.width, this.BgImage.height);
		this.ctx.drawImage(this.bgCanvas, 0, 0, this.BgImage.width, this.BgImage.height, 0, 0, this.canvas.width, this.canvas.height);
		this.bgCtx.restore();
	}

	getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow){
		let candidatePieces = [];
		console.log('adjacentPieceAbove', adjacentPieceAbove, 'adjacentPieceBehind', adjacentPieceBehind, 'endOfRow', endOfRow);
		if(!adjacentPieceBehind && !adjacentPieceAbove){
			return SpriteMap.filter((o) => o.type.indexOf('corner-tl') > -1 );
		}

		if(!adjacentPieceAbove){
			let pieceType = adjacentPieceBehind.type;

			// Does lastPiece have a plug on its right side?
			let lastPieceHasRightPlug = adjacentPieceBehind.connectors.plugs.indexOf('r') > -1;
			// Does lastPiece have a socket on its right side?
			let lastPieceHasRightSocket = adjacentPieceBehind.connectors.sockets.indexOf('r') > -1;
			let iterateeIsCorrectType;

			let pieces = SpriteMap.filter( (o) => {
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
		} else {
			// Was last piece the top right corner or right side?
			if(adjacentPieceBehind.type.indexOf('corner-tr') > -1 || adjacentPieceBehind.type.indexOf('side-r') > -1){
				
				let pieces = SpriteMap.filter( (o) => o.type.indexOf('side-l') > -1);
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
			} else {

				let pieces = null;

				if(adjacentPieceAbove.type.indexOf('middle') > -1 || adjacentPieceAbove.type.indexOf('side-t') > -1){
					pieces = SpriteMap.filter( (o) => o.type.indexOf('middle') > -1);
				}

				if(endOfRow){
					pieces = SpriteMap.filter( (o) => o.type.indexOf('side-r') > -1);
				}

				console.log(pieces);
				
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
			solvedX: canvX,
			solvedY: canvY
		}, piece);
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