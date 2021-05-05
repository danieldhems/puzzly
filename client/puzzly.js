class Puzzly {

	constructor(canvasId, imageUrl, numPieces){
		this.config = {
			scale: .2,
			boardBoundary: 200,
			backgroundImages: [
				{
					name: 'wood',
					path: './bg-wood.jpg'
				}
			]
		};

		this.pieces = [];

		this.numPieces = numPieces;

		this.canvas = document.getElementById(canvasId);
		this.ctx = this.canvas.getContext('2d');

		this.loadedImages = [];
		this.SourceImage = new Image();
		this.SourceImage.src = imageUrl;

		this.BgImage = new Image();
		this.BgImage.src = this.config.backgroundImages[0].path;

		this.JigsawSprite = new Image();
		this.JigsawSprite.src = './jigsaw-sprite.png';

		const imgs = [
			this.SourceImage,
			this.BgImage,
			this.JigsawSprite,
		];

		this.preloadImages(imgs).then( () => {
			this.init()
		})
	}

	init(){
		this.canvas.width = this.SourceImage.width + (this.config.boardBoundary*2);
		this.canvas.height = this.SourceImage.height + (this.config.boardBoundary*2);
	
		// Width / height of a single segment based on the total area of the src image divided by the number of pieces the user wants
		this.segmentSize = Math.sqrt(this.loadedImages[1].width * this.loadedImages[1].height / this.numPieces);
		this.piecesPerSide = Math.sqrt(this.numPieces)

		// this.diceImage(this.numPieces);

		this.jigsawShapeSpans = {
			small: 122,
			medium: 165,
			large: 208
		};

		this.drawBackground();
		
		this.SpriteMap = [
			{x: 40, y: 0, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.small, type: [0,  -1, -1, 0], id: 1},
			{x: 285, y: 0, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [0, -1, 1, 0], id: 2},
			{x: 531, y: 0, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [0, -1, 1, 0], id: 3},
			{x: 777, y: 0, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [0, 1, 1, 0], id: 4},
			{x: 1020, y: 0, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.small, type: [-1, -1, 0, 0], id: 5},
			{x: 1266, y: 0, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.small, type: [-1, -1, -1, 0], id: 6},
			{x: 1511, y: 0, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [-1, -1, 1, 0], id: 7},
			{x: 1756, y: 0, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [-1, 1, 0, 0], id: 8},
			
			{x: 40, y: 243, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [-1,  1, -1, 0], id: 9},
			{x: 285, y: 243, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [-1, 1, 1, 0], id: 10},
			{x: 531, y: 201, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [1, -1, 0, 0], id: 11},
			{x: 777, y: 201, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [1, -1, -1, 0], id: 12},
			{x: 1020, y: 201, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.large, type: [1, -1, 1, 0], id: 13},
			{x: 1266, y: 201, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [1, 1, 0, 0], id: 14},
			{x: 1511, y: 201, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.large, type: [1, 1, -1, 0], id: 15},
			{x: 1756, y: 201, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.large, type: [1, 1, 1, 0], id: 16},
			{x: 40, y: 490, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.small, type: [0,  0, -1, -1], id: 17},
			{x: 285, y: 490, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [0,  0, 1, -1], id: 18},
			{x: 531, y: 490, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.small, type: [0,  -1, -1, -1], id: 19},
			{x: 777, y: 490, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [0,  -1, 1, -1], id: 20},
			{x: 1020, y: 490, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [0,  1, -1, -1], id: 21},
			{x: 1266, y: 490, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [0,  1, 1, -1], id: 22},
			{x: 1511, y: 490, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.small, type: [-1,  0, 0, -1], id: 23},
			{x: 1756, y: 490, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.small, type: [-1,  0, -1, -1], id: 24},
			{x: 40, y: 733, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [-1,  0, 1, -1], id: 25},
			{x: 285, y: 733, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.small, type: [-1,  -1, 0, -1], id: 26},
			{x: 531, y: 733, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.small, type: [-1,  -1, -1, -1], id: 27},
			{x: 777, y: 733, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [-1,  -1, 1, -1], id: 28},
			{x: 1020, y: 733, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [-1,  1, 0, -1], id: 29},
			{x: 1266, y: 733, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [-1,  1, -1, -1], id: 30},
			{x: 1511, y: 733, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [-1,  1, 1, -1], id: 31},
			{x: 1756, y: 691, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [1,  0, 0, -1], id: 32},
			// Fifth row actual x value = 976
			{x: 40, y: 934, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [1,  0, -1, -1], id: 33},
			{x: 285, y: 934, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.large, type: [1,  0, 1, -1], id: 34},
			{x: 531, y: 934, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [1,  -1, 0, -1], id: 35},
			{x: 777, y: 934, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.medium, type: [1,  -1, -1, -1], id: 36},
			{x: 1020, y: 934, w: this.jigsawShapeSpans.small, h: this.jigsawShapeSpans.large, type: [1,  -1, 1, -1], id: 37},
			{x: 1266, y: 934, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [1,  1, 0, -1], id: 38},
			{x: 1511, y: 934, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [1,  1, -1, -1], id: 39},
			{x: 1756, y: 934, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.large, type: [1,  1, 1, -1], id: 40},
			{x: 0, y: 1225, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [0, 0, -1, 1], id: 41},
			{x: 245, y: 1225, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [0, 0, 1, 1], id: 42},
			{x: 491, y: 1225, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [0, -1, -1, 1], id: 43},
			{x: 737, y: 1225, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [0, -1, 1, 1], id: 44},
			{x: 980, y: 1225, w: this.jigsawShapeSpans.large, h: this.jigsawShapeSpans.small, type: [0, 1, -1, 1], id: 45},
			{x: 1226, y: 1225, w: this.jigsawShapeSpans.large, h: this.jigsawShapeSpans.medium, type: [0, 1, 1, 1], id: 46},
			{x: 1471, y: 1225, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [-1, 0, 0, 1], id: 47},
			{x: 1716, y: 1225, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [-1, 0, -1, 1], id: 48},
			{x: 0, y: 1470, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [-1, 0, 1, 1], id: 49},
			{x: 245, y: 1470, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [-1, -1, 0, 1], id: 50},
			{x: 491, y: 1470, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.small, type: [-1, -1, -1, 1], id: 51},
			{x: 737, y: 1470, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [-1, -1, 1, 1], id: 52},
			{x: 980, y: 1470, w: this.jigsawShapeSpans.large, h: this.jigsawShapeSpans.small, type: [-1, 1, 0, 1], id: 53},
			{x: 1226, y: 1470, w: this.jigsawShapeSpans.large, h: this.jigsawShapeSpans.small, type: [-1, 1, -1, 1], id: 54},
			{x: 1471, y: 1470, w: this.jigsawShapeSpans.large, h: this.jigsawShapeSpans.medium, type: [-1, 1, 1, 1], id: 55},
			{x: 1716, y: 1430, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [1, 0, 0, 1], id: 56},
			{x: 0, y: 1674, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [1, 0, -1, 1], id: 57},
			{x: 245, y: 1674, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.large, type: [1, 0, 1, 1], id: 58},
			{x: 491, y: 1674, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [1, -1, 0, 1], id: 59},
			{x: 737, y: 1674, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.medium, type: [1, -1, -1, 1], id: 60},
			{x: 980, y: 1674, w: this.jigsawShapeSpans.medium, h: this.jigsawShapeSpans.large, type: [1, -1, 1, 1], id: 61},
			{x: 1226, y: 1674, w: this.jigsawShapeSpans.large, h: this.jigsawShapeSpans.medium, type: [1, 1, 0, 1], id: 62},
			{x: 1471, y: 1674, w: this.jigsawShapeSpans.large, h: this.jigsawShapeSpans.medium, type: [1, 1, -1, 1], id: 63},
			{x: 1716, y: 1674, w: this.jigsawShapeSpans.large, h: this.jigsawShapeSpans.large, type: [1, 1, 1, 1], id: 64},
		];
		
		this.drawPiece(64, 0, 0, 0, 0);
		this.drawPiece(40, 200, 0, 300, 0);

		this.makePieces();
		
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
	
	drawPiece(id, sourceX, sourceY, pageX, pageY) {
		const piece = this.SpriteMap.find( p => p.id === id);
		const canvasEl = document.createElement("canvas");
		document.body.appendChild(canvasEl)
		canvasEl.id = "canvas-" + id;
		canvasEl.width = piece.w;
		canvasEl.height = piece.h;
		canvasEl.style.position = "absolute";
		canvasEl.style.left = pageX + "px";
		canvasEl.style.top = pageY + "px";

		const cvctx = canvasEl.getContext("2d");

		cvctx.drawImage(this.SourceImage, sourceX, sourceY, this.segmentSize, this.segmentSize, 0, 0, this.segmentSize, this.segmentSize);
		cvctx.globalCompositeOperation = 'destination-atop';
		cvctx.drawImage(
			this.JigsawSprite,
			piece.x,
			piece.y,
			piece.w,
			piece.h,
			0, 
			0, 
			piece.w * this.config.scale,
			piece.h * this.config.scale,
		);
	}

	diceImage() {
		const img = this.loadedImages[0];

		// Create data set for all diced segments
		const segmentArray = [];
		let curX = 0;
		let curY = 0;
		let sData = {};

		for(let i=0, l = segmentArray.length; segmentArray.length < this.numPieces; i++){

			sData.x = curX;
			sData.y = curY;


			segmentArray.push()
		}
	}

	onMouseDown(e){
		this.movingPiece = e.target;
		this.movingPiece.style.zIndex = 2;
		this.movingPieceXOffset = this.movingPiece.offsetLeft;
		this.isMouseDown = true;
	}
	
	onMouseUp(){
		this.movingPiece.style.zIndex = 1;
		this.movingPiece = null;
		this.isMouseDown = false;
	}

	onMouseMove(e){
		if(this.isMouseDown){
			this.movingPiece.style.left = e.clientX + "px";
			this.movingPiece.style.top = e.clientY + "px";
		}
	}

	preloadImages(imgs, cb){
		let promises = [];
		for(let i=0,l=imgs.length;i<l;i++){
			promises.push(this.loadImage(imgs[i]).then(imgData => this.loadedImages.push(imgData)));
		}
		
		return Promise.all(promises)
	}

	loadImage(img){
		return new Promise( (resolve, reject) => {
			img.onload = img => {
				resolve(img.path[0]);
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



	makePieces(){

		var boardLeft = this.canvas.offsetLeft + this.config.boardBoundary;
		var boardTop = this.canvas.offsetTop + this.config.boardBoundary;

		console.log(boardLeft, boardTop)

		// prepare draw options
		var curImgX = boardLeft;
		var curImgY = boardTop;
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

		while(i<this.numPieces){
			// All pieces not on top row
			if(this.pieces.length > this.piecesPerSide - 1){
				adjacentPieceAbove = this.pieces[this.pieces.length - this.piecesPerSide];
			}

			// Last piece in row, next piece should be a corner or right side
			if(this.pieces.length > 1 && this.pieces.length % (this.piecesPerSide - 1) === 0){
				endOfRow = true;
			} else {
				endOfRow = false;
			}

			if(rowCount === this.piecesPerSide-1){
				finalRow = true;
			}

			if(this.pieces.length > 0){
				adjacentPieceBehind = this.pieces[i-1];
			}

			let candidatePieces = this.getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow);
			console.log(candidatePieces)
			let currentPiece = candidatePieces[ Math.floor(Math.random() * candidatePieces.length) ];
			console.log(candidatePieces)
			this.assignInitialPieceData(curImgX, curImgY, curCanvasX, curCanvasY, currentPiece, i);

			// reached last piece, start next row
			if(this.pieces.length % this.piecesPerSide === 0){
				curImgX = 0;
				curImgY += this.config.pieceSize;
				curCanvasX = boardLeft;
				curCanvasY += this.config.pieceSize;
				rowCount++;
			} else {
				curImgX += this.config.segmentSize;
				curCanvasX += this.config.segmentSize;
			}

			i++;

			if(currentPiece.type.indexOf('corner-br') > -1) done = true;
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

	drawBackground(){
		this.ctx.drawImage(this.BgImage, 0, 0, this.BgImage.width, this.BgImage.height, 0, 0, this.canvas.width, this.canvas.height);
	}

	isTopLeftCorner(piece) {
		return piece.type[0] === 0 && piece.type[3] === 0;
	}

	isTopSide(piece) {
		return piece.type[0] === 0;
	}

	isTopRightCorner(piece) {
		return piece.type[0] === 0 && piece.type[1] === 0;
	}

	isLeftSide(piece) {
		return piece.type[4] === 0;
	}

	isInnerPiece(piece) {
		return piece.type[0] !== 0 && piece.type[1] !== 0 && piece.type[2] !== 0 && piece.type[3] !== 0;
	}

	isRightSide(piece) {
		return piece.type[1] === 0;
	}

	isBottomLeftCorner(piece) {
		return piece.type[2] === 0 && piece.type[3] === 0;
	}

	isBottomSide(piece) {
		return piece.type[2] === 0;
	}

	isBottomRightCorner(piece) {
		return piece.type[1] === 0 && piece.type[2] === 0;
	}

	has(piece, connector, side){
		const c = connector === "plug" ? 1 : connector === "socket" ? -1 : null;
		const s = side === "top" ? 0 : side === "right" ? 1 : side === "bottom" ? 2 : side === "left" ? 3 : null;
		return c && s && piece.type[s] === c;
	}

	getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow){
		let candidatePieces = [];
		let pieces = null;

		// Top left corner piece
		if(!adjacentPieceBehind && !adjacentPieceAbove){
			return this.SpriteMap.filter((piece) => this.isTopLeftCorner(piece));
		}

		// First row pieces
		if(!adjacentPieceAbove){

			// Does lastPiece have a plug on its right side?
			let lastPieceHasRightPlug = has(adjacentPieceBehind, "plug", "right");
			// Does lastPiece have a socket on its right side?
			let lastPieceHasRightSocket = has(adjacentPieceBehind, "socket", "right");

			pieces = this.SpriteMap.filter( (o) => {
				if(endOfRow){
					return this.isRightSide(o);
				} else {
					return this.isTopSide(o);
				}
			});

			for(let i=0, l=pieces.length; i<l; i++){
				let iterateeHasLeftSocket = this.has(pieces[i], "socket", "left");
				let iterateeHasLeftPlug = this.has(pieces[i], "plug", "left");
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
			if(this.isTopRightCorner(adjacentPieceAbove) || this.isRightSide(adjacentPieceAbove)){
				pieces = SpriteMap.filter( (o) => this.isRightSide(o))
			}

			// Very last piece, should be corner bottom right
			if(this.isBottomRightCorner(adjacentPieceAbove)){
				pieces = SpriteMap.filter( (o) => this.isBottomRightCorner(o))
			}

			// First piece of each row, should be left side
			if(!finalRow && ((adjacentPieceBehind.type[0] === 0 && adjacentPieceBehind.type[1] === 0) || adjacentPieceBehind.type[1] === 0)){

				pieces = this.SpriteMap.filter( (o) => o.type[3] === 0);

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
					pieces = this.SpriteMap.filter( (o) => o.type.indexOf('corner-bl') > -1);

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
					pieces = this.SpriteMap.filter( (o) => o.type.indexOf('side-b') > -1);
				}

				if(adjacentPieceAbove.type.indexOf('side-r') > -1 && adjacentPieceBehind.type.indexOf('side-b') > -1){
					pieces = this.SpriteMap.filter( (o) => o.type.indexOf('corner-br') > -1);
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
				right: canvX + this.config.segmentSize,
				bottom: canvY + this.config.segmentSize,
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
		// return this.getCellByCoords(coords);
	}
}

export default Puzzly;
