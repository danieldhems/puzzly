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
		this.groupCounter = 0;
		this.movingPieces = [];

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
		canvasEl.className = "puzzle-piece";
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

	onMouseDown(e){
		if(e.target.className === "puzzle-piece"){
			const thisPiece = this.pieces.find(p => p.id === parseInt(e.target.getAttribute("data-piece-id")));
			if(thisPiece.group !== undefined){
				this.pieces.filter(p => {
					let element, diffX, diffY;

					if(p.group === thisPiece.group){
						element = this.getElementByPieceId(p.id);
						diffX = e.clientX - element.offsetLeft;
						diffY = e.clientY - element.offsetTop;
						
						this.movingPieces.push({
							...p,
							diffX,
							diffY,
						})
					}
				});

			} else {
				this.movingPieces = [{
					...thisPiece,
					diffX: e.clientX - e.target.offsetLeft,
					diffY: e.clientY - e.target.offsetTop,
				}]
			}

			this.mouseMoveFunc = this.onMouseMove(this.movingPieces)
			
			// this.movingPieceElement.style.zIndex = 2;
			this.isMouseDown = true;
	
			window.addEventListener('mousemove', this.mouseMoveFunc);
			window.addEventListener('mouseup', this.onMouseUp.bind(this));
		}
	}

	setElementAttribute(el, attr, value){
		el.setAttribute(attr, value);
	}

	updatePiecePositionsByDiff(diff, pieces){
		console.log(diff)
		pieces = pieces.forEach(p => {
			const diffTopOperand = diff.top.charAt(0);
			const diffTopValue = parseInt(diff.top)
			const diffLeftOperand = diff.left.charAt(0);
			const diffLeftValue = parseInt(diff.left)

			const element = this.getElementByPieceId(p.id);

			const newPosTop = diffTopOperand === "+" ? element.offsetTop + diffTopValue : element.offsetTop - diffTopValue;
			const newPosLeft = diffLeftOperand === "+" ? element.offsetLeft + diffLeftValue : element.offsetLeft - diffLeftValue;
			
			element.style.top = newPosTop + "px";
			element.style.left = newPosLeft + "px";
			
			return {
				...p,
				pageY: newPosTop,
				pageX: newPosLeft,
			}
		})
	}
	
	onMouseUp(e){
		const element = e.target;
		this.isMouseDown = false;
		let hasConnection = false, connection, i = 0;
		
		if(this.movingPieces.length > 1){
			while(!hasConnection){
				console.log("check", i)

				const piece = this.movingPieces[i];
				const element = this.getElementByPieceId(piece.id);
				connection = this.checkConnections(element);
				if(connection){
					const diff = this.snapPiece(element, connection)
					const trailingPieces = this.movingPieces.filter( p => p.id !== i);
					this.updatePiecePositionsByDiff(diff, trailingPieces);
					hasConnection = true;
				}
				i++;
			}
		} else {
			connection = this.checkConnections(element);
			if(connection){
				this.snapPiece(element, connection);
			}
			
			const newPos = {
				top: element.offsetTop,
				left: element.offsetLeft,
			}
			
			const piece = this.getPieceByElement(element);
			this.updatePiecePosition(element)
		}

		this.movingPieces = [];

		window.removeEventListener('mousemove', this.mouseMoveFunc)
	}

	onMouseMove(piecesToMove){
		return function(e){
			piecesToMove.forEach( p => {
				const element = this.getElementByPieceId(p.id);
				const newPosTop = e.clientY - p.diffY;
				const newPosLeft = e.clientX - p.diffX;
				element.style.top = newPosTop + "px";
				element.style.left = newPosLeft + "px";
				this.updatePiecePosition(element)
			})
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
				curImgY = firstPieceOnRowAbove.imgY + firstPieceOnRowAbove.imgH - this.config.connectorSize;

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
				return {
					top: piece.pageY + this.config.connectorDistanceFromCorner,
					right: piece.pageX + piece.imgW,
					bottom: piece.pageY + this.config.connectorDistanceFromCorner + this.config.connectorSize,
					left: piece.pageX + piece.imgW - this.config.connectorSize,
				}
			case "bottom":
				const hasRightPlug = Utils.has(piece, "plug", "right");
				const hasLeftPlug = Utils.has(piece, "plug", "left");
				return {
					top: piece.pageY + piece.imgH - this.config.connectorSize,
					right: piece.pageX + piece.imgW - (hasRightPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner),
					bottom: piece.pageY + piece.imgH,
					left: piece.pageX + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner),
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
		const piece = this.pieces.find(p => p.id === pid);
		piece.pageX = el.offsetLeft;
		piece.pageY = el.offsetTop;
	}

	checkConnections(el){
		const piece = this.getPieceByElement(el);
		const hasRightConnector = Utils.has(piece, "plug", "right") || Utils.has(piece, "socket", "right");
		const hasBottomConnector = Utils.has(piece, "plug", "bottom") || Utils.has(piece, "socket", "bottom");
		const hasLeftConnector = Utils.has(piece, "plug", "left") || Utils.has(piece, "socket", "left");
		const hasTopConnector = Utils.has(piece, "plug", "top") || Utils.has(piece, "socket", "top");
		
		const shouldCompare = targetPiece => piece.group === undefined || piece.group !== targetPiece.group;

		if(hasRightConnector){
			const targetPiece = this.pieces.find(p => p.id === piece.id + 1);
			if(shouldCompare(targetPiece)){
				const thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(piece, "right");
				const targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetPiece, "left");

				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					console.log("right")
					return "right";
				}
			}
		}

		if(hasBottomConnector){
			const targetPiece = this.pieces.find(p => p.id === piece.id + this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideHorizontal);

			if(shouldCompare(targetPiece)){
				const thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(piece, "bottom");
				const targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetPiece, "top");

				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					console.log("bottom")
					return "bottom";
				}
			}
		}

		if(hasLeftConnector){
			const targetPiece = this.pieces.find(p => p.id === piece.id - 1);

			if(shouldCompare(targetPiece)){
				const thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(piece, "left");
				const targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetPiece, "right");

				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					console.log("left")
					return "left";
				}
			}
		}

		if(hasTopConnector){
			const targetPiece = this.pieces.find(p => p.id === piece.id - this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideHorizontal);

			if(shouldCompare(targetPiece)){
				const thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(piece, "top");
				const targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetPiece, "bottom");

				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					console.log("top")
					return "top";
				}
			}
		}
	}

	hasCollision(source, target){
		return !(source.left >= target.right || source.top >= target.bottom || 
		source.right <= target.left || source.bottom <= target.top);
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
		let thisPiece, connectingPiece, newPos = {}, oldPos = {};

		thisPiece = this.getPieceByElement(el);
		oldPos.top = thisPiece.pageY;
		oldPos.left = thisPiece.pageX;

		switch(connection){
			case "right":
				connectingPiece = this.getPieceById(thisPiece.id + 1);

				newPos.left = connectingPiece.pageX - thisPiece.imgW + this.config.connectorSize,
				el.style.left = newPos.left + "px";

				if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
					newPos.top = connectingPiece.pageY;
				} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
					newPos.top = (connectingPiece.pageY - this.config.connectorSize);
				} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
					newPos.top = (connectingPiece.pageY + this.config.connectorSize);
				} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
					newPos.top = connectingPiece.pageY;
				} else {
					newPos.top = connectingPiece.pageY;
				}

				el.style.top = newPos.top + "px";

				break;

			case "left":
				connectingPiece = this.getPieceById(thisPiece.id - 1);

				newPos.left = connectingPiece.pageX + connectingPiece.imgW - this.config.connectorSize,
				el.style.left = newPos.left + "px";

				if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
					newPos.top = connectingPiece.pageY;
				} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
					newPos.top = (connectingPiece.pageY - this.config.connectorSize);
				} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
					newPos.top = (connectingPiece.pageY + this.config.connectorSize);
				} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
					newPos.top = connectingPiece.pageY;
				} else {
					newPos.top = connectingPiece.pageY;
				}

				el.style.top = newPos.top + "px";

				break;
			
			case "bottom":
				connectingPiece = this.getPieceById(thisPiece.id + this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideHorizontal);

				newPos.top = connectingPiece.pageY - thisPiece.imgH + this.config.connectorSize;
				el.style.top = newPos.top + "px";

				if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
					newPos.left = connectingPiece.pageX;
				} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
					newPos.left = (connectingPiece.pageX - this.config.connectorSize);
				} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
					newPos.left = (connectingPiece.pageX + this.config.connectorSize);
				} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
					newPos.left = connectingPiece.pageX;
				} else {
					newPos.left = connectingPiece.pageX;
				}

				el.style.left = newPos.left + "px";

				break;

			case "top":
				connectingPiece = this.getPieceById(thisPiece.id - this.config.puzzleSize[this.config.selectedPuzzleSize].piecesPerSideHorizontal);

				newPos.top = connectingPiece.pageY + connectingPiece.imgH - this.config.connectorSize
				el.style.top = newPos.top + "px";

				if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
					newPos.left = connectingPiece.pageX;
				} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
					newPos.left = (connectingPiece.pageX - this.config.connectorSize);
				} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
					newPos.left = (connectingPiece.pageX + this.config.connectorSize);
				} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
					newPos.left = connectingPiece.pageX;
				} else {
					newPos.left = connectingPiece.pageX;
				}

				el.style.left = newPos.left + "px";
				
				break;
		}
		
		this.updatePiecePosition(el);
	
		if(thisPiece.group === undefined && connectingPiece.group === undefined){
			this.createGroup(thisPiece, connectingPiece);
		} else {
			this.addToGroup(thisPiece, connectingPiece.group)
		}

		const diff = {
			top: oldPos.top < newPos.top
				? `+${newPos.top - oldPos.top}`
				: `-${oldPos.top - newPos.top}`,
			left: oldPos.left < newPos.left
				? `+${newPos.left - oldPos.left}`
				: `-${oldPos.left - newPos.left}`,
		}

		return diff;
	}

	createGroup(pieceA, pieceB){
		console.log("create group")
		const groupId = this.groupCounter++
		pieceA.group = pieceB.group = groupId;
		this.setElementAttribute(this.getElementByPieceId(pieceA.id), "data-group", groupId)
		this.setElementAttribute(this.getElementByPieceId(pieceB.id), "data-group", groupId)
	}
	
	addToGroup(piece, group){
		piece.group = group;
		const pieces = this.pieces.filter(p => p.group === piece.group);
		pieces.forEach(p => {
			p.group = group;
			this.setElementAttribute(this.getElementByPieceId(piece.id), "data-group", group)
		})
	}
}

export default Puzzly;
