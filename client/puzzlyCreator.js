import { PuzzleSizes } from "./constants.js";
import { ImageCrop } from "./imageCrop.js";

export default class PuzzlyCreator {
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
		})
		
		this.chkHighlights.addEventListener("input", function(e) {
			this.puzzleSetup.debug.highlightConnectingPieces = e.target.checked;
		});
		
		this.chkNoDispersal.addEventListener("input", function(e) {
			this.puzzleSetup.debug.noDispersal = e.target.checked;
		});

		this.puzzleSizeField.addEventListener('change', function(e){
			e.preventDefault();
			this.selectedNumPieces = PuzzleSizes[parseInt(e.target.value)].numPieces;
		});
		
		this.imageUpload.addEventListener('change', this.onImageUploadChange.bind(this));
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

		const isSquare = dimensions.width === dimensions.height;
		
		if(dimensions.width > dimensions.height){
			this.imageUploadPreviewEl.style.width = "100%";
			this.imageUploadPreviewEl.style.height = dimensions.height / dimensions.width * 100 + "%";
		} else if(dimensions.height > dimensions.width){

		}

		if(!isSquare){
			new ImageCrop(this.imageUploadPreviewEl);
		} else {
			this.setPuzzleImageOffsetAndWidth(imageCrop, true).bind(this);
		}

		this.imagePreviewEl.style.display = 'flex';
		this.sourceImage.dimensions = dimensions;
	}


	onUploadFailure(response){
		console.log('onUploadFailure', response)
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
		console.log('PuzzlyCreator', PuzzlyCreator)
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
			insertUrlParam('puzzleId', puzzleId);
			thia.newPuzzleForm.style.display = 'none';
			new Puzzly('canvas', puzzleId, puzzleConfig)
		}).catch( function(err){
			console.log(err);
		});
	}
}
