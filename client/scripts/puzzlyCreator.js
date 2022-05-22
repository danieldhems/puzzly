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
			selectedNumPieces: null,
		};

		this.debugOptions = {
			noDispersal: false,
			highlightConnectingPieces: false,
		}

		this.puzzleSizeInputField = document.querySelector('#puzzle-size-input-field');
		this.puzzleSizeInputLabel = document.querySelector('#puzzle-size-input-label');
		this.ControlsElPreviewButton = document.getElementById('preview');
		this.chkHighlights = document.querySelector("#chk-highlights");
		this.chkNoDispersal = document.querySelector("#chk-no-disperse");
		this.imagePreviewEl = document.querySelector('#puzzle-setup--image_preview');
		this.imageUpload = document.querySelector('#upload');
		this.newPuzzleForm = document.querySelector('#form-container');
		this.imageCrop = document.querySelector('#image-crop');
		this.startBtn = document.querySelector('#start-btn');
		this.puzzleSizeField = document.getElementById("puzzle-size-input-field");
		this.imageUploadPreviewEl = document.getElementById("puzzle-setup--image_preview-imgEl");

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
		this.puzzleSizeInputLabel.textContent = this.selectedNumPieces = PuzzleSizes[10].numPieces;
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
		this.imageCrop.addEventListener('mousedown', this.onImageCropMouseDown.bind(this));
		this.imageCrop.addEventListener('mouseup', this.onImageCropMouseUp.bind(this));
		this.imageUploadPreviewEl.addEventListener('load', this.onImagePreviewLoad.bind(this));
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
		console.log('onUploadSuccess', response)

		if(response.data){
			this.imagePreviewEl.style.display = "flex";
			this.sourceImage.path = this.imageUploadPreviewEl.src = response.data.path;
		}
	}

	onImagePreviewLoad(e) {
		console.log('image info', e)

		const imgObj = e.path[0];
		const dimensions = {
			width: imgObj.naturalWidth,
			height: imgObj.naturalHeight,
		};

		const cropNotNeeded = dimensions.width === dimensions.height;
		
		if(dimensions.width > dimensions.height){
			this.imageUploadPreviewEl.style.width = "100%";
			this.imageUploadPreviewEl.style.height = dimensions.height / dimensions.width * 100 + "%";
		} else if(dimensions.height > dimensions.width){
			this.imageUploadPreviewEl.style.height = "100%";
			this.imageUploadPreviewEl.style.width = dimensions.width / dimensions.height * 100 + "%";
		} else {
			this.imageUploadPreviewEl.style.width = "100%";
			this.imageUploadPreviewEl.style.height = "100%";
		}

		if(cropNotNeeded){
			this.setPuzzleImageOffsetAndWidth(this.imageCrop, true);
			if(this.imageCropVisible){
				this.destroyImageCrop();
			}
		} else {
			this.initiateImageCrop(this.imageUploadPreviewEl);
		}

		this.imagePreviewEl.style.display = 'flex';
		this.sourceImage.dimensions = dimensions;
	}

	onUploadFailure(response){
		console.log('onUploadFailure', response)
	}

	setPuzzleImageOffsetAndWidth(cropElement, noCrop = false){
		if(noCrop){
			this.selectedOffsetX = 0;
			this.selectedWidth = this.imageUploadPreviewEl.naturalWidth;
			this.selectedHeight = this.imageUploadPreviewEl.naturalWidth;
		} else {
			const leftPos = cropElement.offsetLeft;
			const width = cropElement.clientWidth;
			const cropLeftOffsetPercentage = leftPos / this.imageUploadPreviewEl.offsetWidth * 100;
			const cropWidthPercentage = width / this.imageUploadPreviewEl.offsetWidth * 100;
		
			this.selectedOffsetX = this.imageUploadPreviewEl.naturalWidth / 100 * cropLeftOffsetPercentage;
			this.selectedWidth = this.imageUploadPreviewEl.naturalWidth / 100 * cropWidthPercentage;
			this.selectedHeight = this.imageUploadPreviewEl.naturalHeight / 100 * cropWidthPercentage;
		}
	}

	setImageCropDragHandles(){
		this.imageCropDragHandles.forEach(el => el.style.display = "block")
		this.imageCropDragHandleTL.style.top = this.imageCrop.offsetTop - this.imageCropDragHandleTL.clientHeight + "px";
		this.imageCropDragHandleTL.style.left = this.imageCrop.offsetLeft - this.imageCropDragHandleTL.clientWidth + "px";
		this.imageCropDragHandleTR.style.top = this.imageCrop.offsetTop - this.imageCropDragHandleTL.clientHeight + "px";
		this.imageCropDragHandleTR.style.left = this.imageCrop.offsetLeft + this.imageCrop.offsetWidth + "px";
		this.imageCropDragHandleBR.style.top = this.imageCrop.offsetTop + this.imageCrop.offsetHeight + "px";
		this.imageCropDragHandleBR.style.left = this.imageCrop.offsetLeft + this.imageCrop.offsetWidth + "px";
		this.imageCropDragHandleBL.style.top = this.imageCrop.offsetTop + this.imageCrop.offsetHeight + "px";
		this.imageCropDragHandleBL.style.left = this.imageCrop.offsetLeft - this.imageCropDragHandleBL.clientWidth + "px";
	
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

		this.imageCropElement.addEventListener('mouseup', function(e){
			this.imageCropElement.removeEventListener('mousemove', moveListener);
			this.imageCropData.inUse = false;
			this.setPuzzleImageOffsetAndWidth(e.target);
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

	initiateImageCrop(imageEl){
		const width = imageEl.offsetWidth;
		const height = imageEl.offsetHeight;
		if(width === height) return;

		this.imageCropElement.style.display = "block";
		this.imageCrop.id = "image-crop";
		this.imageCropElement.style.top = this.imageUploadPreviewEl.offsetTop + "px";
		this.imageCropElement.style.left = this.imageUploadPreviewEl.offsetLeft + "px";
		this.imageCropElement.style.height = height > width ? width + "px" : height + "px";
		this.imageCropElement.style.width = width > height ? height + "px" : width + "px";
		this.setImageCropDragHandles();
		this.imageCropVisible = true;
	}

	destroyImageCrop(){
		this.imageCropElement.style.display = "none";
		this.imageCropDragHandles.forEach(el => el.style.display = "none");
	}

	upload(){
		const image = document.querySelector('[type=file]').files;
		
		const fd = new FormData();
		fd.append('files[]', image[0])

		return fetch('/api/upload', {
				body: fd,
				method: 'POST',
			})
			.then( response => response.json() )
	}

	createPuzzle(opts = {}){
		console.log('PuzzlyCreator', this)
		const puzzleConfig = {
			...this,
			pieceSize: Math.round(this.selectedWidth / Math.sqrt(this.selectedNumPieces)),
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
			const puzzleId = response._id;
			Utils.insertUrlParam('puzzleId', puzzleId);
			this.newPuzzleForm.style.display = 'none';
			new Puzzly('canvas', puzzleId, puzzleConfig);
		}.bind(this)).catch( function(err){
			console.log(err);
		});
	}
}

window.PuzzlyCreator = PuzzlyCreator;
