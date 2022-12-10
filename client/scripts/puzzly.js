import Pockets from "./pockets.js";
import Utils from "./utils.js";

/** 
 * Puzzly
 * 
*/

const ZOOM_INTERVAL = .1;
const DEFAULT_ZOOM_LEVEL = 1;
class Puzzly {
	constructor(canvasId, puzzleId, config){
		Object.assign(this, {
			...config,
			debug: true,
			showDebugInfo: false,
			jigsawSpriteConnectorSize: 42,
			jigsawSpriteConnectorDistanceFromCorner: 43,
			piecesPerSideHorizontal: config.selectedShape === 'Rectangle' ? config.piecesPerSideHorizontal : Math.sqrt(config.selectedNumPieces),
			piecesPerSideVertical: config.selectedShape === 'Rectangle' ? config.piecesPerSideVertical : Math.sqrt(config.selectedNumPieces),
			drawOutlines: config.drawOutlines || false,
			drawSquares: false,
		});

		console.log(config)

		this.pieces = config.pieces;
		this.connectorSize = this.connectorWidth;

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

		this.isMovingSinglePiece = false;
		this.movingElement = null;
		this.puzzleId = puzzleId;
		this.progress = config.pieces || [];
		
		this.innerPiecesVisible = config.innerPiecesVisible !== undefined ? config.innerPiecesVisible : true;
		this.movingPieces = [];
		this.loadedAssets = [];
		this.previewImage = new Image();
		this.previewImage.src = this.puzzleImgPath;
		this.sprite = new Image();
		this.sprite.src = this.spritePath;
		this.shadowSprite = new Image();
		this.shadowSprite.src = this.shadowSpritePath;

		this.previewImageAlwaysOn = true;

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
			this.randomisePiecePositions();
			this.save(allPieces);
		})

		this.sendToEdgeNeatenBtn.addEventListener(this.interactionEventDown, e => {
			this.arrangePieces();
			this.onControlsHandleClick();
		})

		window.addEventListener("dragmove", e => console.log("Puzzly: dragmove", e))

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

		if(this.imagePreviewType === "alwaysOn"){
			this.previewBtn.style.display = "none";
		} else {
			this.previewBtn.addEventListener(this.interactionEventDown, this.togglePreviewer.bind(this))
		}

		this.filterBtn.addEventListener(this.interactionEventDown, this.toggleInnerPieces.bind(this))
		this.soundsBtn.addEventListener(this.interactionEventDown, this.toggleSounds.bind(this))

		this.DATA_ATTR_KEYS = [
			'piece-id', 'piece-id-in-persistence', 'puzzle-id', 'imgx', 'imgy', 'imgw', 'imgh', 'num-pieces-from-top-edge', 'num-pieces-from-left-edge', 'jigsaw-type', 'connections', 'connects-to', 'is-inner-piece', 'is-solved', 'group', 'solvedx', 'solvedy', 'pocket-id'
		];

		const assets = [
			this.previewImage,
			this.sprite,
			this.shadowSprite,
		];

		this.loadAssets(assets).then( () => {
			this.init()
		})
	}

	init(){
		console.log(this)

		this.zoomLevel = 1;

		this.boardHeight = this.boardWidth = this.boardSize;
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

		this.shadowOffset = this.pieceSize / 100 * 2;

		this.connectorToleranceAmount = 40;
		this.connectorTolerance = this.connectorSize / 100 * ((100 - this.connectorToleranceAmount) / 2);

		
		this.floatToleranceAmount = 20;
		this.floatTolerance = this.pieceSize / 100 * this.floatToleranceAmount;
		this.collisionBoxWidth = this.pieceSize - this.floatTolerance;

		this.largestPieceSpan = this.pieceSize + (this.connectorSize * 2);
		this.pieceSeparationDistance = this.largestPieceSpan + 20;
		
		this.canvasWidth = window.innerWidth;
		this.canvasHeight = window.innerHeight;
		
		this.drawBoardArea();

		this.boardTop = this.boardAreaEl.offsetTop;
		this.boardRight = this.boardAreaEl.offsetLeft + this.boardAreaEl.offsetWidth;
		this.boardBottom = this.boardAreaEl.offsetTop + this.boardAreaEl.offsetHeight;
		this.boardLeft = this.boardAreaEl.offsetLeft;
		this.boardWidth = this.boardAreaEl.offsetWidth;
		this.boardHeight = this.boardAreaEl.offsetHeight;

		this.Pockets = new Pockets(this);

		this.makeSolvedCanvas();
		this.initiFullImagePreviewer();
		this.generatePieceSectorMap();
		
		this.isFullImageViewerActive = false;

		const storage = this.getApplicablePersistence(this.pieces, this.lastSaveDate);

		if(storage?.pieces?.length > 0){
			storage.pieces.forEach(p => {
				this.renderJigsawPiece(p);
				if(p.group !== undefined && p.group !== null){
					this.groups[p.group]?.pieces ? this.groups[p.group].pieces.push(p) : this.groups[p.group] = { pieces: [p] };
				}
			});

			if(Object.keys(this.groups).length){
				for(let g in this.groups){
					const elements = this.getPiecesInGroup(g);
					this.drawPiecesIntoGroup(g, elements);
				}
			}

			this.initGroupContainerPositions(storage.pieces)
		} else {
			this.piecePositionMap = this.shuffleArray(this.getRandomCoordsFromSectorMap());
			this.renderPieces(this.pieces);
			this.assignPieceConnections();
		}

		// this.wrapPiecesAroundBoard();
		// this.arrangePieces()

		this.timeStarted = new Date().getTime();

		addEventListener("beforeunload", function(e) {
			this.updateElapsedTime();
		}.bind(this))
		
		this.innerPieces = document.querySelectorAll('.inner-piece');

		window.addEventListener(this.interactionEventDown, this.onMouseDown.bind(this));

		const newPuzzleBtn = document.getElementById("js-create-new-puzzle");
		newPuzzleBtn.addEventListener(this.interactionEventDown, () => {
			window.location = "/";
		})

		window.addEventListener(this.interactionEventUp, this.onMouseUp.bind(this));
		window.addEventListener('keydown', this.onKeyDown.bind(this));
		window.addEventListener("puzzly_save", e => {
			this.save(e.detail.pieces)
		})
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
		element.style.width = this.boardSize + "px";
		element.style.height = this.boardSize + "px";
	}

	makeSolvedCanvas(){
		const solvedCnvContainer = document.getElementById('group-container-1111');
		solvedCnvContainer.style.pointerEvents = 'none';
		solvedCnvContainer.style.top = this.getPxString(this.boardTop);
		solvedCnvContainer.style.left = this.getPxString(this.boardLeft);
		solvedCnvContainer.style.width = this.boardWidth + this.shadowOffset;
		solvedCnvContainer.style.height = this.boardHeight + this.shadowOffset;
		const solvedCnv = document.getElementById('group-canvas-1111');
		// solvedCnv.style.pointerEvents = 'none';
		solvedCnv.width = this.boardWidth + this.shadowOffset;
		solvedCnv.height = this.boardHeight + this.shadowOffset;
		solvedCnv.style.width = this.getPxString(this.boardWidth + this.shadowOffset);
		solvedCnv.style.height = this.getPxString(this.boardHeight + this.shadowOffset);
	}
	
	onKeyDown(event){
		// https://stackoverflow.com/questions/995914/catch-browsers-zoom-event-in-javascript
	
		if ((event.ctrlKey || event.metaKey) && (event.which === 61 || event.which === 107 || event.which === 173 || event.which === 109  || event.which === 187  || event.which === 189 || event.which === 48) ) {
			event.preventDefault();
			
			// Plus key
			if(event.which === 187){
				this.zoomLevel += ZOOM_INTERVAL;
			}

			// Minus key
			if(event.which === 189 && this.zoomLevel){
				this.zoomLevel -= ZOOM_INTERVAL;
			}

			// "0" Number key
			if(event.which === 48){
				this.zoomLevel = DEFAULT_ZOOM_LEVEL;
			}
			
			if(this.isPreviewActive){
				this.updatePreviewerSizeAndPosition();
			}
	
			this.canvas.style.transform = `scale(${this.zoomLevel})`;
			this.canvas.style.transformOrigin = "50% 50%";

			this.Pockets.setScale(this.zoomLevel);
		}
	}

	getRandomCoordsFromSectorMap(){
		return this.pieceSectors.map(s => ({
			x: Utils.getRandomInt(s.x, s.x + s.w),
			y: Utils.getRandomInt(s.y, s.y + s.h)
		}))
	}

	getSequentialArray(start, end, shuffle = false){
		let arr = [];
		for(let i = start, l = end - start; i < l; i++){
			arr.push(i);
		}

		if(shuffle){
			arr = this.shuffleArray(arr);
		}

		return arr;
	}

	randomisePiecePositions(){
		const sectors = this.getSequentialArray(0, this.selectedNumPieces, true);
		// console.log("sectors", sectors)
		this.pieces.forEach((p, i) => {
			const el = Utils.getElementByPieceId(p.id);
			const sector = this.pieceSectors[sectors[i]];
			// const a = document.createElement("div");
			// a.style.position = "absolute";
			// a.style.top = sector.y + "px";
			// a.style.left = sector.x + "px";
			// a.style.width = sector.w + "px";
			// a.style.height = sector.h + "px";
			// a.style.border = "2px solid blue";
			// document.body.appendChild(a);
			const pos = {
				x: Utils.getRandomInt(sector.x, sector.x + sector.w - p.imgW),
				y: Utils.getRandomInt(sector.y, sector.y + sector.h - p.imgH),
			}
			el.style.top = pos.y + "px";
			el.style.left = pos.x + "px";
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

	renderJigsawPiece(piece){
		let el, fgEl, bgEl;

		const solvedCnvContainer = document.getElementById('group-container-1111');

		el = document.createElement('div');
		el.classList.add('puzzle-piece')
		// el.addEventListener("dragstart", () => false);
		
		el.style.position = "absolute";
		el.width = piece.pieceWidth;
		el.height = piece.pieceHeight;
		el.style.width = piece.pieceWidth + "px";
		el.style.height = piece.pieceHeight + 'px';

		console.log(piece.pocketId)
		if(piece.pocketId === undefined || piece.pocketId === null){
			el.style.top = (!!piece.group ? piece.solvedY : piece.pageY) + "px";
			el.style.left = (!!piece.group ? piece.solvedX : piece.pageX) + "px";
		}
		el.style.pointerEvents = 'auto';
		el.style.zIndex = 1;

		el.setAttribute('data-jigsaw-type', piece.type.join(","))
		el.setAttribute('data-piece-id', piece.id)
		el.setAttribute('data-piece-id-in-persistence', piece._id)
		el.setAttribute('data-puzzle-id', piece.puzzleId)
		el.setAttribute('data-imgX', piece.imgX)
		el.setAttribute('data-imgy', piece.imgY)
		el.setAttribute('data-solvedX', piece.solvedX)
		el.setAttribute('data-solvedY', piece.solvedY)
		el.setAttribute('data-pageX', piece.pageX)
		el.setAttribute('data-pageY', piece.pageY)
		el.setAttribute('data-spriteX', piece.spriteX)
		el.setAttribute('data-spriteY', piece.spriteY)
		el.setAttribute('data-imgW', piece.imgW)
		el.setAttribute('data-imgH', piece.imgH)
		el.setAttribute('data-is-inner-piece', piece.isInnerPiece)
		el.setAttribute('data-num-pieces-from-top-edge', piece.numPiecesFromTopEdge)
		el.setAttribute('data-num-pieces-from-left-edge', piece.numPiecesFromLeftEdge)
		el.setAttribute('data-is-solved', piece.isSolved)
		
		if(!!piece.group){
			el.setAttribute('data-group', piece.group)
		}

		if(piece.pocketId){
			el.setAttribute('data-pocket-id', piece.pocketId)
		}

		fgEl = document.createElement('div');
		fgEl.classList.add('puzzle-piece-fg');
		fgEl.style.backgroundImage = `url(${this.spritePath}`;
		fgEl.style.backgroundPositionX = piece.spriteX === 0 ? 0 : '-' + piece.spriteX + 'px';
		fgEl.style.backgroundPositionY = piece.spriteY === 0 ? 0 : '-' + piece.spriteY + 'px';
		fgEl.style.position = "absolute";
		fgEl.width = piece.pieceWidth;
		fgEl.height = piece.pieceHeight;
		fgEl.style.width = piece.pieceWidth + "px";
		fgEl.style.height = piece.pieceHeight + 'px';
		fgEl.style.top = 0;
		fgEl.style.left = 0;
		fgEl.style.zIndex = 2;
		fgEl.style.pointerEvents = "none";

		bgEl = document.createElement("div");
		bgEl.classList.add('puzzle-piece-bg');
		bgEl.style.position = "absolute";
		bgEl.width = piece.pieceWidth;
		bgEl.height = piece.pieceHeight;
		bgEl.style.width = piece.pieceWidth + "px";
		bgEl.style.height = piece.pieceHeight + 'px';
		bgEl.style.top = this.shadowOffset + "px";
		bgEl.style.left = this.shadowOffset + "px";
		bgEl.style.backgroundImage = `url(${this.shadowSpritePath}`;
		bgEl.style.backgroundPositionX = piece.spriteX === 0 ? 0 : '-' + piece.spriteX + 'px';
		bgEl.style.backgroundPositionY = piece.spriteY === 0 ? 0 : '-' + piece.spriteY + 'px';
		bgEl.style.zIndex = 1;
		bgEl.style.pointerEvents = "none";

		el.appendChild(fgEl);
		el.appendChild(bgEl);

		if(Number.isInteger(piece.pocketId)) {
			// fish
			this.Pockets.addToPocket(piece.pocketId, el);
		} else if(!Utils.hasGroup(piece)){
			this.canvas.appendChild(el);
		} else {
			fgEl.style.visibility = "hidden";
			bgEl.style.visibility = "hidden";

			if(piece.isSolved === undefined){
				let groupContainer = document.querySelector(`#group-container-${piece.group}`);
	
				if(!groupContainer){
					groupContainer = document.createElement('div');
					groupContainer.classList.add('group-container');
					groupContainer.style.pointerEvents = 'none';
					groupContainer.setAttribute('id', `group-container-${piece.group}`);
					groupContainer.style.width = this.getPxString(this.boardSize);
					groupContainer.style.height = this.getPxString(this.boardSize);
					groupContainer.style.position = "absolute";
					groupContainer.style.top = piece.containerY + "px";
					groupContainer.style.left = piece.containerX + "px";
					this.canvas.appendChild(groupContainer);
				}
	
				groupContainer.appendChild(el);
	
				let groupCanvas = groupContainer.querySelector(`#group-canvas-${piece.group}`);
				if(!groupCanvas){
					groupCanvas = document.createElement('canvas');
					groupCanvas.id = `group-canvas-${piece.group}`;
					groupCanvas.style.pointerEvents = 'none';
					groupCanvas.classList.add('group-canvas');
					groupCanvas.width = this.boardSize + this.shadowOffset;
					groupCanvas.height = this.boardSize + this.shadowOffset;
					groupCanvas.style.width = this.getPxString(this.boardSize + this.shadowOffset);
					groupCanvas.style.height = this.getPxString(this.boardSize + this.shadowOffset);
					groupContainer.appendChild(groupCanvas);
				}
	
				if(piece.isSolved && !this.getDataAttributeValue(groupContainer, 'data-is-solved')){
					this.setElementAttribute(groupContainer, 'data-is-solved', true);
				}
			} else {
				solvedCnvContainer.append(el);
			}
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
			let el = Utils.getElementByPieceId(connections[id]);
			el.classList.add('js-highlight');
		}
	}

	removeHighlightFromConnectingPieces(connections){
		for(let id in connections){
			let el = Utils.getElementByPieceId(connections[id]);
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

	onMouseDown(e){
		let element, diffX, diffY, thisPiece;

		if(e.which === 1 || e.touches){
			const clientPos = this.getClientPos(e);

			const classes = e.target.classList
			const isPuzzlePiece = classes.contains("puzzle-piece") && !classes.contains("in-pocket");
			const isPuzzlePieceCanvas = e.target.classList.contains("puzzle-piece-canvas");
			const isPuzzlePieceFg = e.target.classList.contains("puzzle-piece-fg");
			const isStage = e.target.id === "canvas" || e.target.id === "boardArea" || e.target.dataset.group === "1111" || e.target.dataset.issolved;
			
			if(isPuzzlePieceCanvas || isPuzzlePieceFg){
				element = e.target.parentNode;
			}

			if(isPuzzlePiece){
				element = e.target;
			}

			if(isStage){
				this.isMovingStage = true;
				element = this.canvas;
			}

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

			if(isStage){
				diffX = clientPos.x - this.movingElement.offsetLeft;
				diffY = clientPos.y - this.movingElement.offsetTop;					
			} else {
				diffX = clientPos.x - this.movingElement.offsetLeft * this.zoomLevel;
				diffY = clientPos.y - this.movingElement.offsetTop * this.zoomLevel;					
			}

			this.mouseMoveFunc = this.onMouseMove(diffX, diffY);

			if(e.touches){
				this.isTouching = true;
			} else {
				this.isMouseDown = true;
			}

			window.addEventListener(this.interactionEventMove, this.mouseMoveFunc);
		}
	}

	dragIsWithinHorizontalBounds(x){
		return x > 10 && x <= window.innerWidth - 10;
	}

	dragIsAtWithinVerticalBounds(y){
		return y > 10 && y <= window.innerHeight - 10;
	}

	onMouseMove(diffX, diffY){
		return function(e){
			let eventX, eventY, newPosTop, newPosLeft;

			if(this.movingElement){
				eventX = e.touches ? e.touches[0].clientX : e.clientX;
				eventY = e.touches ? e.touches[0].clientY : e.clientY;
				
				if(this.isMovingStage){
					if(this.dragIsWithinHorizontalBounds(eventX)){
						this.movingElement.style.left = eventX - diffX + "px";
					}
					if(this.dragIsAtWithinVerticalBounds(eventY)){
						this.movingElement.style.top = eventY - diffY + "px";
					}
				} else {
					const newPosTop = (eventY / this.zoomLevel) - (diffY / this.zoomLevel);
					const newPosLeft = (eventX / this.zoomLevel) - (diffX / this.zoomLevel);
					this.movingElement.style.top = newPosTop + "px";
					this.movingElement.style.left = newPosLeft + "px";
				}
			}
		}.bind(this)
	}

	onMouseUp(e){
		if(this.isMouseDown && !this.isMovingStage){
			const element = this.movingPiece;
			// console.log('moving piece', element)
			// console.log('element position top', element.offsetTop, 'left', element.offsetLeft)
			const thisPiece = this.getPieceFromElement(element, ['connects-to']);

			if(this.highlightConnectingPieces){
				this.removeHighlightFromConnectingPieces(JSON.parse(thisPiece.connectsTo));
			}

			let hasConnection = false, connection;

			if(!this.isMovingSinglePiece){
				let group = this.getGroup(element);
				const piecesToCheck = this.getCollisionCandidatesInGroup(group);
				console.log('pieces to check', piecesToCheck)

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
		this.isMovingStage = false;

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
		console.log("keeping on top", el)
		el.style.zIndex = this.currentZIndex++;
	}

	getConnectingElement(el, connection){
		const p = this.getPieceFromElement(el, ['piece-id']);
		switch(connection){
			case 'right':
				return Utils.getElementByPieceId(p.id + 1);
			case 'bottom':
				return Utils.getElementByPieceId(p.id + this.piecesPerSideHorizontal);
			case 'left':
				return Utils.getElementByPieceId(p.id - 1);
			case 'top':
				return Utils.getElementByPieceId(p.id - this.piecesPerSideHorizontal);
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
		
		const right = Utils.getElementByPieceId(rightPiece);
		if(right){
			if(unconnectedOnly && !p.connections.includes('right') || !unconnectedOnly){
				arr.push(right);
				obj['right'] = right;
			}
		}
		const bottom = Utils.getElementByPieceId(bottomPiece);
		if(bottom){
			if(unconnectedOnly && !p.connections.includes('bottom') || !unconnectedOnly){
				arr.push(bottom);
				obj['bottom'] = bottom;
			}
		}
		const left = Utils.getElementByPieceId(leftPiece);
		if(left){
			if(unconnectedOnly && !p.connections.includes('left') || !unconnectedOnly){
				arr.push(left);
				obj['left'] = left;
			}
		}
		const top = Utils.getElementByPieceId(topPiece);
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
				
				const element = Utils.getElementByPieceId(p.id);
	
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
		console.log("assets to load", assets)
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
					bottom: this.boardLeft,
					left: this.boardLeft,
				}
			case "top-second-half":
				return {
					top: 0,
					right: this.boardBoundingBox.right,
					bottom: this.boardLeft,
					left: this.boardLeft + this.boardBoundingBox.width / 2,
				}
			case "top-left":
				return {
					top: 0,
					right: this.boardLeft,
					bottom: this.boardLeft,
					left: 0,
				}
			case "right-first-half":
				return {
					top: this.boardLeft,
					right: this.canvasWidth,
					bottom: this.boardLeft + this.boardBoundingBox.height / 2,
					left: this.boardBoundingBox.right,
				}
			case "right-second-half":
				return {
					top: this.boardLeft + this.boardBoundingBox.height / 2,
					right: this.canvasWidth,
					bottom: this.boardBoundingBox.bottom,
					left: this.boardBoundingBox.right,
				}
			case "top-right":
				return {
					top: 0,
					right: this.canvasWidth,
					bottom: this.boardLeft,
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
					top: this.boardLeft + this.boardBoundingBox.height / 2,
					right: this.boardBoundingBox.left,
					bottom: this.boardBoundingBox.bottom,
					left: 0,
				}
			case "left-second-half":
				return {
					top: this.boardLeft,
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

		let currX = 0, currY = 0;

		for(let i=0, l=this.selectedNumPieces; i < l; i++) {
			this.pieceSectors[i] = {
				x: currX,
				y: currY,
				...area
			}

			if(currX + sqr + sqr < window.innerWidth){
				currX += sqr;
			} else {
				currX = 0;
				currY += sqr;
			}
		}
	}

	// Determine when arrangePieces() should start placing pieces on next side
	shouldProceedToNextSide(currentSide, element, firstPieceOnNextSide){
		// console.log("shouldProceedToNextSide()", currentSide, element, firstPieceOnNextSide)
		let targetBox;

		if(firstPieceOnNextSide){
			targetBox = {
				top: parseInt(firstPieceOnNextSide.style.top) * this.zoomLevel,
				right: parseInt(firstPieceOnNextSide.style.left) + firstPieceOnNextSide.offsetWidth * this.zoomLevel,
				bottom: parseInt(firstPieceOnNextSide.style.top) + firstPieceOnNextSide.offsetHeight * this.zoomLevel,
				left: parseInt(firstPieceOnNextSide.style.left) * this.zoomLevel,
			}
		} else {
			targetBox = {
				top: this.boardAreaEl.offsetTop,
				right: this.boardAreaEl.offsetLeft + this.boardAreaEl.offsetWidth,
				bottom: this.boardAreaEl.offsetTop + this.boardAreaEl.offsetHeight,
				left: this.boardAreaEl.offsetLeft,
			};
		}

		const box = {
			top: parseInt(element.style.top) * this.zoomLevel,
			right: parseInt(element.style.left) + element.offsetWidth * this.zoomLevel,
			bottom: parseInt(element.style.top) + element.offsetHeight * this.zoomLevel,
			left: parseInt(element.style.left) * this.zoomLevel,
		}

		switch(currentSide){
			case "top":
				return box.left > targetBox.right || box.right - this.connectorSize > targetBox.right;
			case "right":
				return box.top > targetBox.bottom || box.bottom - this.connectorSize > targetBox.bottom;
			case "bottom":
				return box.right < targetBox.left || box.left + this.connectorSize < targetBox.left;
			case "left":
				return box.bottom < targetBox.top - this.largestPieceSpan || box.top + this.connectorSize < targetBox.top;
		}
	}

	// Each time we start the next side, determine where the first piece should go
	getPositionForFirstPieceOnNextSide(element, nextElement, currentSide, firstPieceOnNextSideFromPreviousIteration){
		// console.log("getPositionForFirstPieceOnNextSide", element, nextElement, currentSide)
		let targetBox;

		if(firstPieceOnNextSideFromPreviousIteration){
			targetBox = {
				top: parseInt(firstPieceOnNextSideFromPreviousIteration.style.top) * this.zoomLevel,
				right: parseInt(firstPieceOnNextSideFromPreviousIteration.style.left) + firstPieceOnNextSideFromPreviousIteration.offsetWidth * this.zoomLevel,
				bottom: parseInt(firstPieceOnNextSideFromPreviousIteration.style.top) + firstPieceOnNextSideFromPreviousIteration.offsetHeight * this.zoomLevel,
				left: parseInt(firstPieceOnNextSideFromPreviousIteration.style.left) * this.zoomLevel,
			}
		} else {
			targetBox = {
				top: this.boardTop,
				right: this.boardRight,
				bottom: this.boardBottom,
				left: this.boardLeft,
			};
		}

		const box = {
			top: parseInt(element.style.top) * this.zoomLevel,
			right: parseInt(element.style.left) + element.offsetWidth * this.zoomLevel,
			bottom: parseInt(element.style.top) + element.offsetHeight * this.zoomLevel,
			left: parseInt(element.style.left) * this.zoomLevel,
		}

		const spacing = 20;

		let x, y;

		switch(currentSide){
			case "top":
				return {
					x: targetBox.right + spacing,
					y: box.bottom + spacing,
				}
			case "right":
				return {
					x: box.left - nextElement?.offsetWidth - spacing,
					y: targetBox.bottom + spacing,
				}
			case "bottom":
				return {
					x: targetBox.left - this.largestPieceSpan - spacing,
					y: box.top - nextElement?.offsetHeight - spacing,
				}
			case "left":
				return {
					x: box.right + spacing,
					y: targetBox.top - this.largestPieceSpan - spacing,
				}
		}
	}

	arrangePieces(dryRun = false){
		const sides = ["top", "right", "bottom", "left"];
		let i = 0;
		let sideIndex = 0;
		let verticalSpace = 0;

		let currentSide = sides[sideIndex];
		
		const firstPiecesOnEachSide = {
			"top": null,
			"right": null,
			"bottom": null,
			"left": null,
		};
		
		const spacing = 20;
		
		const piecesInPlay = this.shuffleArray(this.getIndividualPiecesOnCanvas());

		let currentX = this.boardAreaEl.offsetLeft * this.zoomLevel;
		let currentY = (this.boardAreaEl.offsetTop - this.largestPieceSpan - spacing) * this.zoomLevel;
		
		while(i < piecesInPlay.length){
			// console.log("current element", piecesInPlay[i])
			if(!dryRun){
				piecesInPlay[i].style.top = currentY + "px";
				piecesInPlay[i].style.left = currentX + "px";
			}

			if(i === 0){
				firstPiecesOnEachSide[currentSide] = piecesInPlay[i];
			}

			const nextSide = sideIndex < 3 ? sideIndex + 1 : 0;
			const isLastPiece = i === piecesInPlay.length - 1;

			if(this.shouldProceedToNextSide(currentSide, piecesInPlay[i], firstPiecesOnEachSide[sides[nextSide]])){
				// console.log("proceeding to next side", i)
				if(currentSide === "bottom"){
					verticalSpace += this.largestPieceSpan + spacing;
				}

				const nextPos = this.getPositionForFirstPieceOnNextSide(piecesInPlay[i], !isLastPiece ? piecesInPlay[i+1] : null, currentSide, firstPiecesOnEachSide[sides[nextSide]]);

				sideIndex = nextSide;
				currentSide = sides[nextSide];

				firstPiecesOnEachSide[currentSide] = piecesInPlay[i+1];

				currentX = nextPos.x;
				currentY = nextPos.y;
			} else {
				if(currentSide === "top"){
					currentX += (piecesInPlay[i].offsetWidth + spacing * this.zoomLevel);
				} else if (currentSide === "right"){
					currentY += (piecesInPlay[i].offsetHeight + spacing * this.zoomLevel);
				} else if (currentSide === "bottom"){
					if(!isLastPiece){
						currentX -= (piecesInPlay[i+1].offsetWidth + spacing) * this.zoomLevel;
					}
				} else if(currentSide === "left"){
					if(!isLastPiece){
						currentY -= (piecesInPlay[i+1].offsetHeight + spacing) * this.zoomLevel;
					}
				}
			}

			i++;
		}

		this.save(Array.from(this.allPieces()));
		return verticalSpace;
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
			left: Utils.getRandomInt(randSectorBoundingBox.left, randSectorBoundingBox.right - this.largestPieceSpan),
			top: Utils.getRandomInt(randSectorBoundingBox.top, randSectorBoundingBox.bottom - this.largestPieceSpan),
		}
	}

	assignPieceConnections(){
		this.allPieces().forEach(p => {
			this.setElementAttribute(p, 'data-connects-to', JSON.stringify(this.getConnectingPieceIds(p)))
		});
	}

	getConnectorBoundingBox(element, side, drawBoundingBox = false){
		const piece = this.getPieceFromElement(element, ['jigsaw-type']);
		const hasLeftPlug = Utils.has(piece.type, "plug", "left");
		const hasTopPlug = Utils.has(piece.type, "plug", "top");

		const tolerance = this.connectorTolerance;
		let box;

		// salmon
		// console.log("connectorsize", this.connectorSize)
		// console.log("tolerance setting", this.connectorTolerance)
		// console.log("percentage of", this.connectorSize / 100 * this.connectorTolerance)
		// console.log("tolerance", tolerance, "tolerance", tolerance)
		
		const topBoundary = hasTopPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner;
		const leftBoundary = hasLeftPlug ? this.connectorDistanceFromCorner + this.connectorSize : this.connectorDistanceFromCorner;

		switch(side){
			case "left":
				box = {
					top: element.offsetTop + topBoundary + tolerance,
					right: element.offsetLeft + this.connectorSize - tolerance,
					bottom: element.offsetTop + topBoundary + this.connectorSize - tolerance,
					left: element.offsetLeft + tolerance,
				}
				break;
			case "right":
				box = {
					top: element.offsetTop + topBoundary + tolerance,
					right: element.offsetLeft + element.offsetWidth - tolerance,
					bottom: element.offsetTop + topBoundary + this.connectorSize - tolerance,
					left: element.offsetLeft + element.offsetWidth - this.connectorSize + tolerance,
				}
				break;
			case "bottom":
				box = {
					top: element.offsetTop + element.offsetHeight - this.connectorSize + tolerance - this.shadowOffset,
					right: element.offsetLeft + leftBoundary + this.connectorSize - tolerance,
					bottom: element.offsetTop + element.offsetHeight - tolerance - this.shadowOffset,
					left: element.offsetLeft + leftBoundary + tolerance,
				}
				break;
			case "top":
				box = {
					top: element.offsetTop + tolerance,
					right: element.offsetLeft + leftBoundary + this.connectorSize - tolerance,
					bottom: element.offsetTop + this.connectorSize - tolerance,
					left: element.offsetLeft + leftBoundary + tolerance,
				}
				break;
		}

		if(drawBoundingBox){
			this.drawBoundingBox(box);
		}
		
		return box;
	}
	
	drawBoundingBox(box, className){
		const div = document.createElement("div");
		div.style.position = "absolute";
		div.style.top = box.top + "px";
		div.style.left = box.left + "px";
		div.style.width = box.right - box.left + "px";
		div.style.height = box.bottom - box.top + "px";
		div.style.backgroundColor = "black";
		if(className){
			div.classList.add(className);
		}
		document.body.appendChild(div);
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

	getIndividualPiecesOnCanvas(){
		return Array.from(this.allPieces()).filter(el => {
			return !el.dataset.issolved && !el.dataset.group && !el.classList.contains("in-pocket");
		})
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
				console.log("are we recurring?")
				left += el.offsetLeft;
				top += el.offsetTop;
				return recurse(el.parentNode)
			} else {
				console.log("or are we returning?")
				return {
					top,
					left
				}
			}
		}

		return recurse(el);
	}

	getConnectorBoundingBoxInGroup(element, connector, containerBoundingBox){
		// console.log("getting connector bounding box in group", element, connector, containerBoundingBox)
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

	getElementBoundingBoxForFloatDetection(element, drawBoundingBox = false){
		const hasGroup = !!element.dataset.group;

		const diffX = (element.offsetWidth / 2) - (this.floatTolerance / 2);
		const diffY = (element.offsetHeight / 2) - (this.floatTolerance / 2);

		const pos = {
			top: hasGroup ? element.parentNode.offsetTop + element.offsetTop : element.offsetTop,
			right: hasGroup ? element.parentNode.offsetLeft + element.offsetLeft + diffX : element.offsetLeft + diffX,
			bottom: hasGroup ? element.parentNode.offsetTop + element.offsetTop + diffY : element.offsetTop + diffY,
			left: hasGroup ? element.parentNode.offsetLeft + element.offsetLeft : element.offsetLeft,
		}

		// console.log("getElementBoundingBoxForFloatDetection", pos)
	
		const box = {
			top: pos.top + this.floatTolerance,
			right: pos.right + this.floatTolerance,
			bottom: pos.bottom + this.floatTolerance,
			left: pos.left + this.floatTolerance
		}

		if(drawBoundingBox){
			this.drawBoundingBox(box);
		}

		return box;
	}

	getPieceSolvedBoundingBox(el, drawBoundingBox = false){
		const solvedX = parseInt(el.dataset.solvedx);
		const solvedY = parseInt(el.dataset.solvedy);
		
		// const top = this.boardTop + solvedY;
		// const right = this.boardLeft + solvedX + el.offsetLeft + this.collisionBoxWidth;
		// const bottom = this.boardTop + solvedY + el.offsetTop + this.collisionBoxWidth;
		// const left = this.boardLeft + solvedX;

		const diffX = (el.offsetWidth / 2) - (this.floatTolerance / 2);
		const diffY = (el.offsetHeight / 2) - (this.floatTolerance / 2);

		const box = {
			top: this.boardTop + solvedY + diffY,
			right: this.boardLeft + solvedX + diffX + (this.floatTolerance / 2),
			bottom: this.boardTop + solvedY + diffY + (this.floatTolerance / 2),
			left: this.boardLeft + solvedX + diffX
		}
// console.log("box", box)
		if(drawBoundingBox){
			this.drawBoundingBox(box, "solved");
		}

		return box;
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
				if(Utils.hasCollision(elBBWithinTolerance, this.getTopLeftCornerBoundingBox())){
					connectionFound = "top-left";
				}
			}
			if(Utils.isTopRightCorner(piece)){
				elBBWithinTolerance.left = elBoundingBox.right - this.connectorTolerance;
				elBBWithinTolerance.bottom = elBoundingBox.top + this.connectorTolerance;
				if(Utils.hasCollision(elBoundingBox, this.getTopRightCornerBoundingBox())){
					connectionFound = "top-right";
				}
			}
			if(Utils.isBottomRightCorner(piece)){
				elBBWithinTolerance.left = elBoundingBox.right - this.connectorTolerance;
				elBBWithinTolerance.top = elBoundingBox.bottom - this.connectorTolerance;
				if(Utils.hasCollision(elBoundingBox, this.getBottomRightCornerBoundingBox())){
					connectionFound = "bottom-right";
				}
			}
			if(Utils.isBottomLeftCorner(piece)){
				elBBWithinTolerance.right = elBoundingBox.left + this.connectorTolerance;
				elBBWithinTolerance.top = elBoundingBox.bottom - this.connectorTolerance;
				if(Utils.hasCollision(elBoundingBox, this.getBottomLeftCornerBoundingBox())){
					connectionFound = "bottom-left";
				}
			}
		}

		const checkRight = hasRightConnector && !piece.connections.includes('right');
		const checkBottom = hasBottomConnector && !piece.connections.includes('bottom');
		const checkLeft = hasLeftConnector && !piece.connections.includes('left');
		const checkTop = hasTopConnector && !piece.connections.includes('top');

		if(checkRight && !connectionFound){
			targetElement = Utils.getElementByPieceId(piece.id + 1)
			// console.log('source element', element, 'target eleme÷nt', targetElement)
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

				// console.log('checking right', thisPieceConnectorBoundingBoxRight, targetPieceConnectorBoundingBox)
				if(Utils.hasCollision(thisPieceConnectorBoundingBoxRight, targetPieceConnectorBoundingBox, element, targetElement)){
					connectionFound = "right";
				}
			}
		}

		if(checkBottom && !connectionFound){
			targetElement = Utils.getElementByPieceId(piece.id + this.piecesPerSideHorizontal)
			targetPiece = this.getPieceFromElement(targetElement, ['piece-id', 'group', 'jigsaw-type', 'is-solved']);

			if(shouldCompare(targetPiece)){
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
				// console.log('checking bottom', thisPieceConnectorBoundingBoxBottom, targetPieceConnectorBoundingBox)
				if(Utils.hasCollision(thisPieceConnectorBoundingBoxBottom, targetPieceConnectorBoundingBox, element, targetElement)){
					connectionFound = "bottom";
				}
			}
		}

		if(checkLeft && !connectionFound){
			targetElement = Utils.getElementByPieceId(piece.id - 1);
			targetPiece = this.getPieceFromElement(targetElement, ['piece-id', 'group', 'is-solved', 'jigsaw-type'])

			if(shouldCompare(targetPiece)){
				if(!this.isMovingSinglePiece){
					let container = this.getGroupTopContainer(element);
					containerBoundingBox = this.getBoundingBox(container);
					thisPieceConnectorBoundingBoxLeft = this.getConnectorBoundingBoxInGroup(element, 'left', containerBoundingBox);
				} else {
					thisPieceConnectorBoundingBoxLeft = this.getConnectorBoundingBox(element, "left");
				}

				let targetContainer, targetPieceConnectorBoundingBox, targetContainerBoundingBox;

				if(Utils.hasGroup(targetPiece)){
					targetContainer = this.getGroupTopContainer(targetElement);
					targetContainerBoundingBox = this.getBoundingBox(targetContainer);
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(targetElement, "right", targetContainerBoundingBox);
				} else {
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetElement, "right");
				}
				
				// console.log('checking left', thisPieceConnectorBoundingBoxLeft, targetPieceConnectorBoundingBox)
				if(Utils.hasCollision(thisPieceConnectorBoundingBoxLeft, targetPieceConnectorBoundingBox, element, targetElement)){
					connectionFound = "left";
				}
			}
		}

		if(checkTop && !connectionFound){
			targetElement = Utils.getElementByPieceId(piece.id - this.piecesPerSideHorizontal)
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

				// console.log('checking top', thisPieceConnectorBoundingBoxTop, targetPieceConnectorBoundingBox)
				if(Utils.hasCollision(thisPieceConnectorBoundingBoxTop, targetPieceConnectorBoundingBox)){
					connectionFound = "top";
				}
			}
		}

		const thisPieceBoundingBox = this.getElementBoundingBoxForFloatDetection(element);
		const solvedBoundingBox = this.getPieceSolvedBoundingBox(element)

// console.log("checking float", thisPieceBoundingBox, solvedBoundingBox)
		if(Utils.hasCollision(thisPieceBoundingBox, solvedBoundingBox)){
			connectionFound = 'float';
		}
		
		return connectionFound && {
			type: connectionFound,
			sourceEl: element,
			targetEl: connectionFound !== 'float' && !Utils.isCornerConnection(connectionFound) && targetElement
		}
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
				targetElement = Utils.getElementByPieceId(id - this.piecesPerSideHorizontal);
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
				targetElement = Utils.getElementByPieceId(id + 1);
				expectedValue = targetElement.offsetLeft - el.offsetWidth + this.connectorSize;
				if(parseInt(el.style.left) !== expectedValue){
					el.style.left = this.getPxString(expectedValue);
				}
				break;
			case "bottom":
				targetElement = Utils.getElementByPieceId(id + this.piecesPerSideHorizontal);
				expectedValue = targetElement.offsetTop - el.offsetHeight + this.connectorSize;
				if(parseInt(el.style.top) !== expectedValue){
					el.style.top = this.getPxString(expectedValue);
				}
				break;
			case "left":
				targetElement = Utils.getElementByPieceId(id - 1);
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

		const pieceTop = !Utils.isTopEdgePiece(p) && Utils.getElementByPieceId(p.id - this.piecesPerSideHorizontal);
		const pieceRight = !Utils.isRightEdgePiece(p) && Utils.getElementByPieceId(p.id + 1);
		const pieceBottom = !Utils.isBottomEdgePiece(p) && Utils.getElementByPieceId(p.id + this.piecesPerSideHorizontal);
		const pieceLeft = !Utils.isLeftEdgePiece(p) && Utils.getElementByPieceId(p.id - 1);

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

	drawPiecesIntoGroup(groupId, pieces){
		const cnv = document.querySelector(`#group-canvas-${groupId}`);
		const ctx = cnv.getContext("2d");
		ctx.imageSmoothingEnabled = false;

		pieces.forEach(p => {
			const data = p.dataset;

			ctx.drawImage(this.shadowSprite, data.spritex, data.spritey, data.imgw, data.imgh, parseInt(data.solvedx) + this.shadowOffset, parseInt(data.solvedy) + this.shadowOffset, data.imgw, data.imgh);

			if(p instanceof HTMLDivElement){
				p.childNodes.forEach(n => n.style.visibility = "hidden")
			} else {
				const el = Utils.getElementByPieceId(p.id);
				el.childNodes.forEach(n => n.style.visibility = "hidden")
			}
		});
		
		pieces.forEach(p => {
			const data = p.dataset;
			ctx.drawImage(this.sprite, data.spritex, data.spritey, data.imgw, data.imgh, parseInt(data.solvedx), parseInt(data.solvedy), data.imgw, data.imgh);
		});
	}

	createGroupContainer(pieceAEl, pieceBEl, group){
		const pieceA = this.getPieceFromElement(pieceAEl, ['piece-id', 'jigsaw-type', 'imgw', 'imgh', 'imgx', 'imgy', 'solvedx', 'solvedy', 'num-pieces-from-left-edge', 'num-pieces-from-top-edge', 'connections']);
		const pieceB = this.getPieceFromElement(pieceBEl, ['piece-id', 'jigsaw-type', 'imgw', 'imgh', 'imgx', 'imgy', 'solvedx', 'solvedy', 'num-pieces-from-left-edge', 'num-pieces-from-top-edge', 'connections']);

		const leftPos = pieceBEl.offsetLeft - pieceB.solvedX;
		const topPos = pieceBEl.offsetTop - pieceB.solvedY;

		const container = document.createElement('div');
		container.id = `group-container-${group}`;
		container.classList.add('group-container');
		container.style.pointerEvents = 'none';

		container.style.top = this.getPxString(topPos);
		container.style.left = this.getPxString(leftPos);
		
		container.appendChild(pieceAEl);
		container.appendChild(pieceBEl);
		pieceAEl.style.left = this.getPxString(pieceA.solvedX);
		pieceAEl.style.top = this.getPxString(pieceA.solvedY);
		pieceBEl.style.left = this.getPxString(pieceB.solvedX);
		pieceBEl.style.top = this.getPxString(pieceB.solvedY);

		container.style.position = 'absolute';

		this.canvas.appendChild(container);
		
		const cnv = document.createElement('canvas');
		container.prepend(cnv);
		cnv.classList.add('group-canvas');
		cnv.setAttribute('id', `group-canvas-${group}`);
		cnv.style.pointerEvents = 'none';
		cnv.style.width = this.getPxString(this.boardSize) + this.shadowOffset;
		cnv.width = this.boardSize + this.shadowOffset;
		cnv.style.height = this.getPxString(this.boardSize) + this.shadowOffset;
		cnv.height = this.boardSize + this.shadowOffset;

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

		// this.save([elementA, elementB]);

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
		const allPieces = [...elementsInTargetGroup, ...followingEls];
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
		this.fullImageViewerEl.style.width = this.boardWidth + "px";
		this.fullImageViewerEl.style.height = this.boardHeight + "px";
		this.fullImageViewerEl.style.background = `url(${this.puzzleImgPath}) no-repeat`;

		if(this.imagePreviewType === "alwaysOn"){
			this.fullImageViewerEl.style.opacity = .2;
		} else {
			this.fullImageViewerEl.style.display = "none";
		}
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
					const container = this.getGroupContainer(parseInt(el.dataset.group));
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

			if(k == 'pocket-id'){
				data.pocketId = parseInt(this.getDataAttributeValue(el, "pocket-id"));
			}

			data.pageX = el.offsetLeft;
			data.pageY = el.offsetTop;
		})

		if(Utils.hasGroup({group: this.getGroup(el)})){
			data.containerX = el.parentNode.offsetLeft;
			data.containerY = el.parentNode.offsetTop;
		}

		return data;
	}

	saveToLocalStorage(){
		const payload = [];
		let time = Date.now();
	
		[...this.allPieces()].forEach(p => {
			delete p._id;
			payload.push(this.getPieceFromElement(p, this.DATA_ATTR_KEYS));
		});
	
		const progressKey = this.getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_PROGRESS_KEY");
		const lastSaveKey = this.getUniqueLocalStorageKeyForPuzzle("LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY");
	
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
		const pieceArray = Array.isArray(pieces) ? pieces : Array.from(pieces);
	
		pieceArray.forEach( p => {
			payload.push(this.getPieceFromElement(p, this.DATA_ATTR_KEYS));
		});
		
		fetch(`/api/pieces`, {
			method: 'put',
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
