import { SpriteMap, JigsawShapeSpans } from "./jigsaw.js";

class Puzzly {

	constructor(canvasId, imageUrl, numPieces){
		this.config = {
			scale: 1,
			blowUp: false,
			boardBoundary: 200,
			backgroundImages: [
				{
					name: 'wood',
					path: './bg-wood.jpg'
				}
			],
			numberOfPieces: numPieces,
			segmentSize: null,
			piecesPerSide: null,
			connectorSize: 22
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

		this.config.originalPictureSize = `${this.SourceImage.width} x ${this.SourceImage.width}`;
	
		// Width / height of a single segment based on the total area of the src image divided by the number of pieces the user wants
		this.config.piecesPerSide = 20;

		// Base square size before connectors are applied
		this.config.pieceWidth = this.config.pieceHeight = 100;

		console.log(this.config)
		
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

	getPieceWidthAndHeightWithConnectors(piece){
		let actualWidth, actualHeight;
		const connectorRatio = this.config.connectorSize / JigsawShapeSpans.small * 100;
		const connectorSize = this.config.pieceWidth / connectorRatio;
		console.log(connectorRatio, connectorSize)

		switch(piece._w){
			case JigsawShapeSpans.small:
				actualWidth = this.config.pieceWidth;
				break;
			case JigsawShapeSpans.medium:
				actualWidth = this.config.pieceWidth + connectorSize;
				break;
			case JigsawShapeSpans.large:
				actualWidth = this.config.pieceWidth + (connectorSize * 2);
				break;
			default:;
		}

		switch(piece._h){
			case JigsawShapeSpans.small:
				actualHeight = this.config.pieceHeight;
				break;
			case JigsawShapeSpans.medium:
				actualHeight = this.config.pieceHeight + connectorSize;
				break;
			case JigsawShapeSpans.large:
				actualHeight = this.config.pieceHeight + (connectorSize * 2);
				break;
			default:;
		}

		return {
			width: actualWidth,
			height: actualHeight,
		}
	}
	
	drawPiece(piece) {
		console.log(piece)
		const canvasEl = document.createElement("canvas");
		document.body.appendChild(canvasEl)
		canvasEl.id = "canvas-" + piece._shape_id;
		canvasEl.setAttribute('data-jigsaw-type', piece.type.join(","))
		canvasEl.setAttribute('data-imgX', piece.imgX)
		canvasEl.setAttribute('data-imgy', piece.imgY)
		canvasEl.width = piece.imgW;
		canvasEl.height = piece.imgH;
		canvasEl.style.position = "absolute";

		canvasEl.style.left = piece.pageX + "px";
		canvasEl.style.top = piece.pageY + "px";

		const cvctx = canvasEl.getContext("2d");

		cvctx.drawImage(
			this.SourceImage,
			piece.imgX,
			piece.imgY,
			piece.imgW,
			piece.imgH,
			0,
			0,
			piece.imgW,
			piece.imgH,
		);
		cvctx.globalCompositeOperation = 'destination-atop';
		cvctx.drawImage(
			this.JigsawSprite,
			piece.x,
			piece.y,
			piece._w,
			piece._h,
			0, 
			0, 
			piece.imgW,
			piece.imgH,
		);
	}



	onMouseDown(e){
		this.movingPiece = e.target;
		this.movingPiece.style.zIndex = 2;
		this.isMouseDown = true;
	}
	
	onMouseUp(){
		this.movingPiece.style.zIndex = 1;
		this.movingPiece = null;
		this.isMouseDown = false;
	}

	onMouseMove(e){
		if(this.isMouseDown){
			let newX = e.clientX - (parseInt(this.movingPiece.style.left) - e.clientX) + "px";
			let newY = e.clientY - (parseInt(this.movingPiece.style.top) - e.clientY) + "px";
			this.movingPiece.style.left = newX;
			this.movingPiece.style.top = newY;
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

	getCompatiblePieces(pieceAbove, pieceBehind, pieces){
		let pieceAboveHasPlug,
			pieceAboveHasSocket,
			pieceBehindHasPlug,
			pieceBehindHasSocket;

		if(pieceAbove){
			pieceAboveHasSocket = this.has(pieceAbove, "socket", "bottom");
			pieceAboveHasPlug = this.has(pieceAbove, "plug", "bottom");
		}

		if(pieceBehind){
			pieceBehindHasSocket = this.has(pieceBehind, "socket", "right");
			pieceBehindHasPlug = this.has(pieceBehind, "plug", "right");
		}

		let thisPieceHasLeftSocket,
			thisPieceHasLeftPlug,
			thisPieceHasTopSocket,
			thisPieceHasTopPlug;

		const candidatePieces = [];

		for(let i=0, l=pieces.length; i<l; i++){
			if(pieceAbove){
				thisPieceHasTopSocket = this.has(pieces[i], "socket", "top");
				thisPieceHasTopPlug = this.has(pieces[i], "plug", "top");
			}

			if(pieceBehind){
				thisPieceHasLeftSocket = this.has(pieces[i], "socket", "left");
				thisPieceHasLeftPlug = this.has(pieces[i], "plug", "left");
			}
			
			if(pieceAbove && !pieceBehind){
				if(pieceAboveHasSocket && thisPieceHasTopPlug){
					candidatePieces.push(pieces[i]);
				} else if(pieceAboveHasPlug && thisPieceHasTopSocket){
					candidatePieces.push(pieces[i]);
				}
			}

			if(!pieceAbove && pieceBehind){
				if(pieceBehindHasPlug && thisPieceHasLeftSocket){
					candidatePieces.push(pieces[i]);
				} else if(pieceBehindHasSocket && thisPieceHasLeftPlug){
					candidatePieces.push(pieces[i]);
				}
			}

			if(pieceAbove && pieceBehind){
				if(pieceBehindHasSocket && thisPieceHasLeftPlug && pieceAboveHasPlug && thisPieceHasTopSocket){
					candidatePieces.push(pieces[i]);
				} else if(pieceBehindHasPlug && thisPieceHasLeftSocket && pieceAboveHasSocket && thisPieceHasTopPlug){
					candidatePieces.push(pieces[i]);
				} else if(pieceBehindHasSocket && thisPieceHasLeftPlug && pieceAboveHasSocket && thisPieceHasTopPlug){
					candidatePieces.push(pieces[i]);
				} else if(pieceBehindHasPlug && thisPieceHasLeftSocket && pieceAboveHasPlug && thisPieceHasTopSocket){
					candidatePieces.push(pieces[i]);
				}
			}
		}

		return candidatePieces;
	}

	makePieces(){

		var boardLeft = this.canvas.offsetLeft + this.config.boardBoundary;
		var boardTop = this.canvas.offsetTop + this.config.boardBoundary;

		// prepare draw options
		var curImgX = 0;
		var curImgY = 0;
		var curPageX = boardLeft;
		var curPageY = boardTop;

		let done = false;
		let i=0;

		let adjacentPieceBehind = null;
		let adjacentPieceAbove = null;
		let endOfRow = false;
		let rowCount = 1;
		let finalRow = false;

		while(!done){
			// All pieces not on top row
			if(this.pieces.length > this.config.piecesPerSide - 1){
				adjacentPieceAbove = this.pieces[this.pieces.length - this.config.piecesPerSide];
			}

			// Last piece in row, next piece should be a corner or right side
			if(this.pieces.length > 1 && this.pieces.length % (this.config.piecesPerSide - 1) === 0){
				endOfRow = true;
			} else {
				endOfRow = false;
			}

			if(rowCount === this.config.piecesPerSide){
				finalRow = true;
			}

			if(this.pieces.length > 0){
				adjacentPieceBehind = this.pieces[i-1];
			}

			if(this.isRightSide(this.pieces[this.pieces.length-1])){
				adjacentPieceBehind = null;
			}

			let candidatePieces = this.getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow);
			let currentPiece = candidatePieces[ Math.floor(Math.random() * candidatePieces.length) ];
			currentPiece = this.assignInitialPieceData(curImgX, curImgY, curPageX, curPageY, currentPiece, i);

			this.pieces.push(currentPiece);
			this.drawPiece(currentPiece);

			// reached last piece, start next row
			if(this.pieces.length % this.config.piecesPerSide === 0){
				curImgX = 0;
				curImgY += currentPiece.imgH;
				curPageX = boardLeft;
				curPageY += this.config.pieceHeight;
				rowCount++;
			} else {
				if(this.has(currentPiece, "socket", "right")){
					curImgX += currentPiece.imgW;
				}
				if(this.has(currentPiece, "plug", "right")){
					curImgX += currentPiece.imgW - this.config.connectorSize
				}
				curPageX += this.config.pieceWidth;
			}

			if(this.isBottomRightCorner(currentPiece)) done = true;

			i++;
		}
	}

	isTopLeftCorner(piece) {
		return piece.type[0] === 0 && piece.type[3] === 0;
	}

	isTopSide(piece) {
		return piece.type[0] === 0 && piece.type[1] !== 0 && piece.type[3] !== 0;
	}

	isTopRightCorner(piece) {
		return piece.type[0] === 0 && piece.type[1] === 0;
	}

	isLeftSide(piece) {
		return piece.type[0] !== 0 && piece.type[2] !== 0 && piece.type[3] === 0;
	}

	isInnerPiece(piece) {
		return piece.type[0] !== 0 && piece.type[1] !== 0 && piece.type[2] !== 0 && piece.type[3] !== 0;
	}

	isRightSide(piece) {
		return piece && piece.type[0] !== 0 && piece.type[1] === 0 && piece.type[2] !== 0;
	}

	isBottomLeftCorner(piece) {
		return piece.type[2] === 0 && piece.type[3] === 0;
	}

	isBottomSide(piece) {
		return piece.type[1] !== 0 && piece.type[2] === 0 && piece.type[3] !== 0;
	}

	isBottomRightCorner(piece) {
		return piece && piece.type[1] === 0 && piece.type[2] === 0;
	}

	has(piece, connector, side){
		if(!connector || !side) return false;
		const c = connector === "plug" ? 1 : connector === "socket" ? -1 : null;
		const s = side === "top" ? 0 : side === "right" ? 1 : side === "bottom" ? 2 : side === "left" ? 3 : null;
		return piece.type[s] === c;
	}

	getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow){
		let pieces = [];

		// Top left corner piece
		if(!adjacentPieceBehind && !adjacentPieceAbove){
			return SpriteMap.filter((piece) => this.isTopLeftCorner(piece));
		}

		// First row pieces
		if(!adjacentPieceAbove){
			pieces = SpriteMap.filter( (o) => {
				if(endOfRow){
					return this.isTopRightCorner(o);
				} else {
					return this.isTopSide(o);
				}
			});

			return this.getCompatiblePieces(false, adjacentPieceBehind, pieces);
		}
		// All pieces after top row
		else {
			
			// Last piece of each row, should be right side
			if(this.isTopRightCorner(adjacentPieceAbove) || (!finalRow && this.isRightSide(adjacentPieceAbove))){
				pieces = SpriteMap.filter( (o) => this.isRightSide(o));
				return this.getCompatiblePieces(adjacentPieceAbove, adjacentPieceBehind, pieces)
			}
			
			// First piece of each row, should be left side
			if(this.isTopLeftCorner(adjacentPieceAbove) || (!finalRow && this.isLeftSide(adjacentPieceAbove))){
				pieces = SpriteMap.filter( (o) => this.isLeftSide(o));
				return this.getCompatiblePieces(adjacentPieceAbove, null, pieces)
			}
			
			// All middle pieces
			if((!finalRow && this.isInnerPiece(adjacentPieceAbove)) || this.isTopSide(adjacentPieceAbove)){
				pieces = SpriteMap.filter( (o) => this.isInnerPiece(o));
				return this.getCompatiblePieces(adjacentPieceAbove, adjacentPieceBehind, pieces)
			}

			if(finalRow && this.isLeftSide(adjacentPieceAbove)){
				pieces = SpriteMap.filter( (o) => this.isBottomLeftCorner(o));
				return this.getCompatiblePieces(adjacentPieceAbove, null, pieces)
			}
			
			if(this.isInnerPiece(adjacentPieceAbove) && (this.isBottomLeftCorner(adjacentPieceBehind) || this.isBottomSide(adjacentPieceBehind))){
				pieces = SpriteMap.filter( (o) => this.isBottomSide(o));
				return this.getCompatiblePieces(adjacentPieceAbove, adjacentPieceBehind, pieces)
			}

			// Very last piece, should be corner bottom right
			if(this.isRightSide(adjacentPieceAbove) && this.isBottomSide(adjacentPieceBehind)){
				pieces = SpriteMap.filter( (o) => this.isBottomRightCorner(o));
				return this.getCompatiblePieces(adjacentPieceAbove, adjacentPieceBehind, pieces)
			}
		}
	}

	assignInitialPieceData(imgX, imgY, canvX, canvY, piece, i){
		const pieceDimensions = this.getPieceWidthAndHeightWithConnectors(piece);

		return Object.assign({
			id: i,
			imgX: imgX,
			imgY: imgY,
			imgW: pieceDimensions.width,
			imgH: pieceDimensions.height,
			pageX: this.config.blowUp ? canvX + 20 : canvX,
			pageY: this.config.blowUp ? canvY + 20 : canvY,
			isSolved: false
		}, piece);
	}

	hasCollision(source, target){
		return source.x > target.boundingBox.left && source.x < target.boundingBox.right && source.y < target.boundingBox.bottom && source.y > target.boundingBox.top;
	}
}

export default Puzzly;
