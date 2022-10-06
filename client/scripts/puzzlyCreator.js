import { PuzzleSizes } from "./constants.js";
import Utils from "./utils.js";

class PuzzlyCreator {
	constructor(){

		this.sourceImage = {
			path: null,
			dimensions: null,
		};

		this.crop = {
			selectedOffsetX: 0,
			selectedOffsetY: 0,
			selectedWidth: null,
			hasCrop: false,
		};

		this.debugOptions = {
			noDispersal: false,
			highlightConnectingPieces: false,
		}

		this.boardSize = Math.ceil(window.innerHeight / 100 * 60);

		this.puzzleSizeInputField = document.querySelector('#puzzle-size-input-field');
		this.puzzleSizeInputLabel = document.querySelector('#puzzle-size-input-label');
		this.ControlsElPreviewButton = document.getElementById('preview');
		this.chkHighlights = document.querySelector("#chk-highlights");
		this.chkNoDispersal = document.querySelector("#chk-no-disperse");
		this.imagePreviewEl = document.querySelector('#puzzle-setup--image_preview');
		this.imageUpload = document.querySelector('#upload');
		this.newPuzzleForm = document.querySelector('#form-container');
		this.startBtn = document.querySelector('#start-btn');
		this.puzzleSizeField = document.getElementById("puzzle-size-input-field");
		this.imageUploadPreviewEl = document.getElementById("puzzle-setup--image_preview-imgEl");
		this.fullSizeImageHidden = document.getElementById("full-size-image");

		this.imageCropElement = document.getElementById('image-crop');
		this.imageCropDragHandles = document.querySelectorAll('.image-crop-drag-handle');
		this.imageCropDragHandleTL = document.querySelector('#image-crop-drag-handle-tl');
		this.imageCropDragHandleTR = document.querySelector('#image-crop-drag-handle-tr');
		this.imageCropDragHandleBR = document.querySelector('#image-crop-drag-handle-br');
		this.imageCropDragHandleBL = document.querySelector('#image-crop-drag-handle-bl');

		this.imageCropDragHandlesInUse = false;

		this.addEventListeners();
		this.setDefaultNumPieces();
		this.showForm();
	}

	showForm(){
		this.newPuzzleForm.style.display = 'flex';
	}

	setDefaultNumPieces(){
		const defaultPuzzleSize = PuzzleSizes[10]
		this.puzzleSizeInputLabel.textContent = this.selectedNumPieces = defaultPuzzleSize.numPieces;
		this.piecesPerSide = defaultPuzzleSize.piecesPerSide;
	}

	addEventListeners(){
		this.puzzleSizeInputField.addEventListener('input', function(e) {
			this.puzzleSizeInputLabel.textContent = this.selectedNumPieces = PuzzleSizes[e.target.value].numPieces;
		}.bind(this))
		
		this.chkHighlights.addEventListener("input", function(e) {
			this.debugOptions.highlightConnectingPieces = e.target.checked;
		}.bind(this));
		
		this.chkNoDispersal.addEventListener("input", function(e) {
			this.debugOptions.noDispersal = e.target.checked;
		}.bind(this));

		this.puzzleSizeField.addEventListener('change', function(e){
			e.preventDefault();
			this.selectedNumPieces = PuzzleSizes[parseInt(e.target.value)].numPieces;
		}.bind(this));
		
		this.imageUpload.addEventListener('change', this.onImageUploadChange.bind(this));
		this.imageCropElement.addEventListener('mousedown', this.onImageCropMouseDown.bind(this));
		this.imageCropElement.addEventListener('mouseup', this.onImageCropMouseUp.bind(this));
		this.imageUploadPreviewEl.addEventListener('load', this.onImagePreviewLoad.bind(this));
		this.fullSizeImageHidden.addEventListener('load', this.onFullSizeImageLoad.bind(this));
		this.startBtn.addEventListener('click', this.onStartBtnClick.bind(this));
	}
	
	onImageUploadChange(e) {
		e.preventDefault();

		this.upload()
			.then( function(d){
				this.onUploadSuccess(d);
			}.bind(this)).catch( function(err){
				this.onUploadFailure(err);
			}.bind(this));
	}

	onStartBtnClick(e) {
		e.preventDefault();
		this.createPuzzle();
	}
	
	onUploadSuccess(response) {
		// console.log('onUploadSuccess', response)

		if(response.data){
			this.imagePreviewEl.style.display = "flex";
			this.sourceImage.previewPath = this.imageUploadPreviewEl.src = response.data.previewPath;
			this.sourceImage.fullSizePath = this.fullSizeImageHidden.src = response.data.fullSizePath;
			this.sourceImage.imageName = response.data.filename;
		}
	}

	onImagePreviewLoad(e) {
		// console.log('image info', e)

		const imgObj = e.path[0];
		const dimensions = {
			width: imgObj.naturalWidth,
			height: imgObj.naturalHeight,
		};

		console.log(dimensions)

		const cropNotNeeded = dimensions.width === dimensions.height;
		
		if(cropNotNeeded){
			this.setPuzzleImageOffsetAndWidth(true);
			if(this.imageCropVisible){
				this.destroyImageCrop();
			}
		} else {
			this.initiateImageCrop(this.imageUploadPreviewEl);
		}

		this.imagePreviewEl.style.display = 'block';
	}
	
	onFullSizeImageLoad(e){
		const imgObj = e.path[0];
		const dimensions = {
			width: imgObj.naturalWidth,
			height: imgObj.naturalHeight,
		};
		console.log("full size dimensions", dimensions)
		
		this.sourceImage.dimensions = dimensions;
	}

	onUploadFailure(response){
		console.log('onUploadFailure', response)
	}

	setPuzzleImageOffsetAndWidth(noCrop = false){
		if(noCrop){
			this.selectedOffsetX = 0;
			this.selectedOffsetY = 0;
			this.selectedWidth = this.imageUploadPreviewEl.naturalWidth;
			this.selectedHeight = this.imageUploadPreviewEl.naturalWidth;
		} else {
			const leftPos = this.imageCropElement.offsetLeft;
			const topPos = this.imageCropElement.offsetTop;
			const width = this.imageCropElement.clientWidth;

			const cropLeftOffsetPercentage = leftPos / this.imageUploadPreviewEl.naturalWidth * 100;
			const cropTopOffsetPercentage = topPos / this.imageUploadPreviewEl.naturalHeight * 100;
			const cropWidthPercentage = width / this.imageUploadPreviewEl.naturalWidth * 100;

			this.crop.selectedOffsetX = this.imageUploadPreviewEl.naturalWidth / 100 * cropLeftOffsetPercentage;
			this.crop.selectedOffsetY = this.imageUploadPreviewEl.naturalHeight / 100 * cropTopOffsetPercentage;
			this.crop.selectedWidth = this.imageUploadPreviewEl.naturalWidth / 100 * cropWidthPercentage;
			this.crop.selectedHeight = this.crop.selectedWidth;

			this.crop.hasCrop = true;
		}
	}

	setImageCropDragHandles(){
		this.imageCropDragHandles.forEach(el => el.style.display = "block")
		this.imageCropDragHandleTL.style.top = this.imageCropElement.offsetTop - this.imageCropDragHandleTL.clientHeight + "px";
		this.imageCropDragHandleTL.style.left = this.imageCropElement.offsetLeft - this.imageCropDragHandleTL.clientWidth + "px";
		this.imageCropDragHandleTR.style.top = this.imageCropElement.offsetTop - this.imageCropDragHandleTL.clientHeight + "px";
		this.imageCropDragHandleTR.style.left = this.imageCropElement.offsetLeft + this.imageCropElement.offsetWidth + "px";
		this.imageCropDragHandleBR.style.top = this.imageCropElement.offsetTop + this.imageCropElement.offsetHeight + "px";
		this.imageCropDragHandleBR.style.left = this.imageCropElement.offsetLeft + this.imageCropElement.offsetWidth + "px";
		this.imageCropDragHandleBL.style.top = this.imageCropElement.offsetTop + this.imageCropElement.offsetHeight + "px";
		this.imageCropDragHandleBL.style.left = this.imageCropElement.offsetLeft - this.imageCropDragHandleBL.clientWidth + "px";
	
		this.imageCropDragHandlesInUse = true;
	}

	/*
	onImageCropDragHandleMouseDown(e){
		const el = e.target;
		const handleId = el.id.substr(el.id.lastIndexOf('-') + 1);
		const diffX = e.clientX - el.offsetLeft;
		const diffY = e.clientY - el.offsetTop;
	
		PuzzlyCreator.imageCropDragHandle = {
			isMouseDown: true,
			currX: el.offsetLeft,
			currY: el.offsetTop,
			diffX,
			diffY,
			width: el.clientWidth,
			height: el.clientHeight,
			imageCropBoundingBox: imageCrop.getBoundingClientRect(),
			imageCropWidth: imageCrop.clientWidth,
			imageCropHeight: imageCrop.clientHeight,
			imageCropOffsetLeft: imageCrop.offsetLeft,
			imageCropOffsetTop: parseInt(imageCrop.style.top),
		};
	
		el.addEventListener('mousemove', e => onImageCropDragHandleMove(e, handleId));
	}
	*/

	onImageCropMouseDown(e){
		const el = e.target;
		const diffX = e.clientX - el.offsetLeft;
		const diffY = e.clientY - el.offsetTop;
		const w = this.imageUploadPreviewEl.offsetWidth;
		const h = this.imageUploadPreviewEl.offsetHeight;
	
		this.imageCropData = {
			currX: el.offsetLeft,
			currY: el.offsetTop,
			diffX,
			diffY,
			width: el.clientWidth,
			height: el.clientHeight,
			inUse: true,
		};
	
		const limitToAxis = w > h ? "x" : h > w ? "y" : null;
	
		const moveListener = this.imageCropElement.addEventListener('mousemove', function(e) {
			this.onImageCropMove(e, limitToAxis)
		}.bind(this));

		window.addEventListener('mouseup', function(e){
			this.setPuzzleImageOffsetAndWidth();
			this.imageCropElement.removeEventListener('mousemove', moveListener);
			this.imageCropData.inUse = false;
		}.bind(this))
	};

	onImageCropMove(e, axis = null){
		const newX = e.clientX - this.imageCropData.diffX;
		const newY = e.clientY - this.imageCropData.diffY;
	
		if(this.imageCropData.inUse && this.imageCropWithinBounds(newX, newY, axis)){
			if(axis && axis === "y" || !axis){
				this.imageCropElement.style.top = newY + "px";
			}
			if(axis && axis === "x" || !axis){
				this.imageCropElement.style.left = newX + "px";
			}
			if(this.imageCropData.inUse){
				this.setImageCropDragHandles();
			}
		}
	}

	imageCropWithinBounds(newX, newY, axis = null){
		const elBoundingBox = {
			top: newY,
			right: newX + this.imageCropElement.clientWidth,
			bottom: newY + this.imageCropElement.clientHeight,
			left: newX
		};
		const containerBoundingBox = this.imagePreviewEl.getBoundingClientRect();
	
		if(axis && axis === "x"){
			return elBoundingBox.left >= Math.ceil(this.imageUploadPreviewEl.offsetLeft) && elBoundingBox.right <= Math.ceil(this.imageUploadPreviewEl.offsetLeft + this.imageUploadPreviewEl.offsetWidth);
		}
		if(axis && axis === "y"){
			return elBoundingBox.top >= Math.ceil(this.imageUploadPreviewEl.offsetTop) && elBoundingBox.bottom <= Math.ceil(this.imageUploadPreviewEl.offsetTop + this.imageUploadPreviewEl.offsetHeight);
		}
		return elBoundingBox.left >= Math.ceil(containerBoundingBox.left) && elBoundingBox.right <= Math.ceil(containerBoundingBox.right) && elBoundingBox.top >= Math.ceil(containerBoundingBox.top) && elBoundingBox.bottom <= Math.ceil(containerBoundingBox.bottom);
	}

	onImageCropMouseUp(e){
		if(this.imageCropData.inUse){
			this.imageCropData.inUse = false;
			this.imageCropDragHandles.forEach( el => {
				el.removeEventListener('mousemove', this.onImageCropDragHandleMove.bind(this));
			})
		}
	}

	onImageCropDragHandleMove = (e, handleId) => {
		if(this.imageCropData.inUse){
			const newX = e.clientX - this.imageCropData.diffX;
			const newY = e.clientY - this.imageCropData.diffY;

			e.target.style.left = newX + "px";
			e.target.style.top = newY + "px";
			
			const handleBoundingBox = e.target.getBoundingClientRect();

			if(handleId === 'tl'){
				this.imageCropElement.style.left = handleBoundingBox.right + "px";
				this.imageCropElement.style.top = handleBoundingBox.bottom + "px";
				this.imageCropDragHandleTR.style.top = newY + "px";
				this.imageCropDragHandleBL.style.left = newX + "px";
				this.imageCropElement.style.width = PuzzlyCreator.imageCropDragHandle.imageCropWidth + (PuzzlyCreator.imageCropDragHandle.imageCropOffsetLeft - handleBoundingBox.right) + "px";
				this.imageCropElement.style.height = PuzzlyCreator.imageCropDragHandle.imageCropHeight + (PuzzlyCreator.imageCropDragHandle.imageCropOffsetTop - parseInt(imageCrop.style.top)) + "px";
			}

			if(handleId === 'tr'){
				this.imageCropElement.style.top = handleBoundingBox.bottom + "px";
				this.imageCropDragHandleTL.style.top = newY + "px";
				this.imageCropDragHandleBR.style.left = newX + "px";
				this.imageCropElement.style.width = PuzzlyCreator.imageCropDragHandle.imageCropWidth + (newX - PuzzlyCreator.imageCropDragHandle.imageCropBoundingBox.right) + "px";
				this.imageCropElement.style.height = PuzzlyCreator.imageCropDragHandle.imageCropHeight + (PuzzlyCreator.imageCropDragHandle.imageCropOffsetTop - parseInt(imageCrop.style.top)) + "px";
			}

			if(handleId === 'br'){
				this.imageCropDragHandleTR.style.left = newX + "px";
				this.imageCropDragHandleBL.style.top = newY + "px";
				this.imageCropElement.style.width = PuzzlyCreator.imageCropDragHandle.imageCropWidth + (newX - PuzzlyCreator.imageCropDragHandle.imageCropBoundingBox.right) + "px";
				this.imageCropElement.style.height = PuzzlyCreator.imageCropDragHandle.imageCropHeight + (newY - PuzzlyCreator.imageCropDragHandle.imageCropBoundingBox.bottom) + "px";
			}

			if(handleId === 'bl'){
				this.imageCropElement.style.left = handleBoundingBox.right + "px";
				this.imageCropDragHandleTL.style.left = newX + "px";
				this.imageCropDragHandleBR.style.top = newY + "px";
				this.imageCropElement.style.width = PuzzlyCreator.imageCropDragHandle.imageCropWidth + (PuzzlyCreator.imageCropDragHandle.imageCropOffsetLeft - handleBoundingBox.right) + "px";
				this.imageCropElement.style.height = PuzzlyCreator.imageCropDragHandle.imageCropHeight + (newY - PuzzlyCreator.imageCropDragHandle.imageCropBoundingBox.bottom) + "px";
			}

			if(this.selectedShape === "Square"){
			} else {
				// e.target.style.top = newY + "px";
				// e.target.style.left = newX + "px";
			}
		}
	}

	initiateImageCrop(){
		this.imageCropElement.style.display = "block";
		this.setImageCropSizeAndPosition();
	
		this.imageCropVisible = true;

		window.addEventListener("resize", this.setImageCropSizeAndPosition.bind(this));
	}

	setImageCropSizeAndPosition(){
		const el = this.imageUploadPreviewEl;
		const width = el.naturalWidth;
		const height = el.naturalHeight;

		if(width === height) return;

		const cropSize = width > height ? height : width;

		this.imageCropElement.style.top = this.imageUploadPreviewEl.offsetTop + "px";
		this.imageCropElement.style.left = this.imageUploadPreviewEl.offsetLeft + "px";
		this.imageCropElement.style.height = cropSize + "px";
		this.imageCropElement.style.width = cropSize + "px";

		this.setImageCropDragHandles();
		this.setPuzzleImageOffsetAndWidth();
	}

	destroyImageCrop(){
		this.imageCropElement.style.display = "none";
		this.imageCropDragHandles.forEach(el => el.style.display = "none");
		window.removeEventListener("resize", this.setImageCropSizeAndPosition);
	}

	upload(){
		const image = document.querySelector('[type=file]').files;
		
		const fd = new FormData();
		fd.append('files[]', image[0]);
		fd.append('previewWidth', this.imagePreviewEl.offsetWidth);
		fd.append('previewHeight', this.imagePreviewEl.offsetHeight);
		fd.append('boardSize', this.boardSize);

		return fetch('/api/upload', {
			body: fd,
			method: 'POST',
		})
		.then( response => response.json() )
	}

	createPuzzle(opts = {}){
		const puzzleConfig = {
			...this.sourceImage,
			...this.crop,
			debugOptions: this.debugOptions,
			selectedNumPieces: this.selectedNumPieces,
			boardSize: this.boardSize,
			originalImageSize: this.sourceImage.dimensions,
			pieceSize: this.sourceImage.dimensions.width / this.piecesPerSide,
		}
		
		fetch('/api/puzzle', {
			body: JSON.stringify(puzzleConfig),
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			}
		})
		.then( response => response.json() )
		.then( function(response){
			console.log('response', response);
			const puzzleId = response._id;
			Utils.insertUrlParam('puzzleId', puzzleId);
			this.newPuzzleForm.style.display = 'none';
			puzzleConfig.path = response.puzzleImgPath;
			puzzleConfig.spritePath = response.spritePath;
			puzzleConfig.pieces = response.pieces;
			new Puzzly('canvas', puzzleId, puzzleConfig);
		}.bind(this)).catch( function(err){
			console.log(err);
		});
	}
}

window.PuzzlyCreator = PuzzlyCreator;