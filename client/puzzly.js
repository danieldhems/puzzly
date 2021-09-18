import { SpriteMap, JigsawShapeSpans } from "./jigsaw.js";
import Utils from "./utils.js";

window.PuzzlyCreator = {
	puzzleSetup: {
		sourceImage: {
			path: null,
			dimensions: null,
		},
		selectedShape: "Square",
		selectedOffsetX: 0,
		selectedOffsetY: 0,
		selectedWidth: null,
		selectedNumPieces: null,
	},
	imageCrop: {},
	imageCropDragHandle: {},
};

const uploadDir = './uploads/';

const PuzzleSizes = [
	{numPieces: 9, piecesPerSide: 3},
	{numPieces: 16, piecesPerSide: 4},
	{numPieces: 25, piecesPerSide: 5},
	{numPieces: 36, piecesPerSide: 6},
	{numPieces: 49, piecesPerSide: 7},
	{numPieces: 64, piecesPerSide: 8},
	{numPieces: 81, piecesPerSide: 9},
	{numPieces: 100, piecesPerSide: 10},
	{numPieces: 121, piecesPerSide: 11},
	{numPieces: 144, piecesPerSide: 12},
	{numPieces: 169, piecesPerSide: 13},
	{numPieces: 196, piecesPerSide: 14},
	{numPieces: 256, piecesPerSide: 16},
	{numPieces: 324, piecesPerSide: 18},
	{numPieces: 484, piecesPerSide: 22},
	{numPieces: 576, piecesPerSide: 24},
	{numPieces: 676, piecesPerSide: 26},
	{numPieces: 1024, piecesPerSide: 32},
	{numPieces: 1600, piecesPerSide: 40},
	{numPieces: 2025, piecesPerSide: 45},
]

function setDefaultNumPieces(){
	puzzleSizeInputLabel.textContent = PuzzlyCreator.puzzleSetup.selectedNumPieces = PuzzleSizes[10].numPieces;
}

const puzzleSizeInputField = document.querySelector('#puzzle-size-input-field');
const puzzleSizeInputLabel = document.querySelector('#puzzle-size-input-label');
const ControlsElPreviewButton = document.getElementById('preview');

puzzleSizeInputField.addEventListener('input', e => {
	puzzleSizeInputLabel.textContent = PuzzlyCreator.puzzleSetup.selectedNumPieces = PuzzleSizes[e.target.value].numPieces;
})

setDefaultNumPieces();

function drawBackground(){
	const path = './bg-wood.jpg';
	const BgImage = new Image();
	const BackgroundCanvas = document.getElementById('canvas');
	BackgroundCanvas.style.position = "absolute";
	BackgroundCanvas.style.top = 0;
	BackgroundCanvas.style.left = 0;
	BackgroundCanvas.style.width = "100%";
	BackgroundCanvas.style.height = "100%";
	BgImage.addEventListener('load', () => {
		BackgroundCanvas.style.backgroundImage = `url(${path})`;
	})
	BgImage.src = path;
}

drawBackground();

const imageUploadCtrlEl = document.querySelector('#image-upload-ctrl');
const puzzleSetupCtrlEl = document.querySelector('#puzzle-setup-ctrl');
const imagePreviewEl = document.querySelector('#image-preview');

var imageUpload = document.querySelector('#upload');
var newPuzzleForm = document.querySelector('#form-container');
var imageCrop = document.querySelector('#image-crop');
var submit = document.querySelector('[type=submit]');


const prevButton = document.querySelectorAll(".previous");
const nextButton = document.querySelectorAll(".next");

prevButton && prevButton.forEach( b => {
	b.addEventListener('click', e => {
		e.preventDefault();
		let thisPage = parseInt(e.target.parentNode.parentNode.parentNode.dataset['pageNum']);
		const pages = document.querySelectorAll('.form-page');
		pages[thisPage].style.display = 'none';
		pages[thisPage-1].style.display = 'flex';
	})
})

nextButton && nextButton.forEach( b => {
	b.addEventListener('click', e => {
		e.preventDefault();
		let thisPage = parseInt(e.target.parentNode.parentNode.parentNode.dataset['pageNum']);
		const pages = document.querySelectorAll('.form-page');
		pages[thisPage].style.display = 'none';
		pages[thisPage+1].style.display = 'flex';
	})
})

const puzzleSizeField = document.getElementById("puzzle-size-input-field");
const puzzleShapeField = document.querySelector("[name='puzzle-shape']");

puzzleShapeField && puzzleShapeField.addEventListener('change', function(e) {
	e.preventDefault();
	PuzzlyCreator.puzzleSetup.selectedShape = e.target.value;
	const els = document.querySelectorAll('.square-only');
	const isSquareSelected = e.target.value === 'Square';
	// Show or hide form elements for square-only puzzle creation options
	els.forEach(el => el.style.display = isSquareSelected ? 'flex' : 'none')
})

puzzleSizeField && puzzleSizeField.addEventListener('change', function(e){
	e.preventDefault();
	PuzzlyCreator.puzzleSetup.selectedNumPieces = PuzzleSizes[parseInt(e.target.value)].numPieces;
});

const imageCropDragHandles = document.querySelectorAll('.image-crop-drag-handle');
const imageCropDragHandleTL = document.querySelector('#image-crop-drag-handle-tl');
const imageCropDragHandleTR = document.querySelector('#image-crop-drag-handle-tr');
const imageCropDragHandleBR = document.querySelector('#image-crop-drag-handle-br');
const imageCropDragHandleBL = document.querySelector('#image-crop-drag-handle-bl');

const ImageCropDragHandlesInUse = false;

function setImageCropDragHandles(){
	imageCropDragHandles.forEach(el => el.style.display = "block")

	const imageCropBoundingBox = imageCrop.getBoundingClientRect();
	imageCropDragHandleTL.style.top = imageCropBoundingBox.top - imageCropDragHandleTL.clientHeight + "px";
	imageCropDragHandleTL.style.left = imageCropBoundingBox.left - imageCropDragHandleTL.clientWidth + "px";
	
	imageCropDragHandleTR.style.top = imageCropBoundingBox.top - imageCropDragHandleTL.clientHeight + "px";
	imageCropDragHandleTR.style.left = imageCropBoundingBox.left + imageCropBoundingBox.width + "px";
	
	imageCropDragHandleBR.style.top = imageCropBoundingBox.bottom + "px";
	imageCropDragHandleBR.style.left = imageCropBoundingBox.right + "px";

	imageCropDragHandleBL.style.top = imageCropBoundingBox.top + imageCropBoundingBox.height + "px";
	imageCropDragHandleBL.style.left = imageCropBoundingBox.left - imageCropDragHandleBL.clientWidth + "px";

	ImageCropDragHandlesInUse = true;
}

imageCrop && imageCrop.addEventListener('mousedown', function(e){
	const el = e.target;
	const diffX = e.clientX - el.offsetLeft;
	const diffY = e.clientY - el.offsetTop;
	PuzzlyCreator.imageCrop = {
		currX: el.offsetLeft,
		currY: el.offsetTop,
		diffX,
		diffY,
		width: el.clientWidth,
		height: el.clientHeight,
	};

	imageCrop.addEventListener('mousemove', onImageCropMove);
	imageCrop.addEventListener('mouseup', function(e){
		imageCrop.removeEventListener('mousemove', onImageCropMove);
	})
});

function setPuzzleImageOffsetAndWidth(cropElement){
	const imageRect = imagePreviewEl.getBoundingClientRect();

	const leftPos = cropElement.offsetLeft - imageRect.left;
	const width = cropElement.clientWidth;
	const cropLeftOffsetPercentage = leftPos / imageRect.width * 100;
	const cropWidthPercentage = width / imageRect.width * 100;

	PuzzlyCreator.puzzleSetup.selectedOffsetX = PuzzlyCreator.puzzleSetup.sourceImage.dimensions.width / 100 * cropLeftOffsetPercentage;
	PuzzlyCreator.puzzleSetup.selectedWidth = PuzzlyCreator.puzzleSetup.sourceImage.dimensions.width / 100 * cropWidthPercentage;
}

imageCrop && imageCrop.addEventListener('mouseup', function(e){
	setPuzzleImageOffsetAndWidth(e.target);
})

function imageCropWithinBounds(newX, newY){
	const elBoundingBox = {
		top: newY,
		right: newX + imageCrop.clientWidth,
		bottom: newY + imageCrop.clientHeight,
		left: newX
	};
	const containerBoundingBox = imagePreviewEl.getBoundingClientRect();
	
	return elBoundingBox.left >= Math.ceil(containerBoundingBox.left) && elBoundingBox.right <= Math.ceil(containerBoundingBox.right) && elBoundingBox.top >= Math.ceil(containerBoundingBox.top) && elBoundingBox.bottom <= Math.ceil(containerBoundingBox.bottom);
}

function onImageCropMove(e){
	const newX = e.clientX - PuzzlyCreator.imageCrop.diffX;
	const newY = e.clientY - PuzzlyCreator.imageCrop.diffY;

	if(imageCropWithinBounds(newX, newY)){
		imageCrop.style.top = newY + "px";
		imageCrop.style.left = newX + "px";
		if(ImageCropDragHandlesInUse){
			setImageCropDragHandles()
		}
	}
}

const onImageCropDragHandleMouseDown = e => {
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

window.addEventListener('mouseup', function(e){
	if(PuzzlyCreator.imageCropDragHandle?.isMouseDown){
		PuzzlyCreator.imageCropDragHandle.isMouseDown = false;
		imageCropDragHandles.forEach( el => {
			el.removeEventListener('mousemove', onImageCropDragHandleMove);
		})
	}
})

const onImageCropDragHandleMove = (e, handleId) => {
	if(PuzzlyCreator.imageCropDragHandle.isMouseDown){
		const newX = e.clientX - PuzzlyCreator.imageCropDragHandle.diffX;
		const newY = e.clientY - PuzzlyCreator.imageCropDragHandle.diffY;

		e.target.style.left = newX + "px";
		e.target.style.top = newY + "px";
		
		const handleBoundingBox = e.target.getBoundingClientRect();

		if(handleId === 'tl'){
			imageCrop.style.left = handleBoundingBox.right + "px";
			imageCrop.style.top = handleBoundingBox.bottom + "px";
			imageCropDragHandleTR.style.top = newY + "px";
			imageCropDragHandleBL.style.left = newX + "px";
			imageCrop.style.width = PuzzlyCreator.imageCropDragHandle.imageCropWidth + (PuzzlyCreator.imageCropDragHandle.imageCropOffsetLeft - handleBoundingBox.right) + "px";
			imageCrop.style.height = PuzzlyCreator.imageCropDragHandle.imageCropHeight + (PuzzlyCreator.imageCropDragHandle.imageCropOffsetTop - parseInt(imageCrop.style.top)) + "px";
		}

		if(handleId === 'tr'){
			imageCrop.style.top = handleBoundingBox.bottom + "px";
			imageCropDragHandleTL.style.top = newY + "px";
			imageCropDragHandleBR.style.left = newX + "px";
			imageCrop.style.width = PuzzlyCreator.imageCropDragHandle.imageCropWidth + (newX - PuzzlyCreator.imageCropDragHandle.imageCropBoundingBox.right) + "px";
			imageCrop.style.height = PuzzlyCreator.imageCropDragHandle.imageCropHeight + (PuzzlyCreator.imageCropDragHandle.imageCropOffsetTop - parseInt(imageCrop.style.top)) + "px";
		}

		if(handleId === 'br'){
			imageCropDragHandleTR.style.left = newX + "px";
			imageCropDragHandleBL.style.top = newY + "px";
			imageCrop.style.width = PuzzlyCreator.imageCropDragHandle.imageCropWidth + (newX - PuzzlyCreator.imageCropDragHandle.imageCropBoundingBox.right) + "px";
			imageCrop.style.height = PuzzlyCreator.imageCropDragHandle.imageCropHeight + (newY - PuzzlyCreator.imageCropDragHandle.imageCropBoundingBox.bottom) + "px";
		}

		if(handleId === 'bl'){
			imageCrop.style.left = handleBoundingBox.right + "px";
			imageCropDragHandleTL.style.left = newX + "px";
			imageCropDragHandleBR.style.top = newY + "px";
			imageCrop.style.width = PuzzlyCreator.imageCropDragHandle.imageCropWidth + (PuzzlyCreator.imageCropDragHandle.imageCropOffsetLeft - handleBoundingBox.right) + "px";
			imageCrop.style.height = PuzzlyCreator.imageCropDragHandle.imageCropHeight + (newY - PuzzlyCreator.imageCropDragHandle.imageCropBoundingBox.bottom) + "px";
		}

		if(PuzzlyCreator.selectedShape === "Square"){
		} else {
			// e.target.style.top = newY + "px";
			// e.target.style.left = newX + "px";
		}
	}
}

imageCropDragHandles.forEach(el => {
	el.addEventListener('mousedown', onImageCropDragHandleMouseDown)
})

imageUpload.addEventListener('change', function(e){
	e.preventDefault();
	upload()
		.then( function(d){
			onUploadSuccess(d);
		}).catch( function(err){
			onUploadFailure(err);
		});
});

submit.addEventListener('click', function(e){
	e.preventDefault();
	createPuzzle();
});

function onUploadSuccess(response){
	imageUploadCtrlEl.style.display = "none";

	puzzleSetupCtrlEl.style.display = "flex";
	imageCrop.style.display = "block";
	
	const imageEl = document.createElement('img');
	imageEl.addEventListener('load', () => {
		const containerPos = imagePreviewEl.getBoundingClientRect();
		imageCrop.style.top = containerPos.top + "px";
		imageCrop.style.left = containerPos.left + "px";
		imageCrop.style.width = containerPos.height + "px";
		imageCrop.style.height = containerPos.height + "px";
		setPuzzleImageOffsetAndWidth(imageCrop);
		// setImageCropDragHandles();
	});

	const uploadPath = uploadDir + response.data.path
	imageEl.src = uploadPath;
	imagePreviewEl.appendChild(imageEl);
	PuzzlyCreator.puzzleSetup.sourceImage.path = uploadPath;
	PuzzlyCreator.puzzleSetup.sourceImage.dimensions = response.data.dimensions;
}

function onUploadFailure(response){
	console.log(response);
}

function upload(){
	const image = document.querySelector('[type=file]').files;
	
	const fd = new FormData();
	fd.append('files[]', image[0])

	return fetch('/api/upload', {
		body: fd,
		method: 'POST',
	})
	.then( response => response.json() )
}

function createPuzzle(){
	const puzzleConfig = {
		...PuzzlyCreator.puzzleSetup,
		groupCounter: 0,
		pieceSize: Math.round(PuzzlyCreator.puzzleSetup.selectedWidth / Math.sqrt(PuzzlyCreator.puzzleSetup.selectedNumPieces)),
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
		newPuzzleForm.style.display = 'none';
		new Puzzly('canvas', puzzleId, puzzleConfig)
	}).catch( function(err){
		console.log(err);
	});
}

function insertUrlParam(key, value) {
    if (history.pushState) {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, value);
        let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
        window.history.pushState({path: newurl}, '', newurl);
    }
}

function getQueryStringValue (key) { 
	return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}

document.body.onload = function(){
	const puzzleId = getQueryStringValue('puzzleId');

	if(puzzleId){
		fetch(`/api/puzzle/${puzzleId}`)
		.then( response => response.json() )
		.then( response => {
			new Puzzly('canvas', puzzleId, response, response.pieces)
		})
	} else {
		newPuzzleForm.style.display = 'flex';
	}
}

const isMobile = function() {
	let check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
  };

const JigsawSprintConnectorSize = {
	actual: 41,
	9: '+4',
};

class Puzzly {
	constructor(canvasId, puzzleId, config, progress = []){
		this.config = {
			debug: true,
			boardBoundary: 800,
			drawBoundingBox: false,
			backgroundImages: [
				{
					name: 'wood',
					path: './bg-wood.jpg'
				}
			],
			// jigsawSpriteConnectorSize: 41, // True size in sprite
			jigsawSpriteConnectorSize: 42,
			jigsawSpriteConnectorDistanceFromCorner: 43,
			...config,
			piecesPerSideHorizontal: config.selectedShape === 'Rectangle' ? config.piecesPerSideHorizontal : Math.sqrt(config.selectedNumPieces),
			piecesPerSideVertical: config.selectedShape === 'Rectangle' ? config.piecesPerSideVertical : Math.sqrt(config.selectedNumPieces),
			drawOutlines: config.drawOutlines || false,
			drawSquares: false
		};

		this.pieces = [];
		this.puzzleId = puzzleId;
		this.progress = progress;
		
		this.groupCounter = config.groupCounter;
		this.innerPiecesVisible = config.innerPiecesVisible !== undefined ? config.innerPiecesVisible : true;
		this.movingPieces = [];
		this.loadedAssets = [];
		this.SourceImage = new Image();
		this.SourceImage.src = config.sourceImage.path;

		this.canvas = document.getElementById(canvasId)

		this.JigsawSprite = new Image();
		this.JigsawSprite.src = './jigsaw-sprite.png';

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

		if(this.innerPiecesVisible){
			this.filterBtnOnLabel.style.display = 'block';
			this.filterBtnOffLabel.style.display = 'none';
		} else {
			this.filterBtnOffLabel.style.display = 'block';
			this.filterBtnOnLabel.style.display = 'none';
		}

		this.isPreviewActive = false;

		this.previewBtn.addEventListener('click', this.togglePreviewer.bind(this))
		this.filterBtn.addEventListener('click', this.toggleInnerPieces.bind(this))

		const assets = [
			this.SourceImage,
			this.JigsawSprite,
		];

		this.loadAssets(assets).then( () => {
			this.init()
		})
	}

	togglePreviewer(){
		if(this.isPreviewActive){
			this.fullImageViewerEl.style.display = 'none';
			this.previewBtnShowLabel.style.display = 'block';
			this.previewBtnHideLabel.style.display = 'none';
			this.isPreviewActive = false;
		} else {
			this.fullImageViewerEl.style.display = 'block';
			this.previewBtnShowLabel.style.display = 'none';
			this.previewBtnHideLabel.style.display = 'block';
			this.isPreviewActive = true;
		}
	}

	showPiece(piece){
		const el = this.getElementByPieceId(piece.id)
		el.style.display = 'block';
		el.style.zIndex = '100';
		piece.isVisible = true;
		return piece;
	}
	
	hidePiece(piece){
		const el = this.getElementByPieceId(piece.id)
		el.style.display = 'none';
		el.style.zIndex = '-1';
		piece.isVisible = false;
		return piece;
	}

	toggleInnerPieces(){
		if(this.innerPiecesVisible){
			this.pieces = this.pieces.map(p => {
				if(Utils.isInnerPiece(p)){
					return this.hidePiece(p);
				}
				return p;
			})
			this.innerPiecesVisible = false;
			this.filterBtnOffLabel.style.display = 'block';
			this.filterBtnOnLabel.style.display = 'none';
		} else {
			this.pieces = this.pieces.map(p => {
				if(Utils.isInnerPiece(p)){
					return this.showPiece(p);
				}
				return p;
			})
			this.innerPiecesVisible = true;
			this.filterBtnOffLabel.style.display = 'none';
			this.filterBtnOnLabel.style.display = 'block';
		}

		this.saveInnerPieceVisibility(this.innerPiecesVisible);
	}

	getConnectorSnapAdjustment(distance){
		if(distance.charAt(0) === '+'){
			return this.config.connectorSize + parseInt(distance.substr(1));
		} else {
			return this.config.connectorSize - parseInt(distance.substr(1));
		}
	}
	
	init(){
		console.log(this.config)

		this.config.pieceSize = Math.ceil(this.config.pieceSize)
		this.config.connectorDistanceFromCornerRatio = this.config.connectorRatio = 33;
		this.config.connectorSize = Math.ceil(this.config.pieceSize / 100 * this.config.connectorRatio);

		this.config.connectorDistanceFromCorner = Math.ceil(this.config.pieceSize / 100 * this.config.connectorDistanceFromCornerRatio);

		this.largestPieceSpan = this.config.pieceSize + (this.config.connectorSize * 2);
		this.boardBoundingBox = {
			top: this.config.boardBoundary,
			right: this.config.boardBoundary + (this.config.piecesPerSideHorizontal * this.config.pieceSize),
			left: this.config.boardBoundary,
			bottom: this.config.boardBoundary + (this.config.piecesPerSideVertical * this.config.pieceSize),
			width: this.config.boardBoundary + this.config.boardBoundary + (this.config.piecesPerSideHorizontal * this.config.pieceSize),
			height: this.config.boardBoundary + this.config.boardBoundary + (this.config.piecesPerSideVertical * this.config.pieceSize),
		};

		this.boardSize = {
			width: this.config.piecesPerSideHorizontal * this.config.pieceSize,
			height: this.config.piecesPerSideVertical * this.config.pieceSize,
		}
	
		this.canvas.style.width = this.boardSize.width + this.config.boardBoundary * 2 + "px";
		this.canvas.style.height = this.boardSize.height + this.config.boardBoundary * 2 + "px";

		this.canvasWidth = parseInt(this.canvas.style.width);
		this.canvasHeight = parseInt(this.canvas.style.height);

		// this.drawBackground();
		this.drawBoardArea();
		this.initiFullImagePreviewer();

		this.isFullImageViewerActive = false;
		
		if(this.progress.length > 0){
			this.pieces = this.progress;
			this.pieces.map(p => this.drawPieceManually(p))
		} else {
			this.makePieces();
			this.save(this.pieces)
		}
		
		this.innerPieces = document.querySelectorAll('.inner-piece');
		// this.drawPieceManually({type: [0,1,-1,0], pageX: 100, pageY: 100, isSolved: false})
		// this.drawPieceManually({type: [0,1,-1,-1], pageX: 316, pageY: 100, isSolved: false})

		if(isMobile()){
			window.addEventListener('touchstart', (e) => {
				this.onMouseDown(e);
			});
		} else {
			window.addEventListener('mousedown', (e) => {
				this.onMouseDown(e);
			});
		}
	}

	getTopPlug(leftBoundary, topBoundary, rightBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner + this.config.connectorSize/6),
				destY: Math.ceil(topBoundary - this.config.connectorSize/5),
				cpX: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner + this.config.connectorSize/5),
				cpY: Math.ceil(topBoundary - this.config.connectorSize/10),
			},
			secondCurve: {
				cp1: {
					x: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner - this.config.connectorDistanceFromCorner/4),
					y: Math.ceil(topBoundary - this.config.connectorSize/3),
				},
				cp2: {
					x: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner - this.config.connectorDistanceFromCorner/4),
					y: 1,
				},
				destX: Math.ceil(leftBoundary + this.config.pieceSize / 2),
				destY: 1,
			},
			thirdCurve: {
				cp1: {
					x: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner + this.config.connectorDistanceFromCorner/4),
					y: 1,
				},
				cp2: {
					x: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner + this.config.connectorDistanceFromCorner/4),
					y: Math.ceil(topBoundary - this.config.connectorSize/3),
				},
				destX: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner - this.config.connectorSize/6),
				destY: Math.ceil(topBoundary - this.config.connectorSize/5),
			},
			fourthCurve: {
				cpX: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner - this.config.connectorSize/5),
				cpY: Math.ceil(topBoundary - this.config.connectorSize/10),
				destX: rightBoundary - this.config.connectorDistanceFromCorner,
				destY: topBoundary,
			}
		}
	}

	getTopSocket(leftBoundary, topBoundary, rightBoundary, totalWidth){
		return {
			firstCurve: {
				destX: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/6)),
				destY: Math.ceil(topBoundary + (this.config.connectorSize/5)),
				cpX: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/5)),
				cpY: Math.ceil(topBoundary + (this.config.connectorSize/10)),
			},
			secondCurve: {
				cp1: {
					x: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					y: Math.ceil(topBoundary + (this.config.connectorSize/3)),
				},
				cp2: {
					x: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					y: topBoundary + this.config.connectorSize -1,
				},
				destX: Math.ceil(leftBoundary + (this.config.pieceSize/2)),
				destY: topBoundary + this.config.connectorSize -1,
			},
			thirdCurve: {
				cp1: {
					x: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					y: topBoundary + this.config.connectorSize -1,
				},
				cp2: {
					x: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					y: Math.ceil(topBoundary + (this.config.connectorSize/3)),
				},
				destX: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner - (this.config.connectorSize/6)),
				destY: Math.ceil(topBoundary + (this.config.connectorSize/5)),
			},
			fourthCurve: {
				cpX: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner - (this.config.connectorSize/5)),
				cpY: Math.ceil(topBoundary + (this.config.connectorSize/10)),
				destX: rightBoundary - this.config.connectorDistanceFromCorner,
				destY: topBoundary,
			}
		}
	}

	getRightPlug(topBoundary, rightBoundary, leftBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(rightBoundary + (this.config.connectorSize/5)),
				destY: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/6)),
				cpX: Math.ceil(rightBoundary + (this.config.connectorSize/10)),
				cpY: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/5)),
			},
			secondCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary + this.config.pieceSize + (this.config.connectorSize/3)),
				},
				cp2: {
					y: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					x: leftBoundary + this.config.pieceSize + this.config.connectorSize -1,
				},
				destX: leftBoundary + this.config.pieceSize + this.config.connectorSize -1,
				destY: Math.ceil(topBoundary + this.config.pieceSize - (this.config.pieceSize/2)),
			},
			thirdCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner + this.config.connectorDistanceFromCorner/4),
					x: leftBoundary + this.config.pieceSize + this.config.connectorSize -1,
				},
				cp2: {
					y: Math.ceil(topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner + this.config.connectorDistanceFromCorner/4),
					x: Math.ceil(leftBoundary + this.config.pieceSize + (this.config.connectorSize/3)),
				},
				destY: Math.ceil(topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner - (this.config.connectorSize/6)),
				destX: Math.ceil(leftBoundary + this.config.pieceSize + (this.config.connectorSize/5)),
			},
			fourthCurve: {
				cpY: Math.ceil(topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner - (this.config.connectorSize/5)),
				cpX: Math.ceil(leftBoundary + this.config.pieceSize + (this.config.connectorSize/10)),
				destY: topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner,
				destX: leftBoundary + this.config.pieceSize,
			}
		}
	}

	getRightSocket(topBoundary, rightBoundary, bottomBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(rightBoundary - (this.config.connectorSize/5)),
				destY: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/6)),
				cpX: Math.ceil(rightBoundary - (this.config.connectorSize/10)),
				cpY: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/5)),
			},
			secondCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					x: Math.ceil(rightBoundary - (this.config.connectorSize/3)),
				},
				cp2: {
					y: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					x: rightBoundary - this.config.connectorSize,
				},
				destX: rightBoundary - this.config.connectorSize,
				destY: Math.ceil(topBoundary + (this.config.pieceSize/2)),
			},
			thirdCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					x: rightBoundary - this.config.connectorSize,
				},
				cp2: {
					y: Math.ceil(topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					x: Math.ceil(rightBoundary - (this.config.connectorSize/3)),
				},
				destY: Math.ceil(topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner - (this.config.connectorSize/6)),
				destX: Math.ceil(rightBoundary - (this.config.connectorSize/5)),
			},
			fourthCurve: {
				cpY: Math.ceil(topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner - (this.config.connectorSize/5)),
				cpX: Math.ceil(rightBoundary - (this.config.connectorSize/10)),
				destY: topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner,
				destX: rightBoundary,
			}
		}
	}

	getBottomPlug(rightBoundary, bottomBoundary, leftBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner - (this.config.connectorSize/6)),
				destY: bottomBoundary + (this.config.connectorSize/5),
				cpX: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner - this.config.connectorSize/5),
				cpY: Math.ceil(bottomBoundary + (this.config.connectorSize/10)),
			},
			secondCurve: {
				cp1: {
					x: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					y: Math.ceil(bottomBoundary + (this.config.connectorSize/3)),
				},
				cp2: {
					x: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					y: bottomBoundary + this.config.connectorSize -1,
				},
				destX: Math.ceil(leftBoundary + this.config.pieceSize - (this.config.pieceSize/2)),
				destY: bottomBoundary + this.config.connectorSize -1,
			},
			thirdCurve: {
				cp1: {
					x: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					y: bottomBoundary + this.config.connectorSize-1,
				},
				cp2: {
					x: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					y: Math.ceil(bottomBoundary + (this.config.connectorSize/3)),
				},
				destX: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/6)),
				destY: Math.ceil(bottomBoundary + (this.config.connectorSize/5)),
			},
			fourthCurve: {
				cpX: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/5)),
				cpY: Math.ceil(bottomBoundary + (this.config.connectorSize/10)),
				destX: leftBoundary + this.config.connectorDistanceFromCorner,
				destY: bottomBoundary,
			}
		}
	}

	getBottomSocket(rightBoundary, bottomBoundary, leftBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner - (this.config.connectorSize/6)),
				destY: Math.ceil(bottomBoundary - (this.config.connectorSize/5)),
				cpX: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner - (this.config.connectorSize/5)),
				cpY: Math.ceil(bottomBoundary - (this.config.connectorSize/10)),
			},
			secondCurve: {
				cp1: {
					x: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					y: Math.ceil(bottomBoundary - (this.config.connectorSize/3)),
				},
				cp2: {
					x: Math.ceil(rightBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					y: bottomBoundary - this.config.connectorSize +1,
				},
				destX: Math.ceil(rightBoundary - (this.config.pieceSize/2)),
				destY: bottomBoundary - this.config.connectorSize +1,
			},
			thirdCurve: {
				cp1: {
					x: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					y: bottomBoundary - this.config.connectorSize +1,
				},
				cp2: {
					x: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					y: Math.ceil(bottomBoundary - (this.config.connectorSize/3)),
				},
				destX: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/6)),
				destY: bottomBoundary - (this.config.connectorSize/5),
			},
			fourthCurve: {
				cpX: Math.ceil(leftBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/5)),
				cpY: Math.ceil(bottomBoundary - (this.config.connectorSize/10)),
				destX: leftBoundary + this.config.connectorDistanceFromCorner,
				destY: bottomBoundary,
			}
		}
	}

	getLeftPlug(bottomBoundary, leftBoundary, topBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(leftBoundary - (this.config.connectorSize/5)),
				destY: Math.ceil(bottomBoundary - this.config.connectorDistanceFromCorner - (this.config.connectorSize/6)),
				cpX: Math.ceil(leftBoundary - (this.config.connectorSize/10)),
				cpY: Math.ceil(bottomBoundary - this.config.connectorDistanceFromCorner - (this.config.connectorSize/5)),
			},
			secondCurve: {
				cp1: {
					y: Math.ceil(bottomBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary - (this.config.connectorSize/3)),
				},
				cp2: {
					y: Math.ceil(bottomBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					x: 0,
				},
				destX: 0,
				destY: Math.ceil(bottomBoundary - (this.config.pieceSize/2)),
			},
			thirdCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					x: 0,
				},
				cp2: {
					y: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary - (this.config.connectorSize/3)),
				},
				destY: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/6)),
				destX: Math.ceil(leftBoundary - (this.config.connectorSize/5)),
			},
			fourthCurve: {
				cpY: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/5)),
				cpX: Math.ceil(leftBoundary - (this.config.connectorSize/10)),
				destY: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner),
				destX: leftBoundary,
			}
		}
	}

	getLeftSocket(bottomBoundary, leftBoundary, topBoundary){
		return {
			firstCurve: {
				destX: Math.ceil(leftBoundary + (this.config.connectorSize/5)),
				destY: Math.ceil(bottomBoundary - this.config.connectorDistanceFromCorner - (this.config.connectorSize/6)),
				cpX: Math.ceil(leftBoundary + (this.config.connectorSize/10)),
				cpY: Math.ceil(bottomBoundary - this.config.connectorDistanceFromCorner - (this.config.connectorSize/5)),
			},
			secondCurve: {
				cp1: {
					y: Math.ceil(bottomBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary + (this.config.connectorSize/3)),
				},
				cp2: {
					y: Math.ceil(bottomBoundary - this.config.connectorDistanceFromCorner + (this.config.connectorDistanceFromCorner/4)),
					x: this.config.connectorSize -1,
				},
				destX: this.config.connectorSize -1,
				destY: Math.ceil(bottomBoundary - (this.config.pieceSize/2))
			},
			thirdCurve: {
				cp1: {
					y: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					x: this.config.connectorSize -1,
				},
				cp2: {
					y: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner - (this.config.connectorDistanceFromCorner/4)),
					x: Math.ceil(leftBoundary + (this.config.connectorSize/3)),
				},
				destY: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/6)),
				destX: Math.ceil(leftBoundary + (this.config.connectorSize/5)),
			},
			fourthCurve: {
				cpY: Math.ceil(topBoundary + this.config.connectorDistanceFromCorner + (this.config.connectorSize/5)),
				cpX: Math.ceil(leftBoundary + (this.config.connectorSize/10)),
				destY: topBoundary + this.config.connectorDistanceFromCorner,
				destX: leftBoundary,
			}
		}
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

	repaintPiece(piece){
		const el = this.getElementByPieceId(piece.id);
		const ctx = el.getContext('2d');
		ctx.drawImage(this.SourceImage, piece.imgX, piece.imgY, piece.imgW, piece.imgH, 0, 0, piece.imgW, piece.imgH);
	}

	drawPieceManually(piece){
		const el = document.createElement("canvas");
		const ctx = el.getContext("2d");
		el.style.position = "absolute";
		el.style.left = piece.pageX + "px";
		el.style.top = piece.pageY + "px";
		el.className = "puzzle-piece";
		el.style.zIndex = 10;

		el.setAttribute('data-jigsaw-type', piece.type.join(","))
		el.setAttribute('data-piece-id', piece.id)
		el.setAttribute('data-imgX', piece.imgX)
		el.setAttribute('data-imgy', piece.imgY)

		if(piece.isInnerPiece){
			el.className += " inner-piece";
			if(!this.innerPiecesVisible){
				el.style.display = 'none';
			}
		}

		el.style.width = piece.imgW + "px";
		el.style.height = piece.imgH + 'px';
		el.width = piece.imgW;
		el.height = piece.imgH;
		this.canvas.appendChild(el);

		ctx.strokeStyle = '#000';
		
		const hasTopPlug = Utils.has(piece, 'plug', 'top')
		const hasLeftPlug = Utils.has(piece, 'plug', 'left')
		
		const topBoundary = hasTopPlug ? this.config.connectorSize : 0;
		const leftBoundary = hasLeftPlug ? this.config.connectorSize : 0;
		
		let topConnector;
		
		const path = new Path2D();
		path.moveTo(leftBoundary, topBoundary);

		if(Utils.has(piece, 'plug', 'top')){
			topConnector = this.getTopPlug(leftBoundary, topBoundary, leftBoundary + this.config.pieceSize);
		} else if(Utils.has(piece, 'socket', 'top')){
			topConnector = this.getTopSocket(leftBoundary, topBoundary, leftBoundary + this.config.pieceSize);
		}

		if(topConnector){
			path.lineTo(leftBoundary + this.config.connectorDistanceFromCorner, topBoundary);
			path.quadraticCurveTo(topConnector.firstCurve.cpX, topConnector.firstCurve.cpY, topConnector.firstCurve.destX, topConnector.firstCurve.destY);
			path.bezierCurveTo(topConnector.secondCurve.cp1.x, topConnector.secondCurve.cp1.y, topConnector.secondCurve.cp2.x, topConnector.secondCurve.cp2.y, topConnector.secondCurve.destX, topConnector.secondCurve.destY)
			path.bezierCurveTo(topConnector.thirdCurve.cp1.x, topConnector.thirdCurve.cp1.y, topConnector.thirdCurve.cp2.x, topConnector.thirdCurve.cp2.y, topConnector.thirdCurve.destX, topConnector.thirdCurve.destY)
			path.quadraticCurveTo(topConnector.fourthCurve.cpX, topConnector.fourthCurve.cpY, topConnector.fourthCurve.destX, topConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary + this.config.pieceSize, topBoundary);

		let rightConnector = null;
		if(Utils.has(piece, 'plug', 'right')){
			rightConnector = this.getRightPlug(topBoundary, leftBoundary + this.config.pieceSize, leftBoundary);
		} else if(Utils.has(piece, 'socket', 'right')){
			rightConnector = this.getRightSocket(topBoundary, leftBoundary + this.config.pieceSize, leftBoundary);
		}

		if(rightConnector){
			path.lineTo(leftBoundary + this.config.pieceSize, topBoundary + this.config.connectorDistanceFromCorner);
			path.quadraticCurveTo(rightConnector.firstCurve.cpX, rightConnector.firstCurve.cpY, rightConnector.firstCurve.destX, rightConnector.firstCurve.destY);
			path.bezierCurveTo(rightConnector.secondCurve.cp1.x, rightConnector.secondCurve.cp1.y, rightConnector.secondCurve.cp2.x, rightConnector.secondCurve.cp2.y, rightConnector.secondCurve.destX, rightConnector.secondCurve.destY)
			path.bezierCurveTo(rightConnector.thirdCurve.cp1.x, rightConnector.thirdCurve.cp1.y, rightConnector.thirdCurve.cp2.x, rightConnector.thirdCurve.cp2.y, rightConnector.thirdCurve.destX, rightConnector.thirdCurve.destY);
			path.quadraticCurveTo(rightConnector.fourthCurve.cpX, rightConnector.fourthCurve.cpY, rightConnector.fourthCurve.destX, rightConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary + this.config.pieceSize, topBoundary + this.config.pieceSize)
		

		let bottomConnector = null;
		if(Utils.has(piece, 'plug', 'bottom')){
			bottomConnector = this.getBottomPlug(leftBoundary + this.config.pieceSize, topBoundary + this.config.pieceSize, leftBoundary, piece.imgW);
		} else if(Utils.has(piece, 'socket', 'bottom')){
			bottomConnector = this.getBottomSocket(leftBoundary + this.config.pieceSize, topBoundary + this.config.pieceSize, leftBoundary, piece.imgW);
		}

		if(bottomConnector){
			path.lineTo(leftBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner, topBoundary + this.config.pieceSize);
			path.quadraticCurveTo(bottomConnector.firstCurve.cpX, bottomConnector.firstCurve.cpY, bottomConnector.firstCurve.destX, bottomConnector.firstCurve.destY);
			path.bezierCurveTo(bottomConnector.secondCurve.cp1.x, bottomConnector.secondCurve.cp1.y, bottomConnector.secondCurve.cp2.x, bottomConnector.secondCurve.cp2.y, bottomConnector.secondCurve.destX, bottomConnector.secondCurve.destY)
			path.bezierCurveTo(bottomConnector.thirdCurve.cp1.x, bottomConnector.thirdCurve.cp1.y, bottomConnector.thirdCurve.cp2.x, bottomConnector.thirdCurve.cp2.y, bottomConnector.thirdCurve.destX, bottomConnector.thirdCurve.destY);
			path.quadraticCurveTo(bottomConnector.fourthCurve.cpX, bottomConnector.fourthCurve.cpY, bottomConnector.fourthCurve.destX, bottomConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary, topBoundary + this.config.pieceSize)

		let leftConnector = null;
		if(Utils.has(piece, 'plug', 'left')){
			leftConnector = this.getLeftPlug(topBoundary + this.config.pieceSize, leftBoundary, topBoundary, piece.imgH);
		} else if(Utils.has(piece, 'socket', 'left')){
			leftConnector = this.getLeftSocket(topBoundary + this.config.pieceSize, leftBoundary, topBoundary, piece.imgH);
		}

		if(leftConnector){
			path.lineTo(leftBoundary, topBoundary + this.config.pieceSize - this.config.connectorDistanceFromCorner)
			path.quadraticCurveTo(leftConnector.firstCurve.cpX, leftConnector.firstCurve.cpY, leftConnector.firstCurve.destX, leftConnector.firstCurve.destY);
			path.bezierCurveTo(leftConnector.secondCurve.cp1.x, leftConnector.secondCurve.cp1.y, leftConnector.secondCurve.cp2.x, leftConnector.secondCurve.cp2.y, leftConnector.secondCurve.destX, leftConnector.secondCurve.destY)
			path.bezierCurveTo(leftConnector.thirdCurve.cp1.x, leftConnector.thirdCurve.cp1.y, leftConnector.thirdCurve.cp2.x, leftConnector.thirdCurve.cp2.y, leftConnector.thirdCurve.destX, leftConnector.thirdCurve.destY);
			path.quadraticCurveTo(leftConnector.fourthCurve.cpX, leftConnector.fourthCurve.cpY, leftConnector.fourthCurve.destX, leftConnector.fourthCurve.destY);
		}
		path.lineTo(leftBoundary, topBoundary)
		path.closePath()
		// ctx.stroke(path)
		
		// if(topConnector) this.drawPlugGuides(ctx, topConnector)
		// if(rightConnector) this.drawPlugGuides(ctx, rightConnector)
		// if(bottomConnector) this.drawPlugGuides(ctx, bottomConnector)
		// if(leftConnector) this.drawPlugGuides(ctx, leftConnector)
		ctx.clip(path)
		ctx.drawImage(this.SourceImage, piece.imgX, piece.imgY, piece.imgW, piece.imgH, 0, 0, piece.imgW, piece.imgH);
	}
	
	drawPiece(piece) {
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
		canvasEl.style.zIndex = 10;
		canvasEl.setAttribute('width', piece.imgW);
		canvasEl.setAttribute('height', piece.imgH);
		canvasEl.style.position = "absolute";

		canvasEl.style.left = piece.pageX + "px";
		canvasEl.style.top = piece.pageY + "px";

		canvasEl.addEventListener('mouseenter', e => {
			const allPieces = document.querySelectorAll('.puzzle-piece');
			allPieces.forEach(p => p.style.zIndex = 10);
			e.target.style.zIndex = 100;
		})

		const cvctx = canvasEl.getContext("2d");

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

		

		if(this.config.drawOutlines){
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

	onMouseDown(e){
		let element, diffX, diffY;
		if(e.which === 1){
			if(e.target.classList.contains("puzzle-piece")){
				const thisPiece = this.pieces.find(p => p.id === parseInt(e.target.getAttribute("data-piece-id")));
				if(thisPiece.isSolved){
					return;
				}
				if(thisPiece.group !== undefined && thisPiece.group !== null && thisPiece.group > -1){
					this.pieces.forEach(p => {

						if(p.group === thisPiece.group){
							element = this.getElementByPieceId(p.id);
							element.style.zIndex = 100;
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
					element = this.getElementByPieceId(thisPiece.id);
					element.style.zIndex = 100;
					this.movingPieces = [{
						...thisPiece,
						diffX: e.clientX - e.target.offsetLeft,
						diffY: e.clientY - e.target.offsetTop,
					}]
				}
			}

			if(e.target.id === "canvas" || e.target.id === "board-area"){
				this.isCanvasMoving = true;
				element = this.canvas;
				this.canvasDiffX = e.clientX - element.offsetLeft;
				this.canvasDiffY = e.clientY - element.offsetTop;
			}
			
			this.mouseMoveFunc = this.onMouseMove(this.movingPieces)

			this.isMouseDown = true;

			if(this.isCanvasMoving){
				window.addEventListener('mousemove', this.moveCanvas.bind(this));
			} else {
				window.addEventListener('mousemove', this.mouseMoveFunc);
			}
			window.addEventListener('mouseup', this.onMouseUp.bind(this));
		}
	}

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

	updatePiecePositionsByDiff(diff, pieces){
		const pieceIDs = pieces.map(p => p.id);
		this.pieces = this.pieces.map(p => {
			if(pieceIDs.includes(p.id)){
				const diffTopOperand = diff.top.charAt(0);
				const diffTopValue = diffTopOperand === "+" ? Math.ceil(parseFloat(diff.top.substr(1))) : Math.floor(parseFloat(diff.top.substr(1)));
				const diffLeftOperand = diff.left.charAt(0);
				const diffLeftValue = diffLeftOperand === "+" ? Math.ceil(parseFloat(diff.left.substr(1))) : Math.floor(parseFloat(diff.left.substr(1)));
				
				const element = this.getElementByPieceId(p.id);
	
				const newPosTop = diffTopOperand === "+" ? element.offsetTop + diffTopValue : element.offsetTop - diffTopValue;
				const newPosLeft = diffLeftOperand === "+" ? element.offsetLeft + diffLeftValue : element.offsetLeft - diffLeftValue;
				
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

	onMouseUp(e){
		const el = e.target;
		this.isMouseDown = false;
		let pieces;

		if(this.isCanvasMoving){
			this.isCanvasMoving = false;
			this.canvasDiffX = null;
			this.canvasDiffY = null;
		} else if(this.movingPieces.length){
			let hasConnection = false, noneFound = false, connection, i = 0;
			
			if(this.movingPieces.length > 1){
				while(!hasConnection && !noneFound){
					const piece = this.movingPieces[i];
					const element = this.getElementByPieceId(piece.id);
					this.updatePiecePosition(element);
					connection = this.checkConnections(element);

					if(connection){
						this.clickSound.play();
						const diff = this.snapPiece(element, connection);
						const trailingPieces = this.movingPieces.filter( p => p.id !== piece.id);
						this.updatePiecePositionsByDiff(diff, trailingPieces);

						if(this.isCornerConnection(connection) || this.shouldMarkAsSolved(this.movingPieces)){
							this.markAsSolved(this.movingPieces);
						}

						hasConnection = true;
					}
	
					if(i === this.movingPieces.length - 1 && !hasConnection){
						noneFound = true;
					}
					
					i++;
				}

				const pieceIds = this.movingPieces.map(p => p._id);
				pieces = this.pieces.filter(p => pieceIds.includes(p._id));
			} else {
				const element = this.getElementByPieceId(this.movingPieces[0].id);
				element.style.zIndex = 3;
				connection = this.checkConnections(element);
				if(connection){
					this.clickSound.play();
					this.snapPiece(element, connection);
					const updatedPiece = this.getPieceByElement(element);
					if(this.isCornerConnection(connection) && this.shouldMarkAsSolved([updatedPiece])){
						this.markAsSolved([updatedPiece]);
					}

					// If we've created a new group, update both pieces in persistence
					if(updatedPiece.group > -1){
						pieces = this.pieces.filter(p => p.group > -1 && p.group === updatedPiece.group);
					} else {
						pieces = [updatedPiece]
					}
				}

				if(!pieces){
					let piece = this.movingPieces[0];
					this.updatePiecePosition(this.getElementByPieceId(piece.id));
					pieces = [this.getPieceById(piece.id)];
				}
			}

			this.save(pieces)
			this.movingPieces = [];
		}

		window.removeEventListener('mousemove', this.moveCanvas);
		window.removeEventListener('mousemove', this.mouseMoveFunc);
		window.removeEventListener('mouseup', this.onMouseUp);
	}

	isCornerConnection(str){
		return str === "top-left" || str === "top-right" || str === "bottom-right" || str === "bottom-left";
	}

	shouldMarkAsSolved(pieces){
		if(pieces.length === 1){
			return Utils.isCornerPiece(pieces[0]) || this.pieces.filter(p => p.group === pieces[0].group).some(p => Utils.isCornerPiece(p) && p.isSolved)
		} else {
			pieces.some(p => Utils.isCornerPiece(p) && p.isSolved)
		}
	}

	markAsSolved(pieces){
		let hasGroup;
		let group;
		let pieceIds;

		if(pieces.length > 1){
			hasGroup = true;
			group = pieces[0].group;
			pieceIds = pieces.map(p => p.id);
		}
		

		this.pieces = this.pieces.map(p => {
			if(hasGroup && p.group === group || p.id === pieces[0].id){
				const el = this.getElementByPieceId(p.id);
				el.setAttribute("data-is-solved", true);
				return {
					...p,
					isSolved: true
				}
			}
			return p;
		})
	}

	onMouseMove(piecesToMove){
		return function(e){
			piecesToMove.forEach( p => {
				const element = this.getElementByPieceId(p.id);
				const newPosTop = e.clientY - p.diffY;
				const newPosLeft = e.clientX - p.diffX;
				element.style.top = newPosTop + "px";
				element.style.left = newPosLeft + "px";
				this.updatePiecePosition(element);
			})
		}.bind(this)
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
		var curImgX = this.config.selectedOffsetX || 0;
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

		const piecesPerSideHorizontal = this.config.piecesPerSideHorizontal;
		const piecesPerSideVertical = this.config.piecesPerSideVertical;

		while(!done){
			let currentPiece = {};
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

			if(rowCount === piecesPerSideVertical){
				finalRow = true;
			}

			const previousPiece = this.pieces[this.pieces.length-1];
			if(this.pieces.length > 0 && !Utils.isTopRightCorner(previousPiece) && !Utils.isRightSide(previousPiece)){
				adjacentPieceBehind = this.pieces[i-1];
			}

			if(Utils.isRightSide(previousPiece)){
				adjacentPieceBehind = null;
			}

			currentPiece.type = this.getConnectors(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow);
			currentPiece = this.assignInitialPieceData(curImgX, curImgY, curPageX, curPageY, currentPiece, i);

			this.pieces.push(currentPiece);
			this.drawPieceManually(currentPiece);

			const pieceSize = this.config.pieceSize;

			// reached last piece, start next row
			if(this.pieces.length % piecesPerSideHorizontal === 0){
				curImgX = this.config.selectedOffsetX || 0;
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

	getConnectors(adjacentPieceBehind, adjacentPieceAbove, endOfRow, finalRow){
		const connectorChoices = [-1,1];

		// Top left corner piece
		if(!adjacentPieceBehind && !adjacentPieceAbove){
			const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
			const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
			return [0,rightConnector,bottomConnector,0]
		}

		// First row pieces
		if(!adjacentPieceAbove){
			const rightConnector = endOfRow ? 0 : connectorChoices[Math.floor(Math.random() * 2)];
			const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
			const leftConnector = Utils.has(adjacentPieceBehind, 'plug', 'right') ? -1 : 1;
			return [0,rightConnector,bottomConnector,leftConnector];
		}
		// All pieces after top row
		else {
			// Last piece of each row, should be right side
			if(Utils.isTopRightCorner(adjacentPieceAbove) || (!finalRow && Utils.isRightSide(adjacentPieceAbove))){
				const topConnector = Utils.has(adjacentPieceAbove, 'plug', 'bottom') ? -1 : 1;
				const rightConnector = 0;
				const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const leftConnector = Utils.has(adjacentPieceBehind, 'plug', 'right') ? -1 : 1;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}
			
			// First piece of each row, should be left side
			if(Utils.isTopLeftCorner(adjacentPieceAbove) || (!finalRow && Utils.isLeftSide(adjacentPieceAbove))){
				const topConnector = Utils.has(adjacentPieceAbove, 'plug', 'bottom') ? -1 : 1;
				const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const leftConnector = 0;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}
			
			// All middle pieces
			if((!finalRow && Utils.isInnerPiece(adjacentPieceAbove)) || Utils.isTopSide(adjacentPieceAbove)){
				const topConnector = Utils.has(adjacentPieceAbove, 'plug', 'bottom') ? -1 : 1;
				const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const bottomConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const leftConnector = Utils.has(adjacentPieceBehind, 'plug', 'right') ? -1 : 1;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}

			if(finalRow && Utils.isLeftSide(adjacentPieceAbove)){
				const topConnector = Utils.has(adjacentPieceAbove, 'plug', 'bottom') ? -1 : 1;
				const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const bottomConnector = 0;
				const leftConnector = 0;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}
			
			if(finalRow && Utils.isInnerPiece(adjacentPieceAbove) && (Utils.isBottomLeftCorner(adjacentPieceBehind) || Utils.isBottomSide(adjacentPieceBehind))){
				const topConnector = Utils.has(adjacentPieceAbove, 'plug', 'bottom') ? -1 : 1;
				const rightConnector = connectorChoices[Math.floor(Math.random() * 2)];
				const bottomConnector = 0;
				const leftConnector = Utils.has(adjacentPieceBehind, 'plug', 'right') ? -1 : 1;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}

			// Very last piece, should be corner bottom right
			if(Utils.isRightSide(adjacentPieceAbove) && Utils.isBottomSide(adjacentPieceBehind)){
				const topConnector = Utils.has(adjacentPieceAbove, 'plug', 'bottom') ? -1 : 1;
				const rightConnector = 0;
				const bottomConnector = 0;
				const leftConnector = Utils.has(adjacentPieceBehind, 'plug', 'right') ? -1 : 1;
				return [topConnector, rightConnector, bottomConnector, leftConnector]
			}
		}
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

	getConnectingPieceIds(piece){
		const pieceAboveId = piece.id - this.config.piecesPerSideHorizontal;
		const pieceBelowId = piece.id + this.config.piecesPerSideHorizontal;
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
		const chosen = sector === 1 ? "top" : sector === 2 ? "right" : sector === 3 ? "bottom" : sector === 4 ? "left" : "";
		switch(chosen){
			case "top":
				return {
					top: 0,
					right: this.boardBoundingBox.right,
					bottom: this.config.boardBoundary,
					left: this.config.boardBoundary,
				}
			case "right":
				return {
					top: 0,
					right: this.canvasWidth,
					bottom: this.canvasHeight,
					left: this.config.boardBoundary + this.boardBoundingBox.right,
				}
			case "bottom":
				return {
					top: this.config.boardBoundary + this.boardBoundingBox.bottom,
					right: this.boardBoundingBox.right,
					bottom: this.canvasHeight,
					left: this.boardBoundingBox.left,
				}
			case "left":
				return {
					top: 0,
					right: this.boardBoundingBox.left,
					bottom: this.canvasHeight,
					left: 0,
				}
		}
	}

	drawBoardArea(){
		const element = document.createElement('div');
		element.id = "board-area";
		element.style.position = "absolute";
		element.style.top = this.boardBoundingBox.top + "px";
		element.style.left = this.boardBoundingBox.left + "px";
		element.style.border = "3px groove #222";
		element.style.zIndex = 2;
		element.style.width = this.boardSize.width + "px";
		element.style.height = this.boardSize.height + "px";
		this.canvas.appendChild(element);
	}

	getRandomPositionOutsideBoardArea(piece, sector){
		const randSectorBoundingBox = this.getSectorBoundingBox(sector);
		return {
			left: this.getRandomInt(randSectorBoundingBox.left, randSectorBoundingBox.right - this.largestPieceSpan),
			top: this.getRandomInt(randSectorBoundingBox.top, randSectorBoundingBox.bottom - this.largestPieceSpan),
		}
	}

	getPieceWidthAndHeightWithConnectors(piece){
		let actualWidth = this.config.pieceSize;
		let actualHeight = this.config.pieceSize;

		if(Utils.has(piece, 'plug', 'left')){
			actualWidth += this.config.connectorSize; 
		}
		if(Utils.has(piece, 'plug', 'right')){
			actualWidth += this.config.connectorSize; 
		}

		if(Utils.has(piece, 'plug', 'top')){
			actualHeight += this.config.connectorSize; 
		}
		if(Utils.has(piece, 'plug', 'bottom')){
			actualHeight += this.config.connectorSize; 
		}

		return {
			width: actualWidth,
			height: actualHeight,
		}
	}

	assignInitialPieceData(imgX, imgY, canvX, canvY, piece, i){
		const pieceDimensions = this.getPieceWidthAndHeightWithConnectors(piece);
		const randPos = this.getRandomPositionOutsideBoardArea(piece, this.getRandomInt(1,4));
		return Object.assign({
			puzzleId: this.puzzleId,
			shapeId: piece._shape_id,
			id: i,
			imgX: imgX,
			imgY: imgY,
			imgW: pieceDimensions.width,
			imgH: pieceDimensions.height,
			pageX: this.config.debug ? canvX : randPos.left,
			pageY: this.config.debug ? canvY : randPos.top,
			isInnerPiece: Utils.isInnerPiece(piece),
			isVisible: true,
		}, piece);
	}

	assignPieceConnections(){
		this.pieces.forEach(p => p.connectsTo = this.getConnectingPieceIds(p));
	}

	getConnectorBoundingBox(piece, side){
		const hasRightPlug = Utils.has(piece, "plug", "right");
		const hasLeftPlug = Utils.has(piece, "plug", "left");
		const hasTopPlug = Utils.has(piece, "plug", "top");
		const hasBottomPlug = Utils.has(piece, "plug", "bottom");
		switch(side){
			case "left":
				return {
					top: piece.pageY + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner),
					right: piece.pageX + this.config.connectorSize,
					bottom: piece.pageY + piece.imgH - (hasBottomPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner),
					left: piece.pageX,
				}
			case "right":
				return {
					top: piece.pageY + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner),
					right: piece.pageX + piece.imgW,
					bottom: piece.pageY + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize,
					left: piece.pageX + piece.imgW - this.config.connectorSize,
				}
			case "bottom":
				return {
					top: piece.pageY + piece.imgH - this.config.connectorSize,
					right: piece.pageX + piece.imgW - (hasRightPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner),
					bottom: piece.pageY + piece.imgH,
					left: piece.pageX + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner),
				}
			case "top":
				return {
					top: piece.pageY,
					right: piece.pageX + piece.imgW - (hasRightPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner),
					bottom: piece.pageY + this.config.connectorSize,
					left: piece.pageX + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner),
				}
		}
	}

	getTopLeftCornerBoundingBox(){
		return {
			top: this.config.boardBoundary,
			right: this.config.boardBoundary + this.largestPieceSpan,
			bottom: this.config.boardBoundary + this.largestPieceSpan,
			left: this.config.boardBoundary,
		}
	}

	getTopRightCornerBoundingBox(){
		return {
			top: this.config.boardBoundary,
			right: this.canvasWidth - this.config.boardBoundary,
			bottom: this.config.boardBoundary + this.largestPieceSpan,
			left: this.canvasWidth - this.config.boardBoundary - this.largestPieceSpan,
		}
	}

	getBottomRightCornerBoundingBox(){
		return {
			top: this.canvasHeight - this.config.boardBoundary - this.largestPieceSpan,
			right: this.canvasWidth - this.config.boardBoundary,
			bottom: this.canvasHeight - this.config.boardBoundary,
			left: this.canvasWidth - this.config.boardBoundary - this.largestPieceSpan,
		}
	}

	getBottomLeftCornerBoundingBox(){
		return {
			top: this.canvasHeight - this.config.boardBoundary - this.largestPieceSpan,
			right: this.config.boardBoundary + this.largestPieceSpan,
			bottom: this.canvasHeight - this.config.boardBoundary,
			left: this.config.boardBoundary,
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

	updatePiecePosition(el){
		el.style.zIndex = 2;
		const pid = parseInt(el.getAttribute('data-piece-id'));
		const piece = this.pieces.find(p => p.id === pid);
		this.pieces = this.pieces.map(p => {
			if(p.id === piece.id){
				return {
					...p,
					pageX: el.offsetLeft,
					pageY: el.offsetTop,
				}
			}
			return p;
		})
	}

	checkConnections(el){
		const piece = this.getPieceByElement(el);
		const hasRightConnector = Utils.has(piece, "plug", "right") || Utils.has(piece, "socket", "right");
		const hasBottomConnector = Utils.has(piece, "plug", "bottom") || Utils.has(piece, "socket", "bottom");
		const hasLeftConnector = Utils.has(piece, "plug", "left") || Utils.has(piece, "socket", "left");
		const hasTopConnector = Utils.has(piece, "plug", "top") || Utils.has(piece, "socket", "top");

		const shouldCompare = targetPiece => piece.group === undefined || piece.group === null || piece.group !== targetPiece.group;

		if(hasRightConnector){
			const targetPiece = this.pieces.find(p => p.id === piece.id + 1);
			if(shouldCompare(targetPiece)){
				const thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(piece, "right");
				const targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetPiece, "left");

				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					return "right";
				}
			}
		}

		if(hasBottomConnector){
			const targetPiece = this.pieces.find(p => p.id === piece.id + this.config.piecesPerSideHorizontal);

			if(shouldCompare(targetPiece)){
				const thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(piece, "bottom");
				const targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetPiece, "top");

				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
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
					return "left";
				}
			}
		}

		if(hasTopConnector){
			const targetPiece = this.pieces.find(p => p.id === piece.id - this.config.piecesPerSideHorizontal);

			if(shouldCompare(targetPiece)){
				const thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(piece, "top");
				const targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetPiece, "bottom");

				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					return "top";
				}
			}
		}

		const pieceBoundingBox = this.getPieceBoundingBox(piece);

		if(Utils.isTopLeftCorner(piece)){
			if(this.hasCollision(pieceBoundingBox, this.getTopLeftCornerBoundingBox())){
				return "top-left";
			}
		}
		if(Utils.isTopRightCorner(piece)){
			if(this.hasCollision(pieceBoundingBox, this.getTopRightCornerBoundingBox())){
				return "top-right";
			}
		}
		if(Utils.isBottomRightCorner(piece)){
			if(this.hasCollision(pieceBoundingBox, this.getBottomRightCornerBoundingBox())){
				return "bottom-right";
			}
		}
		if(Utils.isBottomLeftCorner(piece)){
			if(this.hasCollision(pieceBoundingBox, this.getBottomLeftCornerBoundingBox())){
				return "bottom-left";
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

				newPos.left = connectingPiece.pageX - thisPiece.imgW + this.config.connectorSize;
				el.style.left = Math.ceil(newPos.left) + "px";

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

				newPos.left = connectingPiece.pageX + connectingPiece.imgW - this.config.connectorSize;
				el.style.left = Math.ceil(newPos.left) + "px";

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
				connectingPiece = this.getPieceById(thisPiece.id + this.config.piecesPerSideHorizontal);

				newPos.top = connectingPiece.pageY - thisPiece.imgH + this.config.connectorSize;
				el.style.top = Math.ceil(newPos.top) + "px";

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
				connectingPiece = this.getPieceById(thisPiece.id - this.config.piecesPerSideHorizontal);
				const connectingEl = this.getElementByPieceId(connectingPiece.id);

				newPos.top = connectingEl.offsetTop + connectingEl.height - this.config.connectorSize;
				el.style.top = Math.ceil(newPos.top) + "px";

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

			case "top-left":
				newPos.top = this.config.boardBoundary;
				newPos.left = this.config.boardBoundary;
				el.style.top = newPos.top + "px";
				el.style.left = newPos.left + "px";
				break;
			case "top-right":
				newPos.top = this.config.boardBoundary;
				newPos.left = this.canvasWidth - this.config.boardBoundary - thisPiece.imgW;
				el.style.top = newPos.top + "px";
				el.style.left = newPos.left + "px";
				break;
			case "bottom-right":
				newPos.top = this.canvasHeight - this.config.boardBoundary - thisPiece.imgH;
				newPos.left = this.canvasWidth - this.config.boardBoundary - thisPiece.imgW;
				el.style.top = newPos.top + "px";
				el.style.left = newPos.left + "px";
				break;
			case "bottom-left":
				newPos.top = this.canvasHeight - this.config.boardBoundary - thisPiece.imgH;
				newPos.left = this.config.boardBoundary;
				el.style.top = newPos.top + "px";
				el.style.left = newPos.left + "px";
				break;
		}
		
		this.updatePiecePosition(el);
		this.group(thisPiece, connectingPiece);

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

	isNumber(val){
		return val !== undefined && val !== null && Number.isInteger(val);
	}

	group(pieceA, pieceB){
		if(!pieceB) return;
		if(!this.isNumber(pieceA.group) && !this.isNumber(pieceB.group)){
			this.createGroup(pieceA, pieceB);
		} else if(pieceA.group > -1 && !this.isNumber(pieceB.group)){
			this.addToGroup(pieceB, pieceA.group)
		} else if(!this.isNumber(pieceA.group) && pieceB.group > -1){
			this.addToGroup(pieceA, pieceB.group)
		} else {
			this.mergeGroups(pieceA, pieceB)
		}
	}

	incrementGroupCounter(){
		return fetch(`/api/puzzle/${this.puzzleId}`, {
			method: 'put',
			headers: {
				'Content-Type': 'Application/json'
			},
			body: JSON.stringify({
				groupCounter: this.groupCounter
			})
		})
	}

	createGroup(pieceA, pieceB){
		const groupId = this.groupCounter++;
		this.pieces = this.pieces.map(p => {
			if(p.id === pieceA.id || p.id === pieceB.id){
				const update = {
					...p,
					group: groupId
				}
				if(p.id === pieceA && pieceB.isSolved){
					update.isSolved = true;
				}
				return update;
			}
			return p;
		})

		const elA = this.getElementByPieceId(pieceA.id);
		elA.style.zIndex = 10;
		const elB = this.getElementByPieceId(pieceB.id);
		elB.style.zIndex = 10;

		this.setElementAttribute(this.getElementByPieceId(pieceA.id), "data-group", groupId)
		this.setElementAttribute(this.getElementByPieceId(pieceB.id), "data-group", groupId)
		this.incrementGroupCounter()
	}

	addToGroup(piece, group){
		const otherPiecesInFormerGroup = this.pieces.filter(p => p.id !== piece.id && piece.group !== undefined && piece.group !== null && p.group === piece.group);

		this.pieces = this.pieces.map(p => {
			let update;
			if(p.id === piece.id){
				update = {
					...p,
					group,
				}

				this.setElementAttribute(this.getElementByPieceId(piece.id), "data-group", group)

				if(this.isGroupSolved(group)){
					update.isSolved = true;
					this.setElementAttribute(this.getElementByPieceId(piece.id), "data-is-solved", true)
				}
				return update;
			}
			return p;
		});

		if(piece.isSolved){
			const piecesInGroup = this.pieces.filter(p => p.group === group);
			this.markAsSolved(piecesInGroup)
		}

		if(otherPiecesInFormerGroup.length > 0){
			this.addPiecesToGroup(otherPiecesInFormerGroup, group)
		}
	}
	
	mergeGroups(pieceA, pieceB){
		const piecesInGroupA = this.pieces.filter(p => p.group === pieceA.group);
		const piecesInGroupB = this.pieces.filter(p => p.group === pieceB.group);
		if(piecesInGroupA.length > piecesInGroupB.length){
			this.addPiecesToGroup(piecesInGroupB, pieceA.group);
		} else {
			this.addPiecesToGroup(piecesInGroupA, pieceB.group);
		}
	}

	isGroupSolved(group){
		return this.pieces.some(p => p.group === group && p.isSolved);
	}

	addPiecesToGroup(pieces, group){
		const pieceIds = pieces.map(p => p.id);
		const newGroupPieceIds = this.pieces.filter(p => p.group === group).map(p => p.id);
		const isThisGroupSolved = this.isGroupSolved(group);
		const isFormerGroupSolved = this.isGroupSolved(pieces[0].group)
		this.pieces = this.pieces.map(p => {
			if(pieceIds.includes(p.id) || newGroupPieceIds.includes(p.id)){
				let update = {
					...p,
					group,
				}
				if(isThisGroupSolved || isFormerGroupSolved){
					update.isSolved = true;
				}
				this.setElementAttribute(this.getElementByPieceId(p.id), "data-group", group)
				this.setElementAttribute(this.getElementByPieceId(p.id), "data-is-solved", true)

				return update;
			}
			return p;
		})
	}

	initiFullImagePreviewer(){
		this.fullImageViewerEl.style.left = this.boardBoundingBox.left + "px";
		this.fullImageViewerEl.style.top = this.boardBoundingBox.top + "px";
		this.fullImageViewerEl.setAttribute('width', this.config.selectedWidth);
		this.fullImageViewerEl.setAttribute('height', this.config.selectedWidth);
		const previewctx = this.fullImageViewerEl.getContext('2d');
		previewctx.drawImage(
			this.SourceImage, 
			this.config.selectedOffsetX,
			this.config.selectedOffsetY,
			Math.round(this.config.selectedWidth),
			Math.round(this.config.selectedWidth),
			0,
			0, 
			Math.round(this.config.selectedWidth), 
			Math.round(this.config.selectedWidth)
		)
	}

	checkCompletion(){
		return this.pieces.filter(p => p.isSolved).length === this.pieces.length;
	}

	getPieceDataForPersistence(piece){
		return {
			puzzleId: this.puzzleId,
			shapeId: piece.shapeId,
			id: piece.id,
			_id: piece._id,
			imgX: piece.imgX,
			imgY: piece.imgY,
			imgW: piece.imgW,
			imgH: piece.imgH,
			pageX: piece.pageX,
			pageY: piece.pageY,
			type: piece.type,
			group: piece.group,
			connectsTo: piece.connectsTo,
			isSolved: piece.isSolved,
			isInnerPiece: piece.isInnerPiece,
		}
	}

	async save(pieces){
		const payload = pieces.map( p => this.getPieceDataForPersistence(p))
		fetch(`/api/puzzle/${this.puzzleId}`, {
			method: 'put',
			headers: {
				'Content-Type': 'Application/json'
			},
			body: JSON.stringify(payload)
		})
	}

	async saveInnerPieceVisibility(visible){
		fetch(`/api/toggleVisibility/${this.puzzleId}`, {
			method: 'put',
			headers: {
				'Content-Type': 'Application/json'
			},
			body: JSON.stringify({piecesVisible: visible})
		})
	}
}

export default Puzzly;
