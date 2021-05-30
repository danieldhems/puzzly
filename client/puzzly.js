import { SpriteMap, JigsawShapeSpans } from "./jigsaw.js";
import Utils from "./utils.js";
class Puzzly {

	constructor(canvasId, imageUrl, numPieces){
		this.config = {
			scale: 1,
			blowUp: true,
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
			jigsawSpriteConnectorSize: 30,
			jigsawSpriteConnectorDistanceFromCorner: 40,
			puzzleSize: {
				small: {
					piecesPerSideHorizontal: 10,
					piecesPerSideVertical: 7,
					pieceSize: 120,
				},
				medium: {
					piecesPerSideHorizontal: 20,
					piecesPerSideVertical: 15,
					pieceSize: 90,
				},
			},
			selectedPuzzleSize: null,
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
		
		// Base square size before connectors are applied
		this.config.pieceWidth = this.config.pieceHeight = this.SourceImage.width / this.config.piecesPerSide;

		this.config.connectorRatio = JigsawShapeSpans.small / 100 * this.config.jigsawSpriteConnectorSize;
		this.config.connectorSize = this.config.puzzleSize.small.pieceSize / 100 * this.config.connectorRatio;
		this.config.connectorDistanceFromCornerRatio = JigsawShapeSpans.small / 100 * this.config.jigsawSpriteConnectorDistanceFromCorner;
		this.config.connectorDistanceFromCorner = this.config.puzzleSize.small.pieceSize / 100 * this.config.connectorDistanceFromCornerRatio;

		this.config.selectedPuzzleSize = "small";

		console.log(this.config)
		
		this.makePieces();
		
		window.addEventListener('mousedown', (e) => {
			this.onMouseDown(e);
		});
	}

	getPieceWidthAndHeightWithConnectors(piece){
		let actualWidth, actualHeight;

		switch(piece._w){
			case JigsawShapeSpans.small:
				actualWidth = this.config.puzzleSize[this.config.selectedPuzzleSize].pieceSize;
				break;
			case JigsawShapeSpans.medium:
				actualWidth = this.config.puzzleSize[this.config.selectedPuzzleSize].pieceSize + this.config.connectorSize;
				break;
			case JigsawShapeSpans.large:
				actualWidth = this.config.puzzleSize[this.config.selectedPuzzleSize].pieceSize + (this.config.connectorSize * 2);
				break;
			default:;
		}

		switch(piece._h){
			case JigsawShapeSpans.small:
				actualHeight = this.config.puzzleSize[this.config.selectedPuzzleSize].pieceSize;
				break;
			case JigsawShapeSpans.medium:
				actualHeight = this.config.puzzleSize[this.config.selectedPuzzleSize].pieceSize + this.config.connectorSize;
				break;
			case JigsawShapeSpans.large:
				actualHeight = this.config.puzzleSize[this.config.selectedPuzzleSize].pieceSize + (this.config.connectorSize * 2);
				break;
			default:;
		}

		return {
			width: actualWidth,
			height: actualHeight,
		}
	}
	
	drawPiece(piece) {
		const canvasEl = document.createElement("canvas");
		document.body.appendChild(canvasEl)
		canvasEl.id = "canvas-" + piece._shape_id;
		canvasEl.setAttribute('data-jigsaw-type', piece.type.join(","))
		canvasEl.setAttribute('data-piece-id', piece.id)
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

	hasConnection(piece){
		if(Utils.isTopLeftCorner(piece)){
			const connectingPieceToRight = this.pieces.find((p) => p.id === 1);
			const connectingPieceToBottom = this.pieces[this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideHorizontal];

			// const boundingBoxToRight = piece.
		}
	}

	onMouseDown(e){
		this.movingPieceElement = e.target;
		this.movingPiece = this.pieces.find(p => p.id === parseInt(e.target.getAttribute("data-piece-id")));
		this.movingPieceElement.style.zIndex = 2;
		this.isMouseDown = true;

		let diffX = e.clientX - this.movingPieceElement.offsetLeft;
		let diffY = e.clientY - this.movingPieceElement.offsetTop;

		this.mouseMoveFunc = this.onMouseMove(diffX, diffY, this.movingPieceElement)
		
		window.addEventListener('mousemove', this.mouseMoveFunc);
		window.addEventListener('mouseup', this.onMouseUp.bind(this));
	}
	
	onMouseUp(){
		this.movingPieceElement.style.zIndex = 1;
		this.isMouseDown = false;
		const connection = this.checkConnections(this.movingPiece);

		if(connection){
			this.snapPiece(this.movingPieceElement, connection)
		}
		window.removeEventListener('mousemove', this.mouseMoveFunc)
	}

	onMouseMove(diffX, diffY, dragEl){	
		return function(e){
			console.log(this.checkConnections(this.movingPiece))
			dragEl.style.left = e.clientX - diffX + "px";
			dragEl.style.top = e.clientY - diffY + "px";
			this.updatePiecePosition(dragEl)
		}.bind(this)
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
			pieceAboveHasSocket = Utils.has(pieceAbove, "socket", "bottom");
			pieceAboveHasPlug = Utils.has(pieceAbove, "plug", "bottom");
		}

		if(pieceBehind){
			pieceBehindHasSocket = Utils.has(pieceBehind, "socket", "right");
			pieceBehindHasPlug = Utils.has(pieceBehind, "plug", "right");
		}

		let thisPieceHasLeftSocket,
			thisPieceHasLeftPlug,
			thisPieceHasTopSocket,
			thisPieceHasTopPlug;

		const candidatePieces = [];

		for(let i=0, l=pieces.length; i<l; i++){
			if(pieceAbove){
				thisPieceHasTopSocket = Utils.has(pieces[i], "socket", "top");
				thisPieceHasTopPlug = Utils.has(pieces[i], "plug", "top");
			}

			if(pieceBehind){
				thisPieceHasLeftSocket = Utils.has(pieces[i], "socket", "left");
				thisPieceHasLeftPlug = Utils.has(pieces[i], "plug", "left");
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

		const piecesPerSideHorizontal = this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideHorizontal;
		const piecesPerSideVertical = this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideVertical;

		while(!done){
			// All pieces not on top row
			if(this.pieces.length >= piecesPerSideHorizontal){
				adjacentPieceAbove = this.pieces[this.pieces.length - piecesPerSideHorizontal];
			}

			// Last piece in row, next piece should be a corner or right side
			if(this.pieces.length > 1 && this.pieces.length % (piecesPerSideHorizontal - 1) === 0){
				endOfRow = true;
			} else {
				endOfRow = false;
			}

			if(rowCount === piecesPerSideVertical - 1){
				finalRow = true;
			}

			const previousPiece = this.pieces[this.pieces.length-1];
			if(this.pieces.length > 0 && !Utils.isTopRightCorner(previousPiece) && !Utils.isRightSide(previousPiece)){
				adjacentPieceBehind = this.pieces[i-1];
			}

			if(Utils.isRightSide(previousPiece)){
				adjacentPieceBehind = null;
			}

			let candidatePieces = this.getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow);
			let currentPiece = candidatePieces[ Math.floor(Math.random() * candidatePieces.length) ];
			currentPiece = this.assignInitialPieceData(curImgX, curImgY, curPageX, curPageY, currentPiece, i);
			this.pieces.push(currentPiece);
			this.drawPiece(currentPiece);

			const pieceSize = this.config.puzzleSize[this.config.selectedPuzzleSize].pieceSize;

			// reached last piece, start next row
			if(this.pieces.length % piecesPerSideHorizontal === 0){
				curImgX = 0;
				curPageX = boardLeft;
				
				const firstPieceOnRowAbove = this.pieces[this.pieces.length - piecesPerSideHorizontal];
				
				if(Utils.has(firstPieceOnRowAbove, "socket", "bottom")){
					curImgY += pieceSize - this.config.connectorSize;
					// curPageY += pieceSize - this.config.connectorSize;
				}
				
				if(Utils.has(firstPieceOnRowAbove, "plug", "bottom")){
					curImgY += pieceSize;
					// curPageY += pieceSize;
				}

				curPageY += pieceSize *1.5;
				rowCount++;

			} else {
				if(rowCount > 1){
					const nextPieceAbove = this.pieces[this.pieces.length - piecesPerSideHorizontal];

					if(Utils.has(currentPiece, "plug", "top") && Utils.has(nextPieceAbove, "plug", "bottom")){
						curImgY += this.config.connectorSize;
					} else if(Utils.has(currentPiece, "socket", "top") && Utils.has(nextPieceAbove, "socket", "bottom")){
						curImgY -= this.config.connectorSize;
					}
				}
				
				if(Utils.has(currentPiece, "socket", "right")){
					curImgX += currentPiece.imgW - this.config.connectorSize;
				} else if(Utils.has(currentPiece, "plug", "right")){
					curImgX += currentPiece.imgW - this.config.connectorSize;
				}

				curPageX += pieceSize * 1.5;
			}
			
			i++;

			if(Utils.isBottomRightCorner(currentPiece)) done = true;

		}

		this.assignPieceConnections();
	}

	getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow){
		// console.log("getting candidates")
		// console.log(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow)
		let pieces = [];

		// Top left corner piece
		if(!adjacentPieceBehind && !adjacentPieceAbove){
			return SpriteMap.filter((piece) => Utils.isTopLeftCorner(piece));
		}

		// First row pieces
		if(!adjacentPieceAbove){
			pieces = SpriteMap.filter( (o) => {
				if(endOfRow){
					return Utils.isTopRightCorner(o);
				} else {
					return Utils.isTopSide(o);
				}
			});

			return this.getCompatiblePieces(false, adjacentPieceBehind, pieces);
		}
		// All pieces after top row
		else {
			// Last piece of each row, should be right side
			if(Utils.isTopRightCorner(adjacentPieceAbove) || (!finalRow && Utils.isRightSide(adjacentPieceAbove))){
				pieces = SpriteMap.filter( (o) => Utils.isRightSide(o));
				return this.getCompatiblePieces(adjacentPieceAbove, adjacentPieceBehind, pieces)
			}
			
			// First piece of each row, should be left side
			if(Utils.isTopLeftCorner(adjacentPieceAbove) || (!finalRow && Utils.isLeftSide(adjacentPieceAbove))){
				pieces = SpriteMap.filter( (o) => Utils.isLeftSide(o));
				return this.getCompatiblePieces(adjacentPieceAbove, null, pieces)
			}
			
			// All middle pieces
			if((!finalRow && Utils.isInnerPiece(adjacentPieceAbove)) || Utils.isTopSide(adjacentPieceAbove)){
				pieces = SpriteMap.filter( (o) => Utils.isInnerPiece(o));
				return this.getCompatiblePieces(adjacentPieceAbove, adjacentPieceBehind, pieces)
			}

			if(finalRow && Utils.isLeftSide(adjacentPieceAbove)){
				pieces = SpriteMap.filter( (o) => Utils.isBottomLeftCorner(o));
				return this.getCompatiblePieces(adjacentPieceAbove, null, pieces)
			}
			
			if(finalRow && Utils.isInnerPiece(adjacentPieceAbove) && (Utils.isBottomLeftCorner(adjacentPieceBehind) || Utils.isBottomSide(adjacentPieceBehind))){
				pieces = SpriteMap.filter( (o) => Utils.isBottomSide(o));
				return this.getCompatiblePieces(adjacentPieceAbove, adjacentPieceBehind, pieces)
			}

			// Very last piece, should be corner bottom right
			if(Utils.isRightSide(adjacentPieceAbove) && Utils.isBottomSide(adjacentPieceBehind)){
				pieces = SpriteMap.filter( (o) => Utils.isBottomRightCorner(o));
				return this.getCompatiblePieces(adjacentPieceAbove, adjacentPieceBehind, pieces)
			}
		}
	}

	getConnectingPieceIds(piece){
		const pieceAboveId = piece.id - this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideHorizontal;
		const pieceBelowId = piece.id + this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideHorizontal;
		if(Utils.isTopLeftCorner(piece)){
			return {
				right: piece.id + 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isTopSide(piece)){
			return {
				left: piece.id - 1,
				right: piece.id + 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isTopRightCorner(piece)){
			return {
				left: piece.id - 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isLeftSide(piece)){
			return {
				top: pieceAboveId,
				right: piece.id + 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isInnerPiece(piece)){
			return {
				top: pieceAboveId,
				right: piece.id + 1,
				bottom: pieceBelowId,
				left: piece.id - 1
			}
		}
		if(Utils.isRightSide(piece)){
			return {
				top: pieceAboveId,
				left: piece.id - 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isBottomLeftCorner(piece)){
			return {
				top: pieceAboveId,
				right: piece.id + 1,
			}
		}
		if(Utils.isBottomSide(piece)){
			return {
				left: piece.id - 1,
				right: piece.id + 1,
			}
		}
		if(Utils.isBottomRightCorner(piece)){
			return {
				top: pieceAboveId,
				left: piece.id - 1,
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
			isSolved: false,
		}, piece);
	}

	assignPieceConnections(){
		this.pieces.forEach(p => p.connectsTo = this.getConnectingPieceIds(p));
	}

	getConnectorBoundingBox(piece, side){
		switch(side){
			case "left":
				return {
					top: piece.pageY + this.config.connectorDistanceFromCorner,
					right: piece.pageX + this.config.connectorSize,
					bottom: piece.pageY + this.config.connectorDistanceFromCorner + this.config.connectorSize,
					left: piece.pageX,
				}
			case "right":
				const points = {
					top: piece.pageY + this.config.connectorDistanceFromCorner,
					right: piece.pageX + piece.imgW,
					bottom: piece.pageY + this.config.connectorDistanceFromCorner + this.config.connectorSize,
					left: piece.pageX + piece.imgW - this.config.connectorSize,
				}
				return points;
			case "bottom":
				return {
					top: piece.pageY + piece.imgH - this.config.connectorSize,
					right: piece.pageX + piece.imgW - this.config.connectorDistanceFromCorner,
					bottom: piece.pageY + piece.imgH,
					left: piece.pageX + this.config.connectorDistanceFromCornere,
				}
			case "top":
				return {
					top: piece.pageY,
					right: piece.pageX + piece.imgW - this.config.connectorDistanceFromCorner,
					bottom: piece.pageY + this.config.connectorSize,
					left: piece.pageX + this.config.connectorDistanceFromCorner,
				}
		}
	}

	updatePiecePosition(el){
		const pid = parseInt(el.getAttribute('data-piece-id'));
		const piece = this.pieces.find(p => p.id === pid)
		piece.pageX = el.offsetLeft;
		piece.pageY = el.offsetTop;
	}

	checkConnections(piece){
		if(Utils.isTopLeftCorner(piece)){
			const targetPieceToRight = this.pieces.find(p => p.id === piece.id + 1);
			const targetPieceToBottom = this.pieces.find(p => p.id === piece.id + this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideHorizontal);
			// console.log(targetPieceToRight, targetPieceToBottom)
			
			const thisPieceRightConnectorBoundingBox = this.getConnectorBoundingBox(piece, "right");
			// console.log(thisPieceRightConnectorBoundingBox)
			const thisPieceBottomConnectorBoundingBox = this.getConnectorBoundingBox(piece, "bottom");
			
			const targetPieceToRightLeftSideConnectorBoundingBox = this.getConnectorBoundingBox(targetPieceToRight, "left");
			const targetPieceToBottomTopSideConnectorBoundingBox = this.getConnectorBoundingBox(targetPieceToBottom, "top");

			if(this.hasCollision(thisPieceRightConnectorBoundingBox, targetPieceToRightLeftSideConnectorBoundingBox)){
				return "right";
			}

			if(this.hasCollision(thisPieceBottomConnectorBoundingBox, targetPieceToBottomTopSideConnectorBoundingBox)){
				return "bottom";
			}

			return null;
		}
	}

	hasCollision(source, target){
		return (source.top >= target.top || source.bottom <= target.bottom) && source.right >= target.left && source.top <= target.bottom && source.right <= target.right;
	}

	getElementByPieceId(id){
		return document.querySelectorAll(`[data-piece-id='${id}']`)[0];
	}

	getPieceByElement(element){
		return this.pieces.find(p => p.id === parseInt(element.getAttribute("data-piece-id")))
	}

	getPieceById(id){
		return this.pieces.find(p => p.id === id);
	}

	snapPiece(el, connection){
		switch(connection){
			case "right":
				const thisPiece = this.getPieceByElement(el);
				const connectingPiece = this.getPieceById(thisPiece.id + 1);
				
				const leftPos = Utils.has(thisPiece, "plug", "right") ? connectingPiece.pageX - thisPiece.imgW + this.config.connectorSize : thisPiece.ingW;

				el.style.left = leftPos + "px";

				if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
					el.style.top = connectingPiece.pageY + "px";
				} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
					el.style.top = (connectingPiece.pageY - this.config.connectorSize) + "px";
				} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
					el.style.top = (connectingPiece.pageY + this.config.connectorSize) + "px";
				} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
					el.style.top = connectingPiece.pageY + "px";
				} else {
					el.style.top = connectingPiece.pageY + "px";
				}

		}
	}
}

export default Puzzly;
