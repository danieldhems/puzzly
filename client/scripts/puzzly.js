import Utils from "./utils.js";

/** 
 * Puzzly
 * 
*/

class Puzzly {
	constructor(canvasId, puzzleId, config){
		Object.assign(this, {
			...config,
			debug: true,
			drawBoundingBox: false,
			showDebugInfo: false,
			backgroundImages: [
				{
					name: 'wood',
					path: './bg-wood.jpg'
				}
			],
			jigsawSpriteConnectorSize: 42,
			jigsawSpriteConnectorDistanceFromCorner: 43,
			piecesPerSideHorizontal: config.selectedShape === 'Rectangle' ? config.piecesPerSideHorizontal : Math.sqrt(config.selectedNumPieces),
			piecesPerSideVertical: config.selectedShape === 'Rectangle' ? config.piecesPerSideVertical : Math.sqrt(config.selectedNumPieces),
			drawOutlines: config.drawOutlines || false,
			drawSquares: false,
		});

		console.log(this)

		this.pieces = config.pieces;

		// alert(JSON.stringify(this.config))

		// this.cropOffsetX = config.crop.selectedOffsetX;
		// this.cropOffsetY = config.crop.selectedOffsetY;

		this.localStorageStringReplaceKey = "{}";
		this.LOCAL_STORAGE_PUZZLY_PROGRESS_KEY = `Puzzly_ID${this.localStorageStringReplaceKey}_progress`;
		this.LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY = `Puzzly_ID${this.localStorageStringReplaceKey}_lastSave`;

		this.puzzleId = puzzleId;
		this.movingPiece = null;

		this.groups = {};

		this.highlightConnectingPieces = config.debugOptions.highlightConnectingPieces;
		this.noDispersal = config.debugOptions.noDispersal;

		this.currentZIndex = 3;

		this.isMobile = Utils.isMobile();

		this.pieceSectors = [];
		this.usedPieceSectors = [];
		this.sectors = {};

		this.collisionTolerance = 30;

		this.isMovingSinglePiece = false;
		this.movingElement = null;
		this.puzzleId = puzzleId;
		this.progress = config.pieces || [];
		
		this.innerPiecesVisible = config.innerPiecesVisible !== undefined ? config.innerPiecesVisible : true;
		this.movingPieces = [];
		this.loadedAssets = [];
		this.SourceImage = new Image();
		this.SourceImage.src = config.fullSizePath;
		this.sprite = new Image();
		this.sprite.src = config.spritePath;

		this.canvas = document.getElementById(canvasId);
		this.boardAreaEl = document.getElementById("boardArea");

		this.interactionEventDown = Utils.isMobile() ? "touchstart" : "mousedown";
		this.interactionEventUp = Utils.isMobile() ? "touchend" : "mouseup";
		this.interactionEventMove = Utils.isMobile() ? "touchmove" : "mousemove";

		this.clickSound = new Audio('./mixkit-plastic-bubble-click-1124.wav');

		this.ControlsEl = document.getElementById('controls');
		this.ControlsEl.style.display = 'block';

		this.fullImageViewerEl = document.getElementById('full-image-viewer');
		this.previewBtn = document.getElementById('preview');
		this.previewBtnShowLabel = document.getElementById('preview-show');
		this.previewBtnHideLabel = document.getElementById('preview-hide');

		this.filterBtn = document.getElementById('filter-pieces');
		this.filterBtnOffLabel = document.getElementById('inner-pieces-on');
		this.filterBtnOnLabel = document.getElementById('inner-pieces-off');
		
		this.soundsBtn = document.getElementById('sound-toggle');
		this.soundsBtnOnLabel = document.getElementById('sounds-on');
		this.soundsBtnOffLabel = document.getElementById('sounds-off');
		this.debugInfoWindow = document.getElementById('debug-info');

		this.sendToEdgeShuffleBtn = document.getElementById('shuffle-pieces');
		this.sendToEdgeNeatenBtn = document.getElementById('neaten-pieces');

		this.ControlsElHandle = document.getElementById('controls-handle');
		this.ControlsElPanel = document.getElementById('controls-panel');
		this.ControlsElPanelIsOpen = false;

		this.ControlsElHandle.addEventListener(this.interactionEventDown, this.onControlsHandleClick.bind(this))

		this.sendToEdgeShuffleBtn.addEventListener(this.interactionEventDown, e => {
			const allPieces = this.allPieces();
			this.shuffleArray(Array.from(allPieces).filter(p => !this.getIsSolved(p) && !Utils.hasGroup(p)));
			this.randomisePiecePositions(pieces);
			this.save(allPieces);
		})

		this.sendToEdgeNeatenBtn.addEventListener(this.interactionEventDown, e => {
			let pieces = this.shuffleArray(Array.from(this.allPieces()).filter(p => !this.getIsSolved(p) && !Utils.hasGroup(p)));
			this.arrangePieces(pieces);
		})

		if(this.innerPiecesVisible){
			this.filterBtnOnLabel.style.display = 'block';
			this.filterBtnOffLabel.style.display = 'none';
		} else {
			this.filterBtnOffLabel.style.display = 'block';
			this.filterBtnOnLabel.style.display = 'none';
		}

		this.soundsEnabled = true;
		this.soundsBtnOnLabel.style.display = 'none';
		this.isPreviewActive = false;

		this.previewBtn.addEventListener(this.interactionEventDown, this.togglePreviewer.bind(this))
		this.filterBtn.addEventListener(this.interactionEventDown, this.toggleInnerPieces.bind(this))
		this.soundsBtn.addEventListener(this.interactionEventDown, this.toggleSounds.bind(this))

		this.DATA_ATTR_KEYS = [
			'piece-id', 'piece-id-in-persistence', 'puzzle-id', 'imgx', 'imgy', 'imgw', 'imgh', 'num-pieces-from-top-edge', 'num-pieces-from-left-edge', 'jigsaw-type', 'connections', 'connects-to', 'is-inner-piece', 'is-solved', 'group', 'solvedx', 'solvedy'
		];

		const assets = [
			this.SourceImage,
			this.sprite,
		];

		this.zoomThrottleRate = 7;

		window.addEventListener(this.interactionEventMove, (e) => {
			if(e.touches?.length === 2){
				e.preventDefault();
				const dist = this.getDistanceBetweenTouches(e);
				let moved;
				
				if(this.initialTouchesDistance > dist){
					moved = (this.initialTouchesDistance - dist / this.zoomThrottleRate).toFixed(6) / 5000;
					this.zoomLevel = this.zoomLevel - moved > 1 ? this.zoomLevel - moved : this.zoomLevel;
				} else {
					moved = (dist - this.initialTouchesDistance / this.zoomThrottleRate).toFixed(6) / 5000;
					this.zoomLevel += moved;
				}

				if(moved > 0){
					this.canvas.style.transform = `scale(${this.zoomLevel})`;
				}
			} else {
				this.mouseMoveFunc
			}
		}, { passive: false });

		// here
		this.loadAssets(assets).then( () => {
			this.init()
		})
	}

	getDistanceBetweenTouches(e){
		return e.touches?.length === 2 && Math.hypot(
			e.touches[0].pageX - e.touches[1].pageX,
			e.touches[0].pageY - e.touches[1].pageY
		)
	}

	onControlsHandleClick(e){
		if(this.ControlsElPanelIsOpen){
			this.ControlsElPanel.classList.add('is-hidden');
			this.ControlsElPanelIsOpen = false;
		} else {
			this.ControlsElPanel.classList.remove('is-hidden');
			this.ControlsElPanelIsOpen = true;
		}
	}

	getUniqueLocalStorageKeyForPuzzle(key){
		return this[key].replace(this.localStorageStringReplaceKey, this.puzzleId)
	}

	getApplicablePersistence(progressFromServer, lastSaveTimeFromServer){
		const progressKey = this.getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_PROGRESS_KEY");
		const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY");
		const hasLocalStorageSupport = window.localStorage;
		const progressInLocalStorage = hasLocalStorageSupport && localStorage.getItem(progressKey);
		const lastSaveInLocalStorage = hasLocalStorageSupport && localStorage.getItem(lastSaveKey);

		let availableStorage;
		const storage = {};

		if(!lastSaveTimeFromServer && !lastSaveInLocalStorage){
			console.info('Puzzly: No saved data found')
			return;
		}

		if(progressFromServer && progressFromServer.length){
			if(lastSaveInLocalStorage && lastSaveInLocalStorage > lastSaveTimeFromServer){
				availableStorage = 'local';
			} else {
				availableStorage = 'server';
			}
		} else if(lastSaveInLocalStorage && progressInLocalStorage.length){
			availableStorage = 'local';
		}

		switch(availableStorage){
			case 'server':
				console.info(`[Puzzly] Restoring from server-side storage`);
				storage.pieces = progressFromServer;
				storage.latestSave = parseInt(lastSaveTimeFromServer);
				break;
			case 'local':
				console.info(`[Puzzly] Restoring from local storage`);
				storage.pieces = JSON.parse(progressInLocalStorage);
				storage.latestSave = parseInt(lastSaveInLocalStorage);
				break;
		}

		return storage;
	}

	init(){
		console.log(this)

		this.zoomLevel = 1;

		this.boardHeight = this.boardWidth = Math.ceil(window.innerHeight / 100 * 60);
		const boardVerticalSpace = window.innerHeight / 100 * 20;
		const leftPos = window.innerWidth / 2 - this.boardHeight / 2;
		this.boardBoundingBox = {
			top: boardVerticalSpace,
			right: leftPos + this.boardHeight,
			left: leftPos,
			bottom: boardVerticalSpace + this.boardHeight,
			width: this.boardHeight,
			height: this.boardHeight,
		};

		this.boardSize = {
			width: this.boardHeight,
			height: this.boardHeight,
		}

		this.puzzleScale = this.boardWidth / this.selectedWidth * 100;

		// Requested piece size based on original image size
		this.originalPieceSize = this.originalImageSize.width / this.piecesPerSideHorizontal;
		// Board size percentage based on original image size
		// this.scaledPieceSizeRatio = this.boardWidth / this.originalImageSize.width * 100;
		this.pieceSize = this.boardWidth / this.piecesPerSideHorizontal;

		this.pieceScale = this.pieceSize / this.originalPieceSize;
		console.log('value to scale by', this.pieceScale)

		this.connectorDistanceFromCornerRatio = this.connectorRatio = 33;
		this.connectorSize = Math.ceil(this.originalPieceSize / 100 * this.connectorRatio);
		this.connectorTolerance = this.connectorSize / 100 * (50 - this.collisionTolerance / 2);

		this.connectorDistanceFromCorner = Math.ceil(this.originalPieceSize / 100 * this.connectorDistanceFromCornerRatio);

		this.largestPieceSpan = this.originalPieceSize + (this.connectorSize * 2);


		
		// this.canvas.style.width = this.getPxString(requiredWidth);
		// this.canvas.style.height = this.getPxString(requiredHeight);	
		
		this.canvasWidth = window.innerWidth;
		this.canvasHeight = window.innerHeight;
		
		this.drawBoardArea();

		this.boardTop = this.boardAreaEl.offsetTop;
		this.boardRight = this.boardAreaEl.offsetLeft + this.boardAreaEl.offsetWidth;
		this.boardBottom = this.boardAreaEl.offsetTop + this.boardAreaEl.offsetHeight;
		this.boardLeft = this.boardAreaEl.offsetLeft;
		this.boardWidth = this.boardAreaEl.offsetWidth;
		this.boardHeight = this.boardAreaEl.offsetHeight;

		this.makeSolvedCanvas();
		this.initiFullImagePreviewer();

		// this.setPageScale();

		// window.addEventListener("resize", this.setPageScale.bind(this));
		
		this.isFullImageViewerActive = false;

		const storage = this.getApplicablePersistence(this.pieces, this.lastSaveDate);

		if(storage?.pieces?.length > 0){
			storage.pieces.forEach(p => {
				this.drawPieceManually(p);
				if(p.group !== undefined && p.group !== null){
					this.groups[p.group]?.pieces ? this.groups[p.group].pieces.push(p) : this.groups[p.group] = { pieces: [p] };
				}
			});

			if(Object.keys(this.groups).length){
				for(let g in this.groups){
					this.drawPiecesIntoGroup(g, this.groups[g].pieces);
				}
			}

			this.initGroupContainerPositions(storage.pieces)
		} else {
			this.generatePieceSectorMap();
			this.piecePositionMap = this.shuffleArray(this.getRandomCoordsFromSectorMap());
			this.renderPieces(this.pieces);
			this.assignPieceConnections();

			this.save(this.allPieces())
		}

		// this.wrapPiecesAroundBoard();
		// this.arrangePieces()
		this.timeStarted = new Date().getTime();

		addEventListener("beforeunload", function(e) {
			this.updateElapsedTime();
		}.bind(this))
		
		this.innerPieces = document.querySelectorAll('.inner-piece');

		window.addEventListener(this.interactionEventDown, this.onMouseDown.bind(this));
		// window.addEventListener('gesturestart', this.onGestureStart.bind(this));

		const newPuzzleBtn = document.getElementById("js-create-new-puzzle");
		newPuzzleBtn.addEventListener(this.interactionEventDown, () => {
			window.location = "/";
		})

		navigator.permissions.query({name: "accelerometer"}).then((perm) => {
			const laSensor = new window.LinearAccelerationSensor({frequency: 60});
			laSensor.addEventListener("reading", e => {
				console.log("accelerating", e);
				this.acceleration = e;
			})
			laSensor.start();
		});

		this.acceleration = null;

		window.addEventListener('touchcancel', (e) => {
			this.movingPiece = null;
			this.movingElement = null;
			this.isTouching = false;
		})

		window.addEventListener(this.interactionEventUp, this.onMouseUp.bind(this));
		window.addEventListener('keydown', this.onKeyDown.bind(this));
	}

	renderPieces(pieces){
		pieces.forEach(p => this.renderJigsawPiece(p));
	}

	setPageScale(){
		this.currentScaleValue = this.fullPageScaleValue = this.zoomLevel = window.innerWidth / this.canvasWidth; 
		this.canvas.style.transformOrigin = "0 0";
		this.canvas.style.transform = `scale(${this.currentScaleValue})`;
	}

	toggleSounds(){
		this.soundsEnabled = this.soundsEnabled ? false : true;
		this.soundsBtnOffLabel.style.display = this.soundsEnabled ? 'block' : 'none';
		this.soundsBtnOnLabel.style.display = this.soundsEnabled ? 'none' : 'block';
	}

	updatePreviewerSizeAndPosition(){
		this.fullImageViewerEl.style.left = this.boardLeft * this.zoomLevel + 'px';
		this.fullImageViewerEl.style.top = this.boardTop * this.zoomLevel + 'px';
		this.fullImageViewerEl.style.width = this.boardWidth * this.zoomLevel + 'px';
		this.fullImageViewerEl.style.height = this.boardHeight * this.zoomLevel + 'px';
	}

	togglePreviewer(){
		if(this.isPreviewActive){
			this.fullImageViewerEl.style.display = 'none';
			this.previewBtnShowLabel.style.display = 'block';
			this.previewBtnHideLabel.style.display = 'none';
			this.isPreviewActive = false;
		} else {
			this.updatePreviewerSizeAndPosition();
			this.fullImageViewerEl.style.display = 'block';
			this.previewBtnShowLabel.style.display = 'none';
			this.previewBtnHideLabel.style.display = 'block';
			this.isPreviewActive = true;
		}
	}

	showPiece(el){
		el.style.display = 'block';
	}
	
	hidePiece(el){
		el.style.display = 'none';
	}

	toggleInnerPieces(){
		if(this.innerPiecesVisible){
			this.allPieces().forEach(piece => {
				const p = this.getPieceFromElement(piece, ['jigsaw-type', 'is-solved', 'group'])
				if(Utils.isInnerPiece(p) && !p.isSolved && !p.group){
					this.hidePiece(piece);
				}
			})
			this.innerPiecesVisible = false;
			this.filterBtnOffLabel.style.display = 'block';
			this.filterBtnOnLabel.style.display = 'none';
		} else {
			this.allPieces().forEach(piece => {
				const p = this.getPieceFromElement(piece, ['jigsaw-type',])
				if(Utils.isInnerPiece(p)){
					this.showPiece(piece);
				}
			})
			this.innerPiecesVisible = true;
			this.filterBtnOffLabel.style.display = 'none';
			this.filterBtnOnLabel.style.display = 'block';
		}

		this.saveInnerPieceVisibility(this.innerPiecesVisible);
	}

	saveInnerPieceVisibility(visible){
		fetch(`/api/toggleVisibility/${this.puzzleId}`, {
			method: 'put',
			headers: {
				'Content-Type': 'Application/json'
			},
			body: JSON.stringify({piecesVisible: visible})
		});
	}

	getConnectorSnapAdjustment(distance){
		if(distance.charAt(0) === '+'){
			return this.connectorSize + parseInt(distance.substr(1));
		} else {
			return this.connectorSize - parseInt(distance.substr(1));
		}
	}

	drawBoardArea(){
		const element = document.getElementById('boardArea');
		element.style.position = "absolute";
		element.style.top = this.boardBoundingBox.top + "px";
		element.style.left = this.boardBoundingBox.left + "px";
		element.style.border = "3px groove #222";
		element.style.width = this.boardSize.width + "px";
		element.style.height = this.boardSize.height + "px";
	}

	makeSolvedCanvas(){
		const solvedCnvContainer = document.getElementById('group-container-1111');
		solvedCnvContainer.style.top = this.getPxString(this.boardTop);
		solvedCnvContainer.style.left = this.getPxString(this.boardLeft);
		solvedCnvContainer.style.width = this.boardWidth;
		solvedCnvContainer.style.height = this.boardHeight;
		const solvedCnv = document.getElementById('group-canvas-1111');
		solvedCnv.width = this.boardWidth;
		solvedCnv.height = this.boardHeight;
		solvedCnv.style.width = this.getPxString(this.boardWidth);
		solvedCnv.style.height = this.getPxString(this.boardHeight);
	}
	
	onKeyDown(event){
		// https://stackoverflow.com/questions/995914/catch-browsers-zoom-event-in-javascript
	
		if ((event.ctrlKey || event.metaKey) && (event.which === 61 || event.which === 107 || event.which === 173 || event.which === 109  || event.which === 187  || event.which === 189 || event.which === 48) ) {
			event.preventDefault();
			
			// Plus key
			if(event.which === 187){
				this.zoomLevel += 1;
			}

			// Minus key
			if(event.which === 189 && this.zoomLevel > 1){
				this.zoomLevel -= 1;
			}

			// "0" Number key
			if(event.which === 48){
				this.zoomLevel = 1;
			}
			
			if(this.isPreviewActive){
				this.updatePreviewerSizeAndPosition();
			}
	
			this.canvas.style.transform = `scale(${this.zoomLevel})`;
			this.canvas.style.transformOrigin = "50% 50%";
		}
	}

	getRandomCoordsFromSectorMap(){
		return this.pieceSectors.map(s => ({
			x: this.getRandomInt(s.x, s.x + s.w),
			y: this.getRandomInt(s.y, s.y + s.h)
		}))
	}

	randomisePiecePositions(pieces){
		pieces.forEach((p, i) => {
			this.animatePiece(el, randX, randY);
		})
	}

	animatePiece(el, x, y){
		el.keyframes = {
			top: this.getPxString(y),
			left: this.getPxString(x),
		};

		el.animProps = {
			duration: 300,
			easing: "ease-out",
			iterations: 1
		  }
		 
		var animationPlayer = el.animate(el.keyframes, el.animProps);
		animationPlayer.onfinish = () => {
			el.style.top = this.getPxString(y);
			el.style.left = this.getPxString(x);
		}
	}

	updateElapsedTime(isComplete = false){
		const now = new Date().getTime();
		const elapsedTime = now - this.timeStarted;

		return fetch(`/api/puzzle/updateTime/${this.puzzleId}`, {
			method: 'put',
			headers: {
				'Content-Type': 'Application/json'
			},
			body: JSON.stringify({
				time: elapsedTime,
				isComplete
			})
		})
	}

	scaleValue(value, shouldApply = false){
		return value / (shouldApply ? this.pieceScale : 1);
	}

	

	drawPlugGuides(ctx, plug){
		ctx.fillStyle = 'blue';
		ctx.beginPath();
		ctx.arc(plug.firstCurve.cpX, plug.firstCurve.cpY, 5, 0, 2 * Math.PI);  // Control point one
		ctx.fill()
		
		ctx.fillStyle = 'brown';
		ctx.beginPath();
		ctx.arc(plug.secondCurve.cp1.x, plug.secondCurve.cp1.y, 5, 0, 2 * Math.PI);  // Control point one
		ctx.fill()

		ctx.beginPath();
		ctx.arc(plug.secondCurve.cp2.x, plug.secondCurve.cp2.y, 5, 0, 2 * Math.PI);  // Control point one
		ctx.fill()
		
		ctx.fillStyle = 'green';
		ctx.beginPath();
		ctx.arc(plug.thirdCurve.cp1.x, plug.thirdCurve.cp1.y, 5, 0, 2 * Math.PI);  // Control point one
		ctx.fill()

		ctx.beginPath();
		ctx.arc(plug.thirdCurve.cp2.x, plug.thirdCurve.cp2.y, 5, 0, 2 * Math.PI);  // Control point one
		ctx.fill()

		ctx.fillStyle = 'purple';
		ctx.beginPath();
		ctx.arc(plug.fourthCurve.cpX, plug.fourthCurve.cpY, 5, 0, 2 * Math.PI);  // Control point one
		ctx.fill()
	}

	drawJigsawShape(ctx, path, piece, {x, y}, showGuides = false, outlines = false, stroke = false){
		// console.log('drawJigsawShape', piece)

		const hasTopPlug = Utils.has(piece.type, 'plug', 'top')
		const hasLeftPlug = Utils.has(piece.type, 'plug', 'left')
		
		const topBoundary = hasTopPlug ? y + this.connectorSize : y;
		const leftBoundary = hasLeftPlug ? x + this.connectorSize : x;
		let topConnector = null, rightConnector = null, bottomConnector = null, leftConnector = null;
		
		path.moveTo(leftBoundary, topBoundary);

		if(Utils.has(piece.type, 'plug', 'top')){
			topConnector = this.getTopPlug(leftBoundary, topBoundary, leftBoundary + this.pieceSize);
		} else if(Utils.has(piece.type, 'socket', 'top')){
			topConnector = this.getTopSocket(leftBoundary, topBoundary, leftBoundary + this.pieceSize);
		}

		// console.log('connections includes top?', piece.connections.includes('top'))
		if(topConnector){
			// console.log('drawing top connector')
			path.lineTo(leftBoundary + this.connectorDistanceFromCorner, topBoundary);
			path.quadraticCurveTo(topConnector.firstCurve.cpX, topConnector.firstCurve.cpY, topConnector.firstCurve.destX, topConnector.firstCurve.destY);
			path.bezierCurveTo(topConnector.secondCurve.cp1.x, topConnector.secondCurve.cp1.y, topConnector.secondCurve.cp2.x, topConnector.secondCurve.cp2.y, topConnector.secondCurve.destX, topConnector.secondCurve.destY)
			path.bezierCurveTo(topConnector.thirdCurve.cp1.x, topConnector.thirdCurve.cp1.y, topConnector.thirdCurve.cp2.x, topConnector.thirdCurve.cp2.y, topConnector.thirdCurve.destX, topConnector.thirdCurve.destY)
			path.quadraticCurveTo(topConnector.fourthCurve.cpX, topConnector.fourthCurve.cpY, topConnector.fourthCurve.destX, topConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary + this.pieceSize, topBoundary);

		if(Utils.has(piece.type, 'plug', 'right')){
			rightConnector = this.getRightPlug(topBoundary, leftBoundary + this.pieceSize, leftBoundary);
		} else if(Utils.has(piece.type, 'socket', 'right')){
			rightConnector = this.getRightSocket(topBoundary, leftBoundary + this.pieceSize, leftBoundary);
		}

		if(rightConnector !== null){
			path.lineTo(leftBoundary + this.pieceSize, topBoundary + this.connectorDistanceFromCorner);
			path.quadraticCurveTo(rightConnector.firstCurve.cpX, rightConnector.firstCurve.cpY, rightConnector.firstCurve.destX, rightConnector.firstCurve.destY);
			path.bezierCurveTo(rightConnector.secondCurve.cp1.x, rightConnector.secondCurve.cp1.y, rightConnector.secondCurve.cp2.x, rightConnector.secondCurve.cp2.y, rightConnector.secondCurve.destX, rightConnector.secondCurve.destY)
			path.bezierCurveTo(rightConnector.thirdCurve.cp1.x, rightConnector.thirdCurve.cp1.y, rightConnector.thirdCurve.cp2.x, rightConnector.thirdCurve.cp2.y, rightConnector.thirdCurve.destX, rightConnector.thirdCurve.destY);
			path.quadraticCurveTo(rightConnector.fourthCurve.cpX, rightConnector.fourthCurve.cpY, rightConnector.fourthCurve.destX, rightConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary + this.pieceSize, topBoundary + this.pieceSize)

		if(Utils.has(piece.type, 'plug', 'bottom')){
			bottomConnector = this.getBottomPlug(leftBoundary + this.pieceSize, topBoundary + this.pieceSize, leftBoundary, piece.imgW);
		} else if(Utils.has(piece.type, 'socket', 'bottom')){
			bottomConnector = this.getBottomSocket(leftBoundary + this.pieceSize, topBoundary + this.pieceSize, leftBoundary, piece.imgW);
		}

		if(bottomConnector){
			path.lineTo(leftBoundary + this.pieceSize - this.connectorDistanceFromCorner, topBoundary + this.pieceSize);
			path.quadraticCurveTo(bottomConnector.firstCurve.cpX, bottomConnector.firstCurve.cpY, bottomConnector.firstCurve.destX, bottomConnector.firstCurve.destY);
			path.bezierCurveTo(bottomConnector.secondCurve.cp1.x, bottomConnector.secondCurve.cp1.y, bottomConnector.secondCurve.cp2.x, bottomConnector.secondCurve.cp2.y, bottomConnector.secondCurve.destX, bottomConnector.secondCurve.destY)
			path.bezierCurveTo(bottomConnector.thirdCurve.cp1.x, bottomConnector.thirdCurve.cp1.y, bottomConnector.thirdCurve.cp2.x, bottomConnector.thirdCurve.cp2.y, bottomConnector.thirdCurve.destX, bottomConnector.thirdCurve.destY);
			path.quadraticCurveTo(bottomConnector.fourthCurve.cpX, bottomConnector.fourthCurve.cpY, bottomConnector.fourthCurve.destX, bottomConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary, topBoundary + this.pieceSize)

		if(Utils.has(piece.type, 'plug', 'left')){
			leftConnector = this.getLeftPlug(topBoundary + this.pieceSize, leftBoundary, topBoundary, piece.imgH);
		} else if(Utils.has(piece.type, 'socket', 'left')){
			leftConnector = this.getLeftSocket(topBoundary + this.pieceSize, leftBoundary, topBoundary, piece.imgH);
		}
		if(leftConnector !== null){
			path.lineTo(leftBoundary, topBoundary + this.pieceSize - this.connectorDistanceFromCorner);
			path.quadraticCurveTo(leftConnector.firstCurve.cpX, leftConnector.firstCurve.cpY, leftConnector.firstCurve.destX, leftConnector.firstCurve.destY);
			path.bezierCurveTo(leftConnector.secondCurve.cp1.x, leftConnector.secondCurve.cp1.y, leftConnector.secondCurve.cp2.x, leftConnector.secondCurve.cp2.y, leftConnector.secondCurve.destX, leftConnector.secondCurve.destY)
			path.bezierCurveTo(leftConnector.thirdCurve.cp1.x, leftConnector.thirdCurve.cp1.y, leftConnector.thirdCurve.cp2.x, leftConnector.thirdCurve.cp2.y, leftConnector.thirdCurve.destX, leftConnector.thirdCurve.destY);
			path.quadraticCurveTo(leftConnector.fourthCurve.cpX, leftConnector.fourthCurve.cpY, leftConnector.fourthCurve.destX, leftConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary, topBoundary);

		if(showGuides){
			if(topConnector) this.drawPlugGuides(ctx, topConnector)
			if(rightConnector) this.drawPlugGuides(ctx, rightConnector)
			if(bottomConnector) this.drawPlugGuides(ctx, bottomConnector)
			if(leftConnector) this.drawPlugGuides(ctx, leftConnector)
		}

		if(stroke){
			ctx.stroke(path)
		}

		return path;
	}

	renderJigsawPiece(piece){
		let el;
		if(!piece.isSolved && !Utils.hasGroup(piece)){
			el = document.createElement('div');
			el.classList.add('puzzle-piece')
			
			el.style.position = "absolute";
			el.width = piece.imgW;
			el.height = piece.imgH;
			el.style.width = piece.imgW + "px";
			el.style.height = piece.imgH + 'px';
			el.style.top = piece.pageY + "px";
			el.style.left = piece.pageX + "px";
			el.style.backgroundImage = `url(${this.spritePath}`;
			el.style.backgroundPosition = `${piece.imgX}px ${piece.imgY}px`;

			el.setAttribute('data-jigsaw-type', piece.type.join(","))
			el.setAttribute('data-piece-id', piece.id)
			el.setAttribute('data-puzzle-id', piece.puzzleId)
			el.setAttribute('data-imgX', piece.imgX)
			el.setAttribute('data-imgy', piece.imgY)
			el.setAttribute('data-solvedX', piece.solvedX)
			el.setAttribute('data-solvedY', piece.solvedY)
			el.setAttribute('data-imgW', piece.imgW)
			el.setAttribute('data-imgH', piece.imgH)
			el.setAttribute('data-is-inner-piece', piece.isInnerPiece)
			el.setAttribute('data-num-pieces-from-top-edge', piece.numPiecesFromTopEdge)
			el.setAttribute('data-num-pieces-from-left-edge', piece.numPiecesFromLeftEdge)

			this.canvas.appendChild(el);
		}
	}

	drawPieceManually(piece){
		let ctx;

		const solvedCnvContainer = document.getElementById('group-container-1111');

		if(Number.isNaN(piece.id) || piece.id === "null"){
			return;
		}

		

		if(piece.group){
			pieceContainer.style.left = piece.solvedX + "px";
			pieceContainer.style.top = piece.solvedY + "px";
			pieceContainer.setAttribute('data-group', piece.group)
		} else {
			pieceContainer.style.left = piece.pageX + "px";
			pieceContainer.style.top = piece.pageY + "px";
		}

		if(piece.connections){
			pieceContainer.setAttribute('data-connections', piece.connections.join(','))
		}
		if(piece._id){
			pieceContainer.setAttribute('data-piece-id-in-persistence', piece._id)
		}
		if(piece.isSolved){
			pieceContainer.setAttribute('data-is-solved', piece.isSolved)
		}
		if(piece.connectsTo){
			pieceContainer.setAttribute('data-connects-to', piece.connectsTo);
		}

		if(piece.isInnerPiece){
			pieceContainer.className += " inner-piece";
			if(!this.innerPiecesVisible){
				pieceContainer.style.display = 'none';
			}
		}

		if(Utils.hasGroup(piece) && piece.isSolved === undefined){
			let groupContainer = document.querySelector(`#group-container-${piece.group}`);

			if(!groupContainer){
				groupContainer = document.createElement('div');
				groupContainer.classList.add('group-container');
				groupContainer.setAttribute('id', `group-container-${piece.group}`);
				groupContainer.style.width = this.getPxString(this.boardSize.width);
				groupContainer.style.height = this.getPxString(this.boardSize.size);
			}

			groupContainer.appendChild(pieceContainer);
			this.canvas.appendChild(groupContainer);

			let groupCanvas = groupContainer.querySelector(`#group-canvas-${piece.group}`);
			if(!groupCanvas){
				groupCanvas = document.createElement('canvas');
				groupContainer.appendChild(groupCanvas);
				groupCanvas.id = `group-canvas-${piece.group}`;
				groupCanvas.classList.add('group-canvas');
				groupCanvas.style.width = this.getPxString(this.boardSize.width);
				groupCanvas.width = this.boardSize.width;
				groupCanvas.height = this.boardSize.height;
			}

			pieceContainer.style.top = this.getPxString(piece.pageY);
			pieceContainer.style.left = this.getPxString(piece.pageX);

			if(piece.isSolved && !this.getDataAttributeValue(groupContainer, 'data-is-solved')){
				this.setElementAttribute(groupContainer, 'data-is-solved', true);
			}

		} else if(piece.isSolved) {
			solvedCnvContainer.append(pieceContainer);
		} else {
			this.canvas.appendChild(pieceContainer);
			this.setPiecePositionsWithinContainer(pieceContainer);

			const el = document.createElement("canvas");
			el.style.position = "absolute";
			el.style.top = 0;
			el.style.left = 0;
			el.className = "puzzle-piece-canvas";
			el.style.width = piece.imgW + "px";
			el.style.height = piece.imgH + 'px';
			el.width = piece.imgW;
			el.height = piece.imgH;
			el.style.zIndex = 1;

			ctx = el.getContext("2d");
			ctx.imageSmoothingEnabled = false;
			ctx.strokeStyle = '#000';
			let path = new Path2D();
			ctx.clip(this.drawJigsawShape(ctx, path, piece, {x: 0, y: 0}));
			ctx.drawImage(this.sprite, piece.imgX, piece.imgY, piece.imgW, piece.imgH, 0, 0, piece.imgW, piece.imgH);
			
			const imgData = el.toDataURL();
			// pieceContainer.setAttribute("data-image-uri", imgData);

			const imgEl = document.createElement("img");
			imgEl.src = imgData;
			imgEl.draggable = false;
			imgEl.width = piece.imgW;
			imgEl.height = piece.imgH;
			imgEl.style.width = "100%";
			imgEl.style.height = "auto";
			pieceContainer.appendChild(imgEl);
		}
	}

	initGroupContainerPositions(piecesFromPersistence){
		let groupContainers = document.querySelectorAll('[id^=group-container-]');
		groupContainers = Array.from(groupContainers).filter(c => c.id !== 'group-container-1111');

		if(groupContainers.length > 0){
			groupContainers.forEach(container => {
				let id = parseInt(container.getAttribute('id').split('-')[2]);
				let piece = piecesFromPersistence.filter(p => p.group === id)[0];
				
				container.style.top = this.getPxString(piece.containerY);
				container.style.left = this.getPxString(piece.containerX);
			})
		}
	}
	
	drawPieceDeprecated(piece) {
		const canvasEl = document.createElement("canvas");
		this.canvas.appendChild(canvasEl);

		canvasEl.id = "canvas-" + piece.shapeId;
		canvasEl.className = "puzzle-piece";

		if(piece.isInnerPiece){
			canvasEl.className += " inner-piece";
			if(!this.innerPiecesVisible){
				canvasEl.style.display = 'none';
			}
		}
		canvasEl.setAttribute('data-jigsaw-type', piece.type.join(","))
		canvasEl.setAttribute('data-piece-id', piece.id)
		canvasEl.setAttribute('data-imgX', piece.imgX)
		canvasEl.setAttribute('data-imgy', piece.imgY)
		canvasEl.style.zIndex = 3;
		canvasEl.setAttribute('width', piece.imgW);
		canvasEl.setAttribute('height', piece.imgH);
		canvasEl.style.position = "absolute";

		canvasEl.style.left = piece.pageX + "px";
		canvasEl.style.top = piece.pageY + "px";

		canvasEl.addEventListener('mouseenter', e => {
			const allPieces = document.querySelectorAll('.puzzle-piece');
			// allPieces.forEach(p => p.style.zIndex = 10);
		})

		const cvctx = canvasEl.getContext("2d");
		cvctx.imageSmoothingEnabled = false;

		const sprite = SpriteMap.find(s => s._shape_id === piece.shapeId);

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
			sprite.x,
			sprite.y,
			sprite._w,
			sprite._h,
			0, 
			0, 
			piece.imgW,
			piece.imgH,
		);

		if(this.drawOutlines){
			/**
			 * Borrowed from: https://stackoverflow.com/questions/37115530/how-do-i-create-a-puzzle-piece-with-bevel-effect-in-edged-in-canvas-html5
			 */
	
			cvctx.fill();
	
			// 4) Add rect to make stencil
			cvctx.rect(0, 0, piece.imgW, piece.imgH);
	
			// 5) Build dark shadow
			cvctx.shadowBlur = 1;
			cvctx.shadowOffsetX = -1;
			cvctx.shadowOffsetY = -1;
			cvctx.shadowColor = "rgba(0,0,0,0.8)";
	
			// 6) Draw stencil with shadow but only on non-transparent pixels
			cvctx.globalCompositeOperation = "destination-atop";
			cvctx.fill();
	
			/**
			 * End borrowed code
			*/
		}
	}

	getGroup(el){
		const attrValue = this.getDataAttributeValue(el, 'group');
		return attrValue ? parseInt(attrValue) : undefined;
	}

	getGroupFromContainer(el){
		return parseInt(el.id.split('-')[1]);
	}

	getType (el){
		const attrValue = this.getDataAttributeValue(el, 'jigsaw-type');
		return attrValue.split(',').map(n => parseInt(n));
	}

	getConnections(el){
		const attrValue = this.getDataAttributeValue(el, 'connections');
		return attrValue ? attrValue.indexOf(',') > -1 ? attrValue.split(',') : [attrValue] : [];
	}

	getIsSolved(el){
		const attrValue = this.getDataAttributeValue(el, 'is-solved');
		return attrValue !== undefined && attrValue !== null && attrValue !== "" ? attrValue === "true" : false;
	}

	applyHighlightToConnectingPieces(connections){
		for(let id in connections){
			let el = this.getElementByPieceId(connections[id]);
			el.classList.add('js-highlight');
		}
	}

	removeHighlightFromConnectingPieces(connections){
		for(let id in connections){
			let el = this.getElementByPieceId(connections[id]);
			el.classList.remove('js-highlight');
		}
	}

	getClientPos(e){
		if(e.touches){
			return {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			}
		} else {
			return {
				x: e.clientX,
				y: e.clientY
			}
		}
	}

	getPieceUnderneath(e){
			// We've clicked the empty space of a group canvas, so we need to see if there is a piece or group under the cursor/touch location that should be picked up
			const pX = e.pageX, pY = e.pageY;
			const box = {top: pY, right: pX, bottom: pY, left: pX};
			// haddock

			return [...this.allPieces()].filter(el => {
				let p = this.getPieceFromElement(el, ['solvedx', 'solvedy']);
				let cont = this.getGroup(el) && this.getGroupContainer(el);
				let bb = {};

				if(cont){
					bb.top = p.solvedY + cont.offsetTop;
					bb.right = p.solvedX + el.offsetWidth + cont.offsetLeft;
					bb.bottom = p.solvedY + el.offsetHeight + cont.offsetTop;
					bb.left = p.solvedX + cont.offsetLeft;
				} else {
					bb.top = el.offsetTop;
					bb.right = (el.offsetLeft + el.offsetWidth);
					bb.bottom = (el.offsetTop + el.offsetHeight);
					bb.left = el.offsetLeft;
				}
				
				bb = Utils.adjustForZoomLevel(bb, this.zoomLevel);
				return this.hasCollision(bb, box);
			})[0];
	}

	getCentreBetweenTwoTouches(touches){
		const xTouch1 = touches[0].clientX;
		const yTouch1 = touches[0].clientY;
		const xTouch2 = touches[1].clientX;
		const yTouch2 = touches[1].clientY;
		const x = Math.min(xTouch1, xTouch2);
		const y = Math.min(yTouch1, yTouch2);
		return {x: x + this.initialTouchesDistance / 2, y: y + this.initialTouchesDistance / 2}
	}

	onMouseDown(e){
		let element, diffX, diffY, thisPiece;

		if(e.which === 1 || e.touches){
			const clientPos = this.getClientPos(e);

			if(e.touches?.length === 2){
				this.initialTouchesDistance = this.getDistanceBetweenTouches(e);
				const touchCenter = this.getCentreBetweenTwoTouches(e.touches);
				if(this.zoomLevel === 1){
					this.canvas.style.transformOrigin = `${this.getPxString(touchCenter.x)} ${this.getPxString(touchCenter.y)}`;
				} else {
					this.canvas.style.transformOrigin = `0 0`;
				}
			}

			const isPuzzlePiece = e.target.classList.contains("puzzle-piece");
			const isPuzzlePieceCanvas = e.target.classList.contains("puzzle-piece-canvas");
			const isImg = e.target.nodeName.toLowerCase() === "img";
			const lookForPieceUnderneath = e.target.classList.contains("group-canvas") || e.id === 'group-canvas-solved';

			if(lookForPieceUnderneath){
				element = this.getPieceUnderneath(e);
			}
			
			if(isPuzzlePieceCanvas || isImg){
				element = e.target.parentNode;
			}

			if(isPuzzlePiece){
				element = e.target;
			}

			console.log("element", element)

			if(!element){
				this.isMouseDown = false;
				return;
			} else {
				this.movingPiece = element;
			}

			thisPiece = this.getPieceFromElement(element, ['piece-id', 'is-solved', 'group', 'connects-to']);

			if(this.highlightConnectingPieces){
				// TODO: FIX
				this.applyHighlightToConnectingPieces(JSON.parse(thisPiece.connectsTo));
			}

			if(thisPiece.isSolved){
				return;
			}

			if(Utils.hasGroup(thisPiece)){
				const container = this.getGroupTopContainer(element);
				const isGroupSolved = this.getDataAttributeValue(container, 'is-solved');

				if(isGroupSolved){
					return;
				}

				this.isMovingSinglePiece = false;
				this.movingElement = this.getGroupTopContainer(element);
			} else {
				this.isMovingSinglePiece = true;
				this.movingElement = this.movingPiece = element;
			}

			diffX = clientPos.x - this.movingElement.offsetLeft * this.zoomLevel;
			diffY = clientPos.y - this.movingElement.offsetTop * this.zoomLevel;					

			this.keepOnTop(this.movingElement)

			this.mouseMoveFunc = this.onMouseMove(diffX, diffY);

			if(e.touches){
				this.isTouching = true;
			} else {
				this.isMouseDown = true;
			}

			window.addEventListener(this.interactionEventMove, this.mouseMoveFunc);
		}
	}

	onMouseMove(diffX, diffY){
		return function(e){
			let eventX, eventY, newPosTop, newPosLeft;
			if(this.movingElement){
				eventX = e.touches ? e.touches[0].clientX : e.clientX;
				eventY = e.touches ? e.touches[0].clientY : e.clientY;
				newPosTop = (eventY / this.zoomLevel) - (diffY / this.zoomLevel);
				newPosLeft = (eventX / this.zoomLevel) - (diffX / this.zoomLevel);
				this.movingElement.style.top = newPosTop + "px";
				this.movingElement.style.left = newPosLeft + "px";
			}
		}.bind(this)
	}

	getAdjacentSolvedPieces(arg){
		if(Array.isArray(arg)){
			const groups = [];
			return arg.map(sourceEl => {
				let els = this.getConnectingElements(sourceEl, true, true);
				if(els.length){
					return els.map(targetEl => {
						if(this.getIsSolved(targetEl)){
							return {
								sourceEl,
								targetEl,
							}
						}
					});
				}
			}).flat().filter((el) => {
				if(el){
					let target = el.targetEl;
					let group = this.getGroup(target);
					if(!groups.includes(group)){
						groups.push(group)
						return el;
					}
				}
			});
		} else {
			return this.getConnectingElements(el).filter(el => this.getIsSolved(el));
		}
	}

	onMouseUp(e){
		if(this.isMouseDown || this.isTouching){
			const element = this.movingPiece;
			// console.log('element position top', element.offsetTop, 'left', element.offsetLeft)
			const thisPiece = this.getPieceFromElement(element, ['connects-to']);

			if(this.highlightConnectingPieces){
				this.removeHighlightFromConnectingPieces(JSON.parse(thisPiece.connectsTo));
			}

			let hasConnection = false, connection;

			if(!this.isMovingSinglePiece){
				let group = this.getGroup(element);
				const piecesToCheck = this.getCollisionCandidatesInGroup(group);
				// console.log('pieces to check', piecesToCheck)

				const connection = piecesToCheck.map(p => this.checkConnections(p)).filter(e => e)[0];
				console.log('connection', connection)

				if(connection){
					let connectionType = connection.type || connection;

					if(this.soundsEnabled){
						this.clickSound.play();
					}

					const isCornerConnection = Utils.isCornerConnection(connectionType);
					console.log('is corner connection', isCornerConnection)

					if(isCornerConnection || connectionType === "float"){
						this.addToGroup(connection.sourceEl, 1111);
					} else {
						this.group(connection.sourceEl, connection.targetEl);
					}

					const updatedGroup = this.getGroup(element);

					if(!isCornerConnection){
						this.updateConnections(updatedGroup);
					}

					if(this.shouldMarkAsSolved(element, connectionType)){
						const piecesInGroup = this.getPiecesInGroup(updatedGroup)
						this.markAsSolved(piecesInGroup);
						if(this.isPuzzleComplete()){
							this.updateElapsedTime(true)
						}
					}

					hasConnection = true;
				}

				const piecesInCurrentGroup = this.getPiecesInGroup(group);
				const piecesInNewGroup = this.getPiecesInGroup(this.getGroup(element));

				if(hasConnection){
					this.save(piecesInNewGroup);
				} else {
					this.save(piecesInCurrentGroup);
				}
			} else {
				connection = this.checkConnections(element);
				console.log(connection)

				if(connection){
					const { targetEl } = connection;
					if(this.soundsEnabled){
						this.clickSound.play();
					}

					let connectionType = typeof connection == "string" ? connection : connection.type;
					const isSolvedConnection = Utils.isCornerConnection(connectionType) || connectionType === 'float';

					if(isSolvedConnection){
						this.addToGroup(element, 1111)
					} else {
						this.group(element, targetEl);
					}

					this.updateConnections(element);

					if(this.shouldMarkAsSolved(element, connectionType)){
						this.markAsSolved([element]);
						if(this.isPuzzleComplete()){
							this.updateElapsedTime(true)
						}
					}

					if(this.getGroup(element)){
						this.save(this.getPiecesInGroup(this.getGroup(element)))
					} else {
						this.save([element])
					}
				} else {
					this.save([element])
				}
			}

			this.movingElement = null;
			this.movingPiece = null;
			this.movingPieces = [];
		}

		this.isMouseDown = false;
		this.isTouching = false;

		// window.removeEventListener(this.interactionEventMove, this.moveCanvas);
		window.removeEventListener(this.interactionEventMove, this.mouseMoveFunc);
		window.removeEventListener(this.interactionEventUp, this.onMouseUp);
	}

	getDataAttributeRaw(el, key){
		// console.log('getDataAttributeRaw', el)
		return el.getAttribute(`data-${key}`) || undefined;
	}

	getDataAttributeValue(el, key){
		const value = this.getDataAttributeRaw(el, key)
		return value && value !== "undefined" ? value : undefined;
	}

	keepOnTop(el){
		el.style.zIndex = this.currentZIndex++;
	}

	getConnectingElement(el, connection){
		const p = this.getPieceFromElement(el, ['piece-id']);
		switch(connection){
			case 'right':
				return this.getElementByPieceId(p.id + 1);
			case 'bottom':
				return this.getElementByPieceId(p.id + this.piecesPerSideHorizontal);
			case 'left':
				return this.getElementByPieceId(p.id - 1);
			case 'top':
				return this.getElementByPieceId(p.id - this.piecesPerSideHorizontal);
		}
	}

	getConnectingElements(el, asArray = false, unconnectedOnly = false){
		const p = this.getPieceFromElement(el, ['piece-id', 'connections']);

		const arr = [];
		const obj = {};

		const rightPiece = p.id + 1;
		const bottomPiece = p.id + this.piecesPerSideHorizontal;
		const leftPiece = p.id - 1;
		const topPiece = p.id - this.piecesPerSideHorizontal;
		
		const right = this.getElementByPieceId(rightPiece);
		if(right){
			if(unconnectedOnly && !p.connections.includes('right') || !unconnectedOnly){
				arr.push(right);
				obj['right'] = right;
			}
		}
		const bottom = this.getElementByPieceId(bottomPiece);
		if(bottom){
			if(unconnectedOnly && !p.connections.includes('bottom') || !unconnectedOnly){
				arr.push(bottom);
				obj['bottom'] = bottom;
			}
		}
		const left = this.getElementByPieceId(leftPiece);
		if(left){
			if(unconnectedOnly && !p.connections.includes('left') || !unconnectedOnly){
				arr.push(left);
				obj['left'] = left;
			}
		}
		const top = this.getElementByPieceId(topPiece);
		if(top){
			if(unconnectedOnly && !p.connections.includes('top') || !unconnectedOnly){
				arr.push(top);
				obj['top'] = top;
			}
		}

		return asArray ? arr : obj
	}

	// deprecated
	moveCanvas(e){
		const element = this.canvas;
		if(this.isMouseDown && this.isCanvasMoving){
			const newPosTop = e.clientY - this.canvasDiffY;
			const newPosLeft = e.clientX - this.canvasDiffX;

			const topLimit = 0;
			const leftLimit = 0;
			const rightLimit = window.innerWidth - this.canvasWidth;
			const bottomLimit = window.innerHeight - this.canvasHeight;
			
			if(newPosTop <= topLimit && newPosLeft <= leftLimit && newPosTop >= bottomLimit && newPosLeft >= rightLimit){
				element.style.top = newPosTop + "px";
				element.style.left = newPosLeft + "px";
			}
		}
	}

	setElementAttribute(el, attr, value){
		el.setAttribute(attr, value);
	}

	// deprecated
	updatePiecePositionsByDiff(diff, pieces){
		const pieceIDs = pieces.map(p => p.id);
		this.pieces = this.pieces.map(p => {
			if(pieceIDs.includes(p.id)){
				const diffTopOperand = diff.top.charAt(0);
				const diffTopValue = diffTopOperand === "+" ? Math.ceil(parseFloat(diff.top.substr(1))) : Math.floor(parseFloat(diff.top.substr(1)));
				const diffLeftOperand = diff.left.charAt(0);
				const diffLeftValue = diffLeftOperand === "+" ? Math.ceil(parseFloat(diff.left.substr(1))) : Math.floor(parseFloat(diff.left.substr(1)));
				
				const element = this.getElementByPieceId(p.id);
	
				const newPosTop = diffTopOperand === "+" ? parseInt(element.style.top) + diffTopValue : parseInt(element.style.top) - diffTopValue;
				const newPosLeft = diffLeftOperand === "+" ? parseInt(element.style.left) + diffLeftValue : parseInt(element.style.left) - diffLeftValue;

				element.style.top = newPosTop + "px";
				element.style.left = newPosLeft + "px";
				element.style.zIndex = 10;
				
				return {
					...p,
					pageY: newPosTop,
					pageX: newPosLeft,
				}
			}
			return p;
		})
	}

	isCornerConnection(str){
		return str === "top-left" || str === "top-right" || str === "bottom-right" || str === "bottom-left";
	}

	shouldMarkAsSolved(piece, connection){
		const isCornerConnection = Utils.isCornerConnection(connection);
		const group = this.getGroup(piece);
		let check;

		if(group){
			check = Array.from(this.getPiecesInGroup(group)).some(p => {
				let piece = this.getPieceFromElement(p, ['jigsaw-type', 'is-solved']);
				return piece.isSolved || Utils.isCornerPiece(piece) && connection === 'float';
			});
		} else {
			check = this.isGroupSolved(group);
		}
		return isCornerConnection || check;
	}

	markAsSolved(els){
		let container;
		if(this.getGroup(els[0])){
			container = this.getGroupTopContainer(els[0]);
			this.setElementAttribute(container, 'data-is-solved', true);
			container.style.zIndex = 1;
		}
		els.forEach( piece => {
			this.setElementAttribute(piece, "data-is-solved", true);
			piece.style.zIndex = 1;
		})
	}

	loadAssets(assets){
		let promises = [];
		for(let i=0,l=assets.length;i<l;i++){
			promises.push(this.loadAsset(assets[i]).then(assetData => this.loadedAssets.push(assetData)));
		}
		
		return Promise.all(promises)
	}

	loadAsset(asset){
		return new Promise( (resolve, reject) => {
			asset.onload = asset => {
				resolve(asset);
			};
			asset.onerror = err => {
				reject(err);
			};
		})
	}

	getCompatiblePieces(pieceAbove, pieceBehind, pieces){
		let pieceAboveHasPlug,
			pieceAboveHasSocket,
			pieceBehindHasPlug,
			pieceBehindHasSocket;

		if(pieceAbove){
			pieceAboveHasSocket = Utils.has(pieceAbove.type, "socket", "bottom");
			pieceAboveHasPlug = Utils.has(pieceAbove.type, "plug", "bottom");
		}

		if(pieceBehind){
			pieceBehindHasSocket = Utils.has(pieceBehind.type, "socket", "right");
			pieceBehindHasPlug = Utils.has(pieceBehind.type, "plug", "right");
		}

		let thisPieceHasLeftSocket,
			thisPieceHasLeftPlug,
			thisPieceHasTopSocket,
			thisPieceHasTopPlug;

		const candidatePieces = [];

		for(let i=0, l=pieces.length; i<l; i++){
			if(pieceAbove){
				thisPieceHasTopSocket = Utils.has(pieces[i].type, "socket", "top");
				thisPieceHasTopPlug = Utils.has(pieces[i].type, "plug", "top");
			}

			if(pieceBehind){
				thisPieceHasLeftSocket = Utils.has(pieces[i].type, "socket", "left");
				thisPieceHasLeftPlug = Utils.has(pieces[i].type, "plug", "left");
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

	

	

	getCandidatePieces(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow){
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

	getConnectingPieceIds(el){
		const id = parseInt(this.getDataAttributeValue(el, 'piece-id'));
		const pieceAboveId = id - this.piecesPerSideHorizontal;
		const pieceBelowId = id + this.piecesPerSideHorizontal;

		const piece = {
			type: this.getType(el),
		};

		if(Utils.isTopLeftCorner(piece)){
			return {
				right: id + 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isTopSide(piece)){
			return {
				left: id - 1,
				right: id + 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isTopRightCorner(piece)){
			return {
				left: id - 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isLeftSide(piece)){
			return {
				top: pieceAboveId,
				right: id + 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isInnerPiece(piece)){
			return {
				top: pieceAboveId,
				right: id + 1,
				bottom: pieceBelowId,
				left: id - 1
			}
		}
		if(Utils.isRightSide(piece)){
			return {
				top: pieceAboveId,
				left: id - 1,
				bottom: pieceBelowId,
			}
		}
		if(Utils.isBottomLeftCorner(piece)){
			return {
				top: pieceAboveId,
				right: id + 1,
			}
		}
		if(Utils.isBottomSide(piece)){
			return {
				left: id - 1,
				right: id + 1,
			}
		}
		if(Utils.isBottomRightCorner(piece)){
			return {
				top: pieceAboveId,
				left: id - 1,
			}
		}
	}

	/**
	* Returns a random integer between min (inclusive) and max (inclusive).
	* The value is no lower than min (or the next integer greater than min
	* if min isn't an integer) and no greater than max (or the next integer
	* lower than max if max isn't an integer).
	* Using Math.round() will give you a non-uniform distribution!
	*/
	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	getSectorBoundingBox(sector){
		const sectors = [
			"top-first-half",
			"top-second-half",
			"top-right",
			"right-first-half",
			"right-second-half",
			"bottom-right",
			"bottom-first-half",
			"bottom-second-half",
			"bottom-left",
			"left-first-half",
			"left-second-half",
			"top-left"
		];
		const chosen = sectors[sector];
		switch(chosen){
			case "top-first-half":
				return {
					top: 0,
					right: this.boardBoundingBox.width / 2,
					bottom: this.boardBoundary,
					left: this.boardBoundary,
				}
			case "top-second-half":
				return {
					top: 0,
					right: this.boardBoundingBox.right,
					bottom: this.boardBoundary,
					left: this.boardBoundary + this.boardBoundingBox.width / 2,
				}
			case "top-left":
				return {
					top: 0,
					right: this.boardBoundary,
					bottom: this.boardBoundary,
					left: 0,
				}
			case "right-first-half":
				return {
					top: this.boardBoundary,
					right: this.canvasWidth,
					bottom: this.boardBoundary + this.boardBoundingBox.height / 2,
					left: this.boardBoundingBox.right,
				}
			case "right-second-half":
				return {
					top: this.boardBoundary + this.boardBoundingBox.height / 2,
					right: this.canvasWidth,
					bottom: this.boardBoundingBox.bottom,
					left: this.boardBoundingBox.right,
				}
			case "top-right":
				return {
					top: 0,
					right: this.canvasWidth,
					bottom: this.boardBoundary,
					left: this.boardBoundingBox.right,
				}
			case "bottom-first-half":
				return {
					top: this.boardBoundingBox.bottom,
					right: this.boardBoundingBox.right,
					bottom: this.canvasHeight,
					left: this.boardBoundingBox.left + this.boardBoundingBox.width / 2,
				}
			case "bottom-second-half":
				return {
					top: this.boardBoundingBox.bottom,
					right: this.boardBoundingBox.left + this.boardBoundingBox.width / 2,
					bottom: this.canvasHeight,
					left: this.boardBoundingBox.left,
				}
			case "bottom-right":
				return {
					top: this.boardBoundingBox.bottom,
					right: this.canvasWidth,
					bottom: this.canvasHeight,
					left: this.boardBoundingBox.right,
				}
			case "left-first-half":
				return {
					top: this.boardBoundary + this.boardBoundingBox.height / 2,
					right: this.boardBoundingBox.left,
					bottom: this.boardBoundingBox.bottom,
					left: 0,
				}
			case "left-second-half":
				return {
					top: this.boardBoundary,
					right: this.boardBoundingBox.left,
					bottom: this.boardBoundingBox.top + this.boardBoundingBox.height / 2,
					left: 0,
				}
			case "bottom-left":
				return {
					top: this.boardBoundingBox.bottom,
					right: this.boardBoundingBox.left,
					bottom: this.canvasHeight,
					left: 0,
				}
		}
	}
	
	// Generate map of sectors that can be used for even dispersal of pieces around outside of puzzle board
	generatePieceSectorMap(){
		const totalArea = (this.canvasWidth * this.canvasHeight);
		const pieceSectorSize = totalArea / this.selectedNumPieces;

		const sqr = Math.abs(Math.sqrt(pieceSectorSize));
		const area = {w: sqr, h: sqr};

		const quadrants = [
			{x:0,y:0,w:window.innerWidth,h:this.boardTop - this.largestPieceSpan},
			{x:0,y:this.boardTop - this.largestPieceSpan,w:this.boardLeft - this.largestPieceSpan,h:this.boardAreaEl.offsetHeight + this.largestPieceSpan},
			{x:this.boardRight,y:this.boardTop - this.largestPieceSpan,w:window.innerWidth - this.boardRight,h:this.boardAreaEl.offsetHeight + this.largestPieceSpan},
			{x:0,y:this.boardBottom,w:window.innerWidth,h:this.boardTop - this.largestPieceSpan},
		];

		let quad = 0;
		let currentQuadrant = quadrants[quad];
		let xPos = currentQuadrant.x, yPos = currentQuadrant.y;
		let thisSector;
		
		for(let i=0, n=this.selectedNumPieces; i<n; i++){
			thisSector = this.pieceSectors[i] = {
				id: i,
				x: xPos,
				y: yPos,
				...area,
			}

			if(thisSector.x + (thisSector.w*2) < currentQuadrant.x + currentQuadrant.w){
				xPos += sqr;
			} else {
				if(yPos + (sqr*2) > currentQuadrant.y + currentQuadrant.h){
					// Finished last quadrant, now pick another at random to continue
					if(quad === quadrants.length - 1){
						currentQuadrant = quadrants[this.getRandomInt(0, 3)];
					} else {
						quad++;
						currentQuadrant = quadrants[quad];
					}
					xPos = currentQuadrant.x;
					yPos = currentQuadrant.y;
				} else {
					xPos = currentQuadrant.x;
					yPos += sqr;
				}
			}
		}
	}

	arrangePieces(pieces){
		this.arrangedPieces = [];
		let depth = 0;
		let start = 0;
		let totalRendered = 0;
		let currentIndex = 0;
		let currentSet;

		const sides = ["top", "right", "bottom", "left"];
		
		while(totalRendered < pieces.length - 1){
			totalRendered += this.renderPiecesAlongEdge(sides[currentIndex], pieces.slice(-totalRendered), depth);

			start += totalRendered;
			if(currentIndex < sides.length - 1){
				currentIndex++;
			} else {
				currentIndex = 0;
				depth++;
			}
		}
		/*
		console.log(this.arrangedPieces)
		this.arrangedPieces.forEach(p => {
			let el = this.getElementByPieceId(p.id);
			el.style.top = this.getPxString(p.y);
			el.style.left = this.getPxString(p.x);
			this.animatePiece(el, p.x, p.y)
		})
		*/
	}

	renderPiecesAlongEdge(side, pieces, depth){
		let currentX, currentY, el, numPiecesRendered = 0, edge;

		const step = this.largestPieceSpan;

		switch(side){
			case "top":
				currentX = this.boardBoundingBox.left;
				currentY = this.boardBoundingBox.top - (depth*this.largestPieceSpan);
				break;
			case "right":
				currentX = this.boardBoundingBox.right + (depth*this.largestPieceSpan);
				currentY = this.boardBoundingBox.top;
				break;
			case "bottom":
				currentX = this.boardBoundingBox.right;
				currentY = this.boardBoundingBox.bottom + (depth*this.largestPieceSpan);
				break;
			case "left":
				currentX = this.boardBoundingBox.left - (depth*this.largestPieceSpan);
				currentY = this.boardBoundingBox.bottom;
				break;
			default:;
		}
		
		let i = 0;
		for(let p of pieces){
			if(i === pieces.length - 1) return pieces.length;

			el = this.getElementByPieceId(p.id);
			
			switch(side){
				case "top":
					// this.arrangedPieces.push({id: p.id, x: currentX, y: currentY - p.imgH});
					el.style.top = this.getPxString(currentY - p.imgH);
					el.style.left = this.getPxString(currentX);
					this.animatePiece(el, currentX, currentY - p.imgH)
					
					edge = el.offsetLeft + el.offsetWidth;

					if(edge >= this.boardBoundary + this.boardSize.width){
						return numPiecesRendered;
					} else {
						currentX += step;
						numPiecesRendered++;
					}
					break;
				case "right":
					// this.arrangedPieces.push({id: p.id, x: currentX, y: currentY})
					el.style.top = this.getPxString(currentY);
					el.style.left = this.getPxString(currentX);
					this.animatePiece(el, currentX, currentY)

					edge = el.offsetTop + el.offsetHeight;

					if(edge > this.boardBoundary + this.boardSize.height){
						return numPiecesRendered;
					} else {
						currentY += step;
						numPiecesRendered++;
					}
					break;
				case "bottom":
					// this.arrangedPieces.push({id: p.id, x: currentX - p.imgW, y: currentY})
					el.style.top = this.getPxString(currentY);
					el.style.left = this.getPxString(currentX - p.imgW);
					this.animatePiece(el, currentX - p.imgW, currentY)

					edge = el.offsetLeft;

					if(edge < this.boardBoundary - el.offsetWidth){
						return numPiecesRendered;
					} else {
						currentX -= step;
						numPiecesRendered++;
					}
					break;
				case "left":
					// this.arrangedPieces.push({id: p.id, x: currentX - p.imgW, y: currentY - p.imgH})
					el.style.top = this.getPxString(currentY - p.imgH);
					el.style.left = this.getPxString(currentX - p.imgW);
					this.animatePiece(el, currentX - p.imgW, currentY - p.imgH)

					edge = el.offsetTop;

					if(edge < this.boardBoundingBox.top){
						return numPiecesRendered;
					} else {
						currentY -= step;
						numPiecesRendered++;
					}
					break;
				default:;
			}

			i++;
		};
	}

	shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
		  const j = Math.floor(Math.random() * (i + 1));
		  const temp = array[i];
		  array[i] = array[j];
		  array[j] = temp;
		}
		return array;
	  }

	getRandomPositionOutsideBoardArea(sector){
		const randSectorBoundingBox = this.getSectorBoundingBox(sector);
		
		return {
			left: this.getRandomInt(randSectorBoundingBox.left, randSectorBoundingBox.right - this.largestPieceSpan),
			top: this.getRandomInt(randSectorBoundingBox.top, randSectorBoundingBox.bottom - this.largestPieceSpan),
		}
	}

	

	

	assignPieceConnections(){
		this.allPieces().forEach(p => {
			this.setElementAttribute(p, 'data-connects-to', JSON.stringify(this.getConnectingPieceIds(p)))
		});
	}

	getConnectorBoundingBox(element, side){
		const piece = this.getPieceFromElement(element, ['jigsaw-type']);
		const hasLeftPlug = Utils.has(piece.type, "plug", "left");
		const hasTopPlug = Utils.has(piece.type, "plug", "top");
		const tolerance = this.connectorTolerance;
		switch(side){
			case "left":
				const topCalc = hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner;
				return {
					top: element.offsetTop + (topCalc / this.pieceScale) + tolerance,
					right: element.offsetLeft + (this.connectorSize / this.pieceScale) - tolerance,
					bottom: element.offsetTop + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					left: element.offsetLeft + tolerance,
				}
			case "right":
				return {
					top: element.offsetTop + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
					right: element.offsetLeft + element.offsetWidth - tolerance,
					bottom: element.offsetTop + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					left: element.offsetLeft + element.offsetWidth - this.connectorSize + tolerance,
				}
			case "bottom":
				return {
					top: element.offsetTop + element.offsetHeight - this.connectorSize + tolerance,
					right: element.offsetLeft + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					bottom: element.offsetTop + element.offsetHeight - tolerance,
					left: element.offsetLeft + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
				}
			case "top":
				return {
					top: element.offsetTop + tolerance,
					right: element.offsetLeft + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					bottom: element.offsetTop + this.connectorSize - tolerance,
					left: element.offsetLeft + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
				}
		}
	}

	getSolvedConnectorBoundingBox(el, side){
		const piece = this.getPieceFromElement(el, ['jigsaw-type']);
		const solvedBB = this.getPieceSolvedBoundingBox(el);
		const hasLeftPlug = Utils.has(piece.type, "plug", "left");
		const hasTopPlug = Utils.has(piece.type, "plug", "top");
		const tolerance = this.connectorTolerance;
		switch(side){
			case "left":
				return {
					top: solvedBB.top + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
					right: solvedBB.left + this.connectorSize - tolerance,
					bottom: solvedBB.top + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					left: solvedBB.left + tolerance,
				}
			case "right":
				return {
					top: solvedBB.top + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
					right: solvedBB.right - tolerance,
					bottom: solvedBB.top + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					left: solvedBB.right - this.connectorSize + tolerance,
				}
			case "bottom":
				return {
					top: solvedBB.bottom - this.connectorSize + tolerance,
					right: solvedBB.left + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					bottom: solvedBB.bottom - tolerance,
					left: solvedBB.left + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
				}
			case "top":
				return {
					top: solvedBB.top + tolerance,
					right: solvedBB.left + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					bottom: solvedBB.top + this.connectorSize - tolerance,
					left: solvedBB.left + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
				}
		}
	}

	getTopLeftCornerBoundingBox(){
		return {
			top: this.boardTop,
			right: this.boardLeft+ this.connectorTolerance,
			bottom: this.boardTop + this.connectorTolerance,
			left: this.boardLeft,
		}
	}

	getTopRightCornerBoundingBox(){
		return {
			top: this.boardTop,
			right: this.boardRight,
			bottom: this.boardTop + this.connectorTolerance,
			left: this.boardRight - this.connectorTolerance,
		}
	}

	getBottomRightCornerBoundingBox(){
		return {
			top: this.boardBottom - this.connectorTolerance,
			right: this.boardRight,
			bottom: this.boardBottom,
			left: this.boardRight - this.connectorTolerance,
		}
	}

	getBottomLeftCornerBoundingBox(){
		return {
			top: this.boardBottom - this.connectorTolerance,
			right: this.boardLeft + this.connectorTolerance,
			bottom: this.boardBottom,
			left: this.boardLeft,
		}
	}

	getPieceBoundingBox(piece){
		return {
			top: piece.pageY,
			right: piece.pageX + piece.imgW,
			left: piece.pageX,
			bottom: piece.pageY + piece.imgH,
		}
	}

	getGroupContainer(arg){
		if(typeof arg === 'number'){
			return document.getElementById(`group-container-${arg}`);
		} else {
			return arg.parentNode;
		}
	}

	getGroupTopContainer(el){
		if(el.classList.contains('group-container') && !el.classList.contains('subgroup')){
			return el;
		} else {
			return this.getGroupTopContainer(el.parentNode)
		}
	}

	allPieces(){
		return document.querySelectorAll('.puzzle-piece');
	}

	filterPiecesByDataAttribute(els, key, value){
		return els.map(el => this.getDataAttributeValue(el, key) === value);
	}

	getCollisionCandidatesInGroup(group){
		const piecesInGroup = this.getPiecesInGroup(group);
		const candidates = [];

		piecesInGroup.forEach(piece => {
			const p = this.getPieceFromElement(piece, ['jigsaw-type', 'is-solved']);
			const connections = this.getConnections(piece);
			if(Utils.isInnerPiece(p) && connections.length < 4){
				candidates.push(piece)
			}
			if(Utils.isSidePiece(p) && connections.length < 3){
				candidates.push(piece)
			}
			if(Utils.isCornerPiece(p) && !p.isSolved){
				candidates.push(piece)
			}
		});
		return candidates;
	}

	getElementBoundingBoxRelativeToTopContainer(el){
		let top = 0, left = 0;
		const recurse = (el) => {
			if(el.classList.contains('subgroup') || el.classList.contains('puzzle-piece')){
				left += el.offsetLeft;
				top += el.offsetTop;
				return recurse(el.parentNode)
			} else {
				return {
					top,
					left
				}
			}
		}

		return recurse(el);
	}

	getConnectorBoundingBoxInGroup(element, connector, containerBoundingBox){
		const piece = this.getPieceFromElement(element, ['jigsaw-type', 'solvedx', 'solvedy'])

		const hasLeftPlug = Utils.has(piece.type, "plug", "left");
		const hasTopPlug = Utils.has(piece.type, "plug", "top");
		const tolerance = this.connectorTolerance;

		switch(connector){
			case 'right':
				return {
					top: containerBoundingBox.top + element.offsetTop + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
					right: containerBoundingBox.left + element.offsetLeft + element.offsetWidth - tolerance,
					bottom: containerBoundingBox.top + element.offsetTop + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					left: containerBoundingBox.left + element.offsetLeft + element.offsetWidth - this.connectorSize + tolerance
				}
	
			case 'bottom':
				return {
					top: containerBoundingBox.top + element.offsetTop + element.offsetHeight - this.connectorSize + tolerance,
					right: containerBoundingBox.left + element.offsetLeft + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					bottom: containerBoundingBox.top + element.offsetTop + element.offsetHeight - tolerance,
					left: containerBoundingBox.left + element.offsetLeft + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
				}
	
			case 'left':
				return {
					top: containerBoundingBox.top + element.offsetTop + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance,
					right: containerBoundingBox.left + element.offsetLeft + this.connectorSize - tolerance,
					bottom: containerBoundingBox.top + element.offsetTop + (hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					left: containerBoundingBox.left + element.offsetLeft + tolerance,
				}
	
			case 'top':
				return {
					top: containerBoundingBox.top + element.offsetTop + tolerance,
					right: containerBoundingBox.left + element.offsetLeft + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + this.connectorSize - tolerance,
					bottom: containerBoundingBox.top + element.offsetTop + this.connectorSize - tolerance,
					left: containerBoundingBox.left + element.offsetLeft + (hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner) + tolerance
				}
		}
	}

	getBoundingBox(el){
		return {
			top: el.offsetTop,
			right: el.offsetLeft + el.offsetWidth,
			bottom: el.offsetTop + el.offsetHeight,
			left: el.offsetLeft,
			width: el.offsetWidth,
			height: el.offsetHeight,
		};
	}

	getElementBoundingBox(el){
		let pos = this.getElementBoundingBoxRelativeToTopContainer(el);
		return {
			top: pos.top,
			right: pos.left + el.offsetWidth,
			bottom: pos.top + el.offsetHeight,
			left: pos.left
		}
	}

	getPieceSolvedBoundingBox(el){
		const piece = this.getPieceFromElement(el, ['num-pieces-from-top-edge', 'num-pieces-from-left-edge', 'jigsaw-type'])
		let gridPosX = piece.numPiecesFromLeftEdge === 0 ? this.boardBoundary : this.boardBoundary + this.pieceSize * piece.numPiecesFromLeftEdge;
		let gridPosY = piece.numPiecesFromTopEdge === 0 ? this.boardBoundary : this.boardBoundary + this.pieceSize * piece.numPiecesFromTopEdge;
		// Would Math.round help each of these values?
		return {
			top: (Utils.has(piece.type, 'plug', 'top') ? gridPosY - this.connectorSize : gridPosY),
			right: (Utils.has(piece.type, 'plug', 'left') ? gridPosX - this.connectorSize : gridPosX) + el.offsetWidth,
			bottom: (Utils.has(piece.type, 'plug', 'top') ? gridPosY - this.connectorSize : gridPosY) + el.offsetHeight,
			left: (Utils.has(piece.type, 'plug', 'left') ? gridPosX - this.connectorSize : gridPosX)
		}
	}

	checkConnections(element){
		let connectionFound;

		// checker
		let containerBoundingBox, targetElement, targetPiece, thisPieceConnectorBoundingBoxTop, thisPieceConnectorBoundingBoxRight, thisPieceConnectorBoundingBoxBottom, thisPieceConnectorBoundingBoxLeft, solvedPieceConnectorBoundingBoxTop, solvedPieceConnectorBoundingBoxRight, solvedPieceConnectorBoundingBoxBottom, solvedPieceConnectorBoundingBoxLeft;
	
		let connections = this.getDataAttributeValue(element, 'connections');
		connections = connections || [];

		const piece = {
			id: parseInt(this.getDataAttributeValue(element, 'piece-id')),
			group: this.getGroup(element),
			isSolved: this.getDataAttributeValue(element, 'is-solved'),
			type: this.getType(element),
			connections,
		}
		
		const hasRightConnector = Utils.has(piece.type, "plug", "right") || Utils.has(piece.type, "socket", "right");
		const hasBottomConnector = Utils.has(piece.type, "plug", "bottom") || Utils.has(piece.type, "socket", "bottom");
		const hasLeftConnector = Utils.has(piece.type, "plug", "left") || Utils.has(piece.type, "socket", "left");
		const hasTopConnector = Utils.has(piece.type, "plug", "top") || Utils.has(piece.type, "socket", "top");

		const shouldCompare = targetPiece => piece.group === undefined || piece.group === null || piece.group !== targetPiece.group;

		let elBoundingBox = this.getBoundingBox(element);
		let elBBWithinTolerance = elBoundingBox;

		if(Utils.isCornerPiece(piece)){
			let container;

			if(Utils.hasGroup(piece)){
				container = this.getGroupContainer(element);
			}

			elBBWithinTolerance.top = container ? container.offsetTop : elBoundingBox.top;
			elBBWithinTolerance.left = container ? container.offsetLeft : elBoundingBox.left;
			elBBWithinTolerance.right = container ? container.offsetLeft + container.offsetWidth : elBoundingBox.right;
			elBBWithinTolerance.bottom = container ? container.offsetTop + container.offsetHeight : elBoundingBox.bottom;

			if(Utils.isTopLeftCorner(piece)){
				elBBWithinTolerance.right = elBoundingBox.left + this.connectorTolerance;
				elBBWithinTolerance.bottom = elBoundingBox.top + this.connectorTolerance;
				if(this.hasCollision(elBBWithinTolerance, this.getTopLeftCornerBoundingBox())){
					connectionFound = "top-left";
				}
			}
			if(Utils.isTopRightCorner(piece)){
				elBBWithinTolerance.left = elBoundingBox.right - this.connectorTolerance;
				elBBWithinTolerance.bottom = elBoundingBox.top + this.connectorTolerance;
				if(this.hasCollision(elBoundingBox, this.getTopRightCornerBoundingBox())){
					connectionFound = "top-right";
				}
			}
			if(Utils.isBottomRightCorner(piece)){
				elBBWithinTolerance.left = elBoundingBox.right - this.connectorTolerance;
				elBBWithinTolerance.top = elBoundingBox.bottom - this.connectorTolerance;
				if(this.hasCollision(elBoundingBox, this.getBottomRightCornerBoundingBox())){
					connectionFound = "bottom-right";
				}
			}
			if(Utils.isBottomLeftCorner(piece)){
				elBBWithinTolerance.right = elBoundingBox.left + this.connectorTolerance;
				elBBWithinTolerance.top = elBoundingBox.bottom - this.connectorTolerance;
				if(this.hasCollision(elBoundingBox, this.getBottomLeftCornerBoundingBox())){
					connectionFound = "bottom-left";
				}
			}
		}

		const checkRight = hasRightConnector && !piece.connections.includes('right');
		const checkBottom = hasBottomConnector && !piece.connections.includes('bottom');
		const checkLeft = hasLeftConnector && !piece.connections.includes('left');
		const checkTop = hasTopConnector && !piece.connections.includes('top');

		if(checkRight && !connectionFound){
			targetElement = this.getElementByPieceId(piece.id + 1)
			targetPiece = this.getPieceFromElement(targetElement, ['piece-id', 'group', 'is-solved', 'jigsaw-type'])

			if(shouldCompare(targetPiece)){
				if(Utils.hasGroup(piece)){
					let container = this.getGroupTopContainer(element);
					containerBoundingBox = this.getBoundingBox(container);
					thisPieceConnectorBoundingBoxRight = this.getConnectorBoundingBoxInGroup(element, 'right', containerBoundingBox);
				} else {
					thisPieceConnectorBoundingBoxRight = this.getConnectorBoundingBox(element, "right");
				}

				let targetContainer, targetPieceConnectorBoundingBox, targetContainerBoundingBox;

				if(Utils.hasGroup(targetPiece)){
					targetContainer = this.getGroupTopContainer(targetElement);
					targetContainerBoundingBox = this.getBoundingBox(targetContainer);
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(targetElement, "left", targetContainerBoundingBox);
				} else {
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetElement, "left");
				}

				console.log('checking right', thisPieceConnectorBoundingBoxRight, targetPieceConnectorBoundingBox)
				if(this.hasCollision(thisPieceConnectorBoundingBoxRight, targetPieceConnectorBoundingBox, element, targetElement)){
					connectionFound = "right";
				} else {
					solvedPieceConnectorBoundingBoxRight = this.getSolvedConnectorBoundingBox(element, "right");
				}
			}
		}

		if(checkBottom && !connectionFound){
			targetElement = this.getElementByPieceId(piece.id + this.piecesPerSideHorizontal)
			targetPiece = this.getPieceFromElement(targetElement, ['piece-id', 'group', 'jigsaw-type', 'is-solved']);

			if(shouldCompare(targetPiece)){
				// flip
				if(Utils.hasGroup(piece)){
					let container = this.getGroupTopContainer(element);
					containerBoundingBox = this.getBoundingBox(container);
					thisPieceConnectorBoundingBoxBottom = this.getConnectorBoundingBoxInGroup(element, 'bottom', containerBoundingBox);
				} else {
					thisPieceConnectorBoundingBoxBottom = this.getConnectorBoundingBox(element, "bottom");
				}

				let targetContainer, targetPieceConnectorBoundingBox, targetContainerBoundingBox;
				if(Utils.hasGroup(targetPiece)){
					targetContainer = this.getGroupTopContainer(targetElement);
					targetContainerBoundingBox = this.getBoundingBox(targetContainer);
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(targetElement, "top", targetContainerBoundingBox)
				} else {
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetElement, "top");
				}
	
				if(this.hasCollision(thisPieceConnectorBoundingBoxBottom, targetPieceConnectorBoundingBox, element, targetElement)){
					connectionFound = "bottom";
				} else {
					solvedPieceConnectorBoundingBoxBottom = this.getSolvedConnectorBoundingBox(element, "bottom");
				}
			}
		}

		if(checkLeft && !connectionFound){
			targetElement = this.getElementByPieceId(piece.id - 1);
			targetPiece = this.getPieceFromElement(targetElement, ['piece-id', 'group', 'is-solved', 'jigsaw-type'])
			// console.log('checking left connection');
			// console.log('source', element, 'target', targetElement);

			if(shouldCompare(targetPiece)){
				if(!this.isMovingSinglePiece){
					let container = this.getGroupTopContainer(element);
					containerBoundingBox = this.getBoundingBox(container);
					thisPieceConnectorBoundingBoxLeft = this.getConnectorBoundingBoxInGroup(element, 'left', containerBoundingBox);
				} else {
					thisPieceConnectorBoundingBoxLeft = this.getConnectorBoundingBox(element, "left");
				}

				let targetContainer, targetPieceConnectorBoundingBox, targetContainerBoundingBox;
				// console.log('checking left', Utils.hasGroup(targetPiece), targetPiece)
				if(Utils.hasGroup(targetPiece)){
					targetContainer = this.getGroupTopContainer(targetElement);
					targetContainerBoundingBox = this.getBoundingBox(targetContainer);
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(targetElement, "right", targetContainerBoundingBox);
				} else {
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetElement, "right");
				}
				
				console.log('checking left', thisPieceConnectorBoundingBoxLeft, targetPieceConnectorBoundingBox)
				if(this.hasCollision(thisPieceConnectorBoundingBoxLeft, targetPieceConnectorBoundingBox, element, targetElement)){
					connectionFound = "left";
				} else {
					solvedPieceConnectorBoundingBoxLeft = this.getSolvedConnectorBoundingBox(element, "left");
				}
			}
		}

		if(checkTop && !connectionFound){
			targetElement = this.getElementByPieceId(piece.id - this.piecesPerSideHorizontal)
			targetPiece = this.getPieceFromElement(targetElement, ['piece-id', 'group', 'jigsaw-type', 'is-solved']);

			if(shouldCompare(targetPiece)){ 
				if(Utils.hasGroup(piece)){
					let container = this.getGroupTopContainer(element);
					containerBoundingBox = this.getBoundingBox(container);
					thisPieceConnectorBoundingBoxTop = this.getConnectorBoundingBoxInGroup(element, 'top', containerBoundingBox);
				} else {
					thisPieceConnectorBoundingBoxTop = this.getConnectorBoundingBox(element, "top");
				}

				let targetContainer, targetPieceConnectorBoundingBox, targetContainerBoundingBox;
				if(Utils.hasGroup(targetPiece)){
					targetContainer = this.getGroupTopContainer(targetElement);
					targetContainerBoundingBox = this.getBoundingBox(targetContainer);
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(targetElement, "bottom", targetContainerBoundingBox);
				} else {
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetElement, "bottom");
				}

				if(this.hasCollision(thisPieceConnectorBoundingBoxTop, targetPieceConnectorBoundingBox)){
					connectionFound = "top";
				} else {
					solvedPieceConnectorBoundingBoxTop = this.getSolvedConnectorBoundingBox(element, "top");
				}
			}
		}

		const floatCheckTop = !connectionFound && checkTop && this.hasCollision(thisPieceConnectorBoundingBoxTop, solvedPieceConnectorBoundingBoxTop);
		const floatCheckRight = !connectionFound && checkRight && this.hasCollision(thisPieceConnectorBoundingBoxRight, solvedPieceConnectorBoundingBoxRight);
		const floatCheckBottom = !connectionFound && checkBottom && this.hasCollision(thisPieceConnectorBoundingBoxBottom, solvedPieceConnectorBoundingBoxBottom);
		const floatCheckLeft = !connectionFound && checkLeft && this.hasCollision(thisPieceConnectorBoundingBoxLeft, solvedPieceConnectorBoundingBoxLeft);

		if(floatCheckTop || floatCheckRight || floatCheckBottom || floatCheckLeft){
			connectionFound = 'float';
		}
		
		return connectionFound && {
			type: connectionFound,
			sourceEl: element,
			targetEl: connectionFound !== 'float' && !Utils.isCornerConnection(connectionFound) && targetElement
		}
	}

	hasCollision(source, target, sourceEl, targetEl){
		console.log('source', source);
		if(sourceEl){
			console.log('source element', sourceEl);
		}
		console.log('target', target);
		if(targetEl){
			console.log('target element', targetEl);
		}
		if([source.left, source.right, source.bottom, source.top, target.left, target.top, target.right, target.bottom].includes(NaN)) return false;
		return !(source.left >= target.right || source.top >= target.bottom || 
		source.right <= target.left || source.bottom <= target.top);
	}

	getElementByPieceId(id){
		return document.querySelectorAll(`[data-piece-id='${id}']`)[0];
	}

	// deprecated
	getPieceByElement(element){
		return this.pieces.find(p => p.id === parseInt(element.getAttribute("data-piece-id")))
	}

	// deprecated
	getPieceById(id){
		return this.pieces.find(p => p.id === id);
	}

	updateGroupContainerSize(container, el){
		if(el.offsetLeft + el.offsetWidth > container.offsetWidth){
			let newVal = (el.offsetLeft + el.offsetWidth) - container.offsetWidth;
			container.style.width = this.getPxString(container.offsetWidth + newVal)
		}
		if(el.offsetTop + el.offsetHeight > container.offsetHeight){
			let newVal = (el.offsetTop + el.offsetHeight) - container.offsetHeight;
			container.style.height = this.getPxString(container.offsetHeight + newVal)
		}
	}

	setPiecePosition(el, pos){
		const { top, left } = pos;
		el.style.top = this.getPxString(top);
		el.style.left = this.getPxString(left);
	}

	// Deprecated?
	fixPiecePositionIfNecessary(el, connection){
		let targetElement, elBB, targetElOffset, targetElContainer, expectedValue;
		const { id } = this.getPieceFromElement(el, ['piece-id']);
		switch(connection){
			case "top":
				targetElement = this.getElementByPieceId(id - this.piecesPerSideHorizontal);
				if(this.getGroup(targetElement)){
					targetElOffset = parseInt(this.getDataAttributeValue(targetElement, 'position-within-container-top'));
					expectedValue = targetElOffset + targetElement.offsetHeight - this.connectorSize;
				} else {
					expectedValue = targetElement.offsetTop + targetElement.offsetHeight - this.connectorSize;
				}
				if(parseInt(el.style.top) !== expectedValue){
					el.style.top = this.getPxString(expectedValue);
				}
				break;
			case "right":
				targetElement = this.getElementByPieceId(id + 1);
				expectedValue = targetElement.offsetLeft - el.offsetWidth + this.connectorSize;
				if(parseInt(el.style.left) !== expectedValue){
					el.style.left = this.getPxString(expectedValue);
				}
				break;
			case "bottom":
				targetElement = this.getElementByPieceId(id + this.piecesPerSideHorizontal);
				expectedValue = targetElement.offsetTop - el.offsetHeight + this.connectorSize;
				if(parseInt(el.style.top) !== expectedValue){
					el.style.top = this.getPxString(expectedValue);
				}
				break;
			case "left":
				targetElement = this.getElementByPieceId(id - 1);
				expectedValue = targetElement.offsetLeft + targetElement.offsetWidth - this.connectorSize;
				if(parseInt(el.style.left) !== expectedValue){
					el.style.left = this.getPxString(expectedValue);
				}
				break;
		}
	}

	getConnectionsForPiece(piece){
		const connections = [];
		const p = this.getPieceFromElement(piece, ['piece-id', 'jigsaw-type', 'group']);

		const pieceTop = !Utils.isTopEdgePiece(p) && this.getElementByPieceId(p.id - this.piecesPerSideHorizontal);
		const pieceRight = !Utils.isRightEdgePiece(p) && this.getElementByPieceId(p.id + 1);
		const pieceBottom = !Utils.isBottomEdgePiece(p) && this.getElementByPieceId(p.id + this.piecesPerSideHorizontal);
		const pieceLeft = !Utils.isLeftEdgePiece(p) && this.getElementByPieceId(p.id - 1);

		const pieceTopGroup = pieceTop ? this.getGroup(pieceTop) : null;
		const pieceRightGroup = pieceRight ? this.getGroup(pieceRight) : null;
		const pieceBottomGroup = pieceBottom ? this.getGroup(pieceBottom) : null;
		const pieceLeftGroup = pieceLeft ? this.getGroup(pieceLeft) : null;
		
		if(pieceTopGroup && pieceTopGroup === p.group && !connections.includes('top')){
			connections.push('top');
		}
		if(pieceRightGroup && pieceRightGroup === p.group && !connections.includes('right')){
			connections.push('right');
		}
		if(pieceBottomGroup && pieceBottomGroup === p.group && !connections.includes('bottom')){
			connections.push('bottom');
		}
		if(pieceLeftGroup && pieceLeftGroup === p.group && !connections.includes('left')){
			connections.push('left');
		}
		return connections;
	}

	updateConnections(group){
		const pieces = this.getPiecesInGroup(group);
		pieces.forEach(p => {
			const connections = this.getConnectionsForPiece(p);
			this.setElementAttribute(p, 'data-connections', connections.join(", "))
		});
	}

	isNumber(val){
		return val !== undefined && val !== null && Number.isInteger(val);
	}

	getPxString(value){
		return value + 'px';
	}

	draw(ctx, pieces, showGuides){
		ctx.restore();
console.log(pieces)
		const hasImgs = pieces[0] instanceof HTMLDivElement && pieces[0].childNodes[0].nodeName.toLowerCase() === "img";
console.log("hasimages", hasImgs)
		const path = new Path2D();

		if(!hasImgs){
			pieces.forEach(p => {
				if(!p.imageUri){
					this.drawJigsawShape(ctx, path, p, {x: p.solvedX, y: p.solvedY}, showGuides);
				}
			});
			
			ctx.save();
			// ctx.stroke(path);
			ctx.clip(path);
		}

		pieces.forEach(el => {
			// trout
			let img, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH;

			const p = el.dataset;
			console.log("data for piece", p)
			if(hasImgs){
				img = el.childNodes[0];

				sourceX = sourceY = 0;
				sourceW = parseFloat(p.imgw);
				sourceH = parseFloat(p.imgh);

				destX = parseFloat(p.solvedx);
				destY = parseFloat(p.solvedy);
				destW = el.offsetWidth;
				destH = el.offsetHeight;
			} else {
				sourceX = p.imgX;
				sourceY = p.imgY;
				sourceW = p.imgW;
				sourceH = p.imgH;

				img = this.SourceImage;
				destX = p.solvedX;
				destY = p.solvedY;
			}


			console.log("drawing image", img, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH)

			ctx.drawImage(
				img,
				sourceX,
				sourceY,
				sourceW, 
				sourceH, 
				destX,
				destY, 
				destW, 
				destH
			);

			if(img instanceof HTMLImageElement){
				img.remove();
			}
		});

		// const newX = Math.min(...pieces.map(p => p.solvedX));
		// const newY = Math.min(...pieces.map(p => p.solvedY));
		// const newW = Math.max(...pieces.map(p => p.solvedX + p.imgW)) - newX;
		// const newH = Math.max(...pieces.map(p => p.solvedY + p.imgH)) - newY;
		// console.log(newX, newY, newW, newH)
		// const imgData = ctx.getImageData(newX, newY, newW, newH);

		// const imageData = { x: newX, y: newY, w: newW, h: newH, imgData };
		const imageData = {};

		return { path, imageData };
	}

	drawPiecesIntoGroup(groupId, pieces, showGuides = false){
		const cnv = document.querySelector(`#group-canvas-${groupId}`);
		const ctx = cnv.getContext("2d");
		ctx.imageSmoothingEnabled = false;

		this.draw(ctx, pieces, showGuides, true);
	}

	createGroupContainer(pieceAEl, pieceBEl, group){
		// salmon
		const pieceA = this.getPieceFromElement(pieceAEl, ['piece-id', 'jigsaw-type', 'imgw', 'imgh', 'imgx', 'imgy', 'solvedx', 'solvedy', 'num-pieces-from-left-edge', 'num-pieces-from-top-edge', 'connections']);
		const pieceB = this.getPieceFromElement(pieceBEl, ['piece-id', 'jigsaw-type', 'imgw', 'imgh', 'imgx', 'imgy', 'solvedx', 'solvedy', 'num-pieces-from-left-edge', 'num-pieces-from-top-edge', 'connections']);

		const leftPos = pieceBEl.offsetLeft - pieceB.solvedX;
		const topPos = pieceBEl.offsetTop - pieceB.solvedY;

		const container = document.createElement('div');
		container.id = `group-container-${group}`;
		container.classList.add('group-container');

		container.style.top = this.getPxString(topPos);
		container.style.left = this.getPxString(leftPos);
		
		container.appendChild(pieceAEl);
		container.appendChild(pieceBEl);
		pieceAEl.style.left = this.getPxString(pieceA.solvedX);
		pieceAEl.style.top = this.getPxString(pieceA.solvedY);
		pieceBEl.style.left = this.getPxString(pieceB.solvedX);
		pieceBEl.style.top = this.getPxString(pieceB.solvedY);

		container.style.position = 'absolute';

		this.canvas.prepend(container);
		
		const cnv = document.createElement('canvas');
		container.prepend(cnv);
		cnv.classList.add('group-canvas');
		cnv.setAttribute('id', `group-canvas-${group}`);
		cnv.style.width = this.getPxString(this.boardSize.width);
		cnv.width = this.boardSize.width;
		cnv.style.height = this.getPxString(this.boardSize.height);
		cnv.height = this.boardSize.height;

		const ctx = cnv.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctx.save();
		
		return container;
	}

	setPiecePositionsWithinContainer(arg){
		const updateFn = el => {
			const pos = this.getElementBoundingBoxRelativeToTopContainer(el);
			this.setElementAttribute(el, 'data-position-within-container-top', pos.top);
			this.setElementAttribute(el, 'data-position-within-container-left', pos.left);
		};
		if(arg instanceof Array){
			arg.forEach( updateFn )
		} else {
			updateFn(arg);
		}
	}

	createGroup(elementA, elementB){
		const groupId = new Date().getTime();

		const container = this.createGroupContainer(elementA, elementB, groupId)
		this.setElementAttribute(elementA, "data-group", groupId)
		this.setElementAttribute(elementB, "data-group", groupId)

		this.updateConnections(groupId);

		// TODO: Refactor Util methods to expect type array only, not piece object containing it.
		// Not sure if this logic is entirely applicable...
		const elementAIsSolved = this.getIsSolved(elementA);
		const elementBIsSolved = this.getIsSolved(elementB);

		if(elementAIsSolved || elementBIsSolved){
			this.setElementAttribute(elementA, "data-is-solved", true)
			this.setElementAttribute(elementB, "data-is-solved", true)
			this.setElementAttribute(container, "data-is-solved", true)
		}

		this.drawPiecesIntoGroup(groupId, [elementA, elementB]);

		this.save([elementA, elementB]);

		return {
			groupId,
			container
		}
	}

	getPiecesInGroup(group){
		return document.querySelectorAll(`[data-group='${group}']`)
	}

	assignPiecesToTopGroup(pieces){
		const container = this.getGroupTopContainer(pieces[0]);
		const group = this.getGroupFromContainer(container);
		pieces.forEach(p => this.setElementAttribute(p, 'data-group', group));
	}

	group(pieceAEl, pieceBEl){
		let pieceA, pieceB;

		console.log("example dataset", pieceAEl.dataset)
		pieceA = this.getPieceFromElement(pieceAEl, ['piece-id', 'jigsaw-type', 'group', 'connections']);
		pieceB = this.getPieceFromElement(pieceBEl, ['piece-id', 'jigsaw-type', 'group', 'connections']);

		if(!this.isNumber(pieceA.group) && !this.isNumber(pieceB.group)){
			return this.createGroup(pieceAEl, pieceBEl);
		} else if(pieceA.group > -1 && !this.isNumber(pieceB.group)){
			this.addToGroup(pieceBEl, pieceA.group);
		} else if(!this.isNumber(pieceA.group) && pieceB.group > -1){
			this.addToGroup(pieceAEl, pieceB.group);
		} else if(pieceAEl && pieceBEl){
			this.mergeGroups(pieceAEl, pieceBEl);
		}
	}

	addToGroup(element, group){
		// console.log('addToGroup', element, group)
		// console.log(element)
		// console.log(element.dataset)
		// const piece = this.getPieceFromElement(element, ['solvedx', 'solvedy']);

		const solvedX = parseInt(element.dataset.solvedx);
		const solvedY = parseInt(element.dataset.solvedy);

		const targetGroupContainer = this.getGroupContainer(group);
		const isTargetGroupSolved = this.isGroupSolved(group) || group === 1111;

		// Add element(s) to target group container
		const oldGroup = this.getGroup(element);
		let followingEls = [];

		if(oldGroup){
			let container = this.getGroupContainer(oldGroup);
			followingEls = container.querySelectorAll('.puzzle-piece');

			followingEls.forEach(el => {
				targetGroupContainer.prepend(el);
				el.setAttribute('data-group', group);
				if(isTargetGroupSolved){
					el.setAttribute('data-is-solved', true);
				}
			});
			
			container.remove();
		} else {
			element.setAttribute('data-group', group);

			if(!this.isMovingSinglePiece){
				targetGroupContainer.style.top = this.getPxString(element.offsetTop - solvedY);
				targetGroupContainer.style.left = this.getPxString(element.offsetLeft - solvedX);
			}

			// Add element to group and set its position
			targetGroupContainer.prepend(element);
			this.setPiecePosition(element, {left: solvedX, top: solvedY});

			// Hide original canvas belonging to piece
			const oldCnv = element.querySelector('canvas');
			if(oldCnv){
				oldCnv.remove()
			}

			followingEls.push(element);
		}

		// Re-draw group with new piece
		const elementsInTargetGroup = this.getPiecesInGroup(group);
		const allPieces = [...elementsInTargetGroup, ...followingEls].map(el => this.getPieceFromElement(el, ['piece-id', 'is-solved', 'jigsaw-type', 'solvedx', 'solvedy', 'imgx', 'imgy', 'imgw', 'imgh', 'connections']))
		this.drawPiecesIntoGroup(group, allPieces);

		// Update all connections
		this.updateConnections(group);
	}

	readyCanvas(group){
		const cnv = document.querySelector(`#group-canvas-${group}`);
		const ctx = cnv.getContext('2d');
		ctx.restore();
	}
	
	mergeGroups(pieceA, pieceB){
		const pieceAGroup = this.getGroup(pieceA);
		const pieceBGroup = this.getGroup(pieceB);
		const piecesInGroupA = this.getPiecesInGroup(pieceAGroup);

		if(this.isGroupSolved(pieceAGroup) || this.isGroupSolved(pieceAGroup)){
			const containerA = this.getGroupContainer(pieceAGroup);
			const containerB = this.getGroupContainer(pieceBGroup);
			this.setElementAttribute(containerA, 'is-solved', true);
			this.setElementAttribute(containerB, 'is-solved', true);
		}

		this.addToGroup(piecesInGroupA[0], pieceBGroup);
	}

	isGroupSolved(group){
		return Array.from(this.getPiecesInGroup(group)).some(p => this.getIsSolved(p));
	}

	initiFullImagePreviewer(){
		this.fullImageViewerEl.style.left = this.boardLeft + "px";
		this.fullImageViewerEl.style.top = this.boardTop + "px";
		this.fullImageViewerEl.setAttribute('width', this.boardWidth);
		this.fullImageViewerEl.setAttribute('height', this.boardHeight);
		const previewctx = this.fullImageViewerEl.getContext('2d');
		previewctx.drawImage(
			this.SourceImage, 
			this.selectedOffsetX,
			this.selectedOffsetY,
			Math.round(this.selectedWidth),
			Math.round(this.selectedHeight),
			0,
			0, 
			Math.round(this.boardWidth), 
			Math.round(this.boardHeight)
		)
	}

	isPuzzleComplete(){
		return Array.from(this.allPieces()).filter(p => this.getIsSolved(p)).length === this.selectedNumPieces;
	}

	getPieceFromElement(el, keys){
		if(!el) return;

		const data = {};
		keys.forEach(k => {
			if(k == 'piece-id'){
				data.id = parseInt(this.getDataAttributeValue(el, 'piece-id'));
			}
			if(k == 'piece-id-in-persistence'){
				data._id = this.getDataAttributeValue(el, 'piece-id-in-persistence');
			}
			if(k == 'puzzle-id'){
				data.puzzleId = this.getDataAttributeValue(el, 'puzzle-id');
			}
			if(k == 'imgx'){
				data.imgX = parseFloat(this.getDataAttributeValue(el, 'imgX'));
			}
			if(k == 'imgy'){
				data.imgY = parseFloat(this.getDataAttributeValue(el, 'imgY'));
			}
			if(k == 'solvedx'){
				data.solvedX = parseInt(this.getDataAttributeValue(el, 'solvedX'));
			}
			if(k == 'solvedy'){
				data.solvedY = parseInt(this.getDataAttributeValue(el, 'solvedY'));
			}
			if(k == 'imgw'){
				data.imgW = parseInt(this.getDataAttributeValue(el, 'imgW'));
			}
			if(k == 'imgh'){
				data.imgH = parseInt(this.getDataAttributeValue(el, 'imgH'));
			}
			if(k == 'num-pieces-from-top-edge'){
				data.numPiecesFromTopEdge = parseInt(this.getDataAttributeValue(el, 'num-pieces-from-top-edge'));
			}
			if(k == 'num-pieces-from-left-edge'){
				data.numPiecesFromLeftEdge = parseInt(this.getDataAttributeValue(el, 'num-pieces-from-left-edge'));
			}
			if(k == 'jigsaw-type'){
				const type = this.getDataAttributeValue(el, 'jigsaw-type');
				if(type){
					data.type = type.split(',').map(n => parseInt(n));
				} else {
					console.warn(`Can't get type for piece ${el.toString()}`)
				}
			}
			if(k == 'connections'){
				const connections = el.dataset.connections;
				data.connections = connections ? connections.indexOf(',') > 0 ? connections.split(',') : [connections] : [];
			}
			if(k == 'connects-to'){
				data.connectsTo = this.getDataAttributeValue(el, 'connects-to');
			}
			if(k == 'is-inner-piece'){
				const isInnerPiece = this.getDataAttributeValue(el, 'is-inner-piece');
				data.isInnerPiece = isInnerPiece == "true" ? true : false;
			}
			if(k == 'is-solved'){
				let groupIsSolved;
				if(this.getGroup(el)){
					const container = this.getGroupContainer(el);
					if(this.getDataAttributeValue(container, 'is-solved')){
						groupIsSolved = true;
					}
				}
				data.isSolved = this.getIsSolved(el) || groupIsSolved;
			}
			if(k == 'group'){
				data.group = this.getGroup(el);
			}
			if(k == 'image-uri'){
				data.imageUri = this.getDataAttributeValue(el, "image-uri");
			}

			data.pageX = el.offsetLeft;
			data.pageY = el.offsetTop;

			if(Utils.hasGroup({group: this.getGroup(el)})){
				let posInContainer = this.getElementBoundingBoxRelativeToTopContainer(el);
				let container = el.parentNode;
				data.containerX = container.offsetLeft;
				data.containerY = container.offsetTop;
				data.pageX = posInContainer.left;
				data.pageY = posInContainer.top;
			}
		})
		return data;
	}

	saveToLocalStorage(){
		const payload = [];
		let time = Date.now();
	
		[...this.allPieces()].forEach(p => {
			delete p._id;
			payload.push(this.getPieceFromElement(p, this.DATA_ATTR_KEYS));
		});
	
		const progressKey = getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_PROGRESS_KEY");
		const lastSaveKey = getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY");
	
		console.info(`[Puzzly] Saving to local storage, key ${progressKey}:`, payload)
		localStorage.setItem(progressKey, JSON.stringify(payload));
		console.info(`[Puzzly] Saving to local storage, key ${lastSaveKey}:`, time)
		localStorage.setItem(lastSaveKey, time);
	}

	setElementIdsFromPersistence(pieces){
		const allPieces = this.allPieces();
		pieces.forEach(p => {
			let { imgX, imgY, _id } = p;
			imgX = "" + imgX;
			imgY = "" + imgY;
			const el = Utils.querySelectorFrom(`[data-imgx='${imgX}'][data-imgy='${imgY}']`, allPieces)[0];
			this.setElementAttribute(el, 'data-piece-id-in-persistence', _id)
		})
	}

	async save(pieces){
		const payload = [];
	
		pieces.forEach( p => {
			delete p._id;
			payload.push(this.getPieceFromElement(p, this.DATA_ATTR_KEYS));
		});
		
		const isFirstSave = !payload[0]?._id;
	
		fetch(`/api/pieces/${this.puzzleId}`, {
			method: isFirstSave ? 'post' : 'put',
			headers: {
				'Content-Type': 'Application/json'
			},
			body: JSON.stringify(payload)
		})
		.then( res => {
			if(!res.ok){
				this.saveToLocalStorage();
				return;
			}
			return res.json() 
		})
		.then( res => {
			if(isFirstSave){
				this.setElementIdsFromPersistence(res.data)
			}
	
			if(res.status === "failure"){
				console.info('[Puzzly] Save to DB failed, saving to Local Storage instead.');
				localStorage.setItem('puzzly', {
					lastSaveDate: Date.now(),
					progress: payload
				})
			}
		})
	}
}

window.Puzzly = Puzzly;
