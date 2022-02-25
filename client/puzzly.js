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

const puzzleSetupEl = document.querySelector('#puzzle-setup');
const imageUploadCtrlEl = document.querySelector('#puzzle-setup--image_input');
const puzzleSetupCtrlEl = document.querySelector('#puzzle-setup-ctrl');
const imagePreviewEl = document.querySelector('#puzzle-setup--image_preview');

var imageUpload = document.querySelector('#upload');
var newPuzzleForm = document.querySelector('#form-container');
var imageCrop = document.querySelector('#image-crop');
var startBtn = document.querySelector('#start-btn');
var startDebugBtn = document.querySelector('#start-debug-btn');


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

startBtn.addEventListener('click', function(e){
	e.preventDefault();
	createPuzzle();
});

startDebugBtn.addEventListener('click', function(e){
	e.preventDefault();
	createPuzzle({isDebug: true});
});

function onUploadSuccess(response){
	imageUploadCtrlEl.style.display = "none";

	imageCrop.style.display = "block";

	imagePreviewEl.style.display = "flex";
	
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
	imagePreviewEl.style.display = 'flex';
	PuzzlyCreator.puzzleSetup.sourceImage.path = uploadPath;
	PuzzlyCreator.puzzleSetup.sourceImage.dimensions = response.data.dimensions;
}

function onUploadFailure(response){
	//todo
	const errorTextEl = document.createElement('p');
	errorTextEl.innerHTML = response.toString();
	puzzleSetupEl.appendChild(errorTextEl)
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

function createPuzzle(opts = {}){
	const puzzleConfig = {
		...PuzzlyCreator.puzzleSetup,
		debug: opts.isDebug || false,
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

class Puzzly {
	constructor(canvasId, puzzleId, config, progress = []){
		console.log(progress)
		this.config = {
			debug: true,
			boardBoundary: 800,
			drawBoundingBox: false,
			showDebugInfo: false,
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

		this.isMobile = isMobile();

		this.pieceSectors = [];
		this.usedPieceSectors = [];
		this.sectors = {};

		this.collisionTolerance = 30;

		this.isMovingSinglePiece = false;
		this.movingElement = null;
		this.pieces = [];
		this.puzzleId = puzzleId;
		this.progress = progress;
		
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
		
		this.soundsBtn = document.getElementById('sound-toggle');
		this.soundsBtnOnLabel = document.getElementById('sounds-on');
		this.soundsBtnOffLabel = document.getElementById('sounds-off');
		this.debugInfoWindow = document.getElementById('debug-info');

		this.sendToEdgeShuffleBtn = document.getElementById('shuffle-pieces');
		this.sendToEdgeNeatenBtn = document.getElementById('neaten-pieces');

		this.sendToEdgeShuffleBtn.addEventListener('click', e => {
			this.shuffleArray(this.pieces.filter(p => !p.isSolved && !Utils.hasGroup(p)));
			this.randomisePiecePositions(pieces);
			console.log(this.pieces)
			this.save(this.pieces);
		})

		this.sendToEdgeNeatenBtn.addEventListener('click', e => {
			let pieces = this.shuffleArray(this.pieces.filter(p => !p.isSolved && !Utils.hasGroup(p)));
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

		this.previewBtn.addEventListener('click', this.togglePreviewer.bind(this))
		this.filterBtn.addEventListener('click', this.toggleInnerPieces.bind(this))
		this.soundsBtn.addEventListener('click', this.toggleSounds.bind(this))

		if(this.config.showDebugInfo){
			this.displayElement(this.debugInfoWindow)
		}

		const assets = [
			this.SourceImage,
			this.JigsawSprite,
		];

		this.loadAssets(assets).then( () => {
			this.init()
		})
	}

	debugWindowAddRow(label, readoutElementId){
		const row = document.createElement('div');
		row.classList.add('debug-info-row');
		row.classList.add('group');
		const rowLabelEl = document.createElement('div');
		rowLabelEl.classList.add('label');
		const rowLabelText = label + ':';
		rowLabelEl.innerText = rowLabelText;
		const rowReadoutEl = document.createElement('div');
		rowReadoutEl.classList.add('readout');
		const readoutId = `debug-readout--${readoutElementId}`;
		rowReadoutEl.setAttribute('id', readoutId);
		row.appendChild(rowLabelEl)
		row.appendChild(rowReadoutEl)
		this.debugInfoRows[readoutElementId] = rowReadoutEl;
		this.debugInfoWindow.appendChild(row)
	}

	debugInfoSetReadout(el, content){
		if(this.config.showDebugInfo){
			el.innerHTML = content;
		}
	}

	debugInfoClearReadout(id){
		this.debugInfoRows[id].innerHTML = '';
	}
	
	debugWindowInitialise(){
		this.debugInfoRows = [];
		this.debugWindowAddRow('Dragged element', 'draggedEl');
		this.debugWindowAddRow('Dragged element container', 'draggedElContainer');
		this.debugWindowAddRow('Dragged element top container', 'draggedElTopContainer');
		this.debugWindowAddRow('Target element', 'targetEl');
		this.debugWindowAddRow('Target element container', 'targetElContainer');
		this.debugWindowAddRow('Target element top container', 'targetElTopContainer');
		this.debugWindowAddRow('Last connection', 'lastConnection');
		this.config.debugInfoRows = this.debugInfoRows;
	}

	displayElement(el, cssDisplayType = 'block'){
		el.style.display = cssDisplayType;
	}

	toggleSounds(){
		this.soundsEnabled = this.soundsEnabled ? false : true;
		this.soundsBtnOffLabel.style.display = this.soundsEnabled ? 'block' : 'none';
		this.soundsBtnOnLabel.style.display = this.soundsEnabled ? 'none' : 'block';
	}

	updatePreviewerSizeAndPosition(){
		this.fullImageViewerEl.style.left = this.config.boardBoundary * this.zoomLevel + 'px';
		this.fullImageViewerEl.style.top = this.config.boardBoundary * this.zoomLevel + 'px';
		this.fullImageViewerEl.style.width = this.config.selectedWidth * this.zoomLevel + 'px';
		this.fullImageViewerEl.style.height = this.config.selectedWidth * this.zoomLevel + 'px';
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

	showPiece(piece){
		const el = this.getElementByPieceId(piece.id)
		el.style.display = 'block';
		// el.style.zIndex = '100';
		piece.isVisible = true;
		return piece;
	}
	
	hidePiece(piece){
		const el = this.getElementByPieceId(piece.id)
		el.style.display = 'none';
		// el.style.zIndex = '-1';
		piece.isVisible = false;
		return piece;
	}

	toggleInnerPieces(){
		if(this.innerPiecesVisible){
			this.pieces = this.pieces.map(p => {
				if(Utils.isInnerPiece(p) && !p.isSolved && !p.group){
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

		this.zoomLevel = 1;

		this.config.pieceSize = Math.ceil(this.config.pieceSize)
		this.config.connectorDistanceFromCornerRatio = this.config.connectorRatio = 33;
		this.config.connectorSize = Math.ceil(this.config.pieceSize / 100 * this.config.connectorRatio);
		this.config.connectorTolerance = this.config.connectorSize / 100 * (50 - this.collisionTolerance / 2);

		this.config.connectorDistanceFromCorner = Math.ceil(this.config.pieceSize / 100 * this.config.connectorDistanceFromCornerRatio);

		this.largestPieceSpan = this.config.pieceSize + (this.config.connectorSize * 2);
		this.boardBoundingBox = {
			top: this.config.boardBoundary * this.zoomLevel,
			right: this.config.boardBoundary + (this.config.piecesPerSideHorizontal * this.config.pieceSize),
			left: this.config.boardBoundary * this.zoomLevel,
			bottom: this.config.boardBoundary + (this.config.piecesPerSideVertical * this.config.pieceSize),
			width: this.config.boardBoundary * this.zoomLevel + this.config.boardBoundary + (this.config.piecesPerSideHorizontal * this.config.pieceSize),
			height: this.config.boardBoundary * this.zoomLevel + this.config.boardBoundary + (this.config.piecesPerSideVertical * this.config.pieceSize),
		};

		this.boardSize = {
			width: this.config.piecesPerSideHorizontal * this.config.pieceSize,
			height: this.config.piecesPerSideVertical * this.config.pieceSize,
		}
	
		this.canvas.style.width = this.boardSize.width + (this.config.boardBoundary * 2) + "px";
		this.canvas.style.height = this.boardSize.height + (this.config.boardBoundary * 2) + "px";

		this.canvasWidth = parseInt(this.canvas.style.width);
		this.canvasHeight = parseInt(this.canvas.style.height);

		// this.drawBackground();
		this.drawBoardArea();
		this.boardAreaEl = document.getElementById('board-area');

		this.initiFullImagePreviewer();
		this.isFullImageViewerActive = false;
		
		if(this.progress.length > 0){
			this.pieces = this.progress;
			this.pieces.map(p => this.drawPieceManually(p))
			this.initGroupContainerPositions()
		} else {
			this.generatePieceSectorMap();
			this.piecePositionMap = this.shuffleArray(this.getRandomCoordsFromSectorMap());
			this.makePieces();
			this.save(this.allPieces())
		}

		// this.wrapPiecesAroundBoard();
		// this.arrangePieces()
		this.timeStarted = new Date().getTime();

		addEventListener("beforeunload", function(e) {
			this.updateElapsedTime();
		}.bind(this))
		
		this.innerPieces = document.querySelectorAll('.inner-piece');

		window.addEventListener(isMobile() ? 'touchstart' : 'mousedown', (e) => {
			this.onMouseDown(e);
		});

		this.debugWindowInitialise();



		window.addEventListener('mouseup', this.onMouseUp.bind(this));

		// window.addEventListener('keydown', this.onKeyDown.bind(this))
	}
	
	onKeyDown(event){
		// https://stackoverflow.com/questions/995914/catch-browsers-zoom-event-in-javascript
	
		// 107 Num Key  +
		// 109 Num Key  -
		// 173 Min Key  hyphen/underscore key
		// 61 Plus key  +/= key
		if ((event.ctrlKey || event.metaKey) && (event.which === 61 || event.which === 107 || event.which === 173 || event.which === 109  || event.which === 187  || event.which === 189 || event.which === 48) ) {
			event.preventDefault();
			if(event.which === 187){
				this.zoomLevel += .1;
			}
			if(event.which === 189){
				this.zoomLevel -= .1;
			}
			
			if(event.which === 48){
				this.zoomLevel = 1;
			}
			
			if(this.isPreviewActive){
				this.updatePreviewerSizeAndPosition();
			}
	
			this.canvas.style.transform = `scale(${this.zoomLevel})`;
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

	drawPieceManually(piece){
		if(Number.isNaN(piece.id) || piece.id === "null"){
			return;
		}

		const pieceContainer = document.createElement('div');
		pieceContainer.classList.add('puzzle-piece')
		pieceContainer.style.left = piece.pageX + "px";
		pieceContainer.style.top = piece.pageY + "px";
		pieceContainer.style.position = "absolute";
		pieceContainer.style.zIndex = 3;

		pieceContainer.style.width = piece.imgW + "px";
		pieceContainer.style.height = piece.imgH + 'px';
		pieceContainer.width = piece.imgW;
		pieceContainer.height = piece.imgH;

		pieceContainer.setAttribute('data-jigsaw-type', piece.type.join(","))
		pieceContainer.setAttribute('data-piece-id', piece.id)
		pieceContainer.setAttribute('data-puzzle-id', piece.puzzleId)
		pieceContainer.setAttribute('data-imgX', piece.imgX)
		pieceContainer.setAttribute('data-imgy', piece.imgY)
		pieceContainer.setAttribute('data-imgW', piece.imgW)
		pieceContainer.setAttribute('data-imgH', piece.imgH)
		pieceContainer.setAttribute('data-is-inner-piece', piece.isInnerPiece)
		pieceContainer.setAttribute('data-num-pieces-from-top-edge', piece.numPiecesFromTopEdge)
		pieceContainer.setAttribute('data-num-pieces-from-left-edge', piece.numPiecesFromLeftEdge)

		if(piece.group){
			pieceContainer.setAttribute('data-group', piece.group)
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

		const el = document.createElement("canvas");
		const ctx = el.getContext("2d");
		el.style.position = "absolute";
		el.style.top = 0;
		el.style.left = 0;
		el.className = "puzzle-piece-canvas";
		el.style.zIndex = 1;

		if(piece.isInnerPiece){
			pieceContainer.className += " inner-piece";
			if(!this.innerPiecesVisible){
				pieceContainer.style.display = 'none';
			}
		}

		el.style.width = piece.imgW + "px";
		el.style.height = piece.imgH + 'px';
		el.width = piece.imgW;
		el.height = piece.imgH;

		pieceContainer.appendChild(el);

		if(Utils.hasGroup(piece)){
			let groupContainer = document.querySelector(`#group-${piece.group}`);
			if(!groupContainer){
				groupContainer = document.createElement('div');
				groupContainer.classList.add('group-container');
				groupContainer.setAttribute('id', `group-${piece.group}`);
				groupContainer.style.width = this.getPxString(piece.imgW);
				groupContainer.style.height = this.getPxString(piece.imgH);
			}
			pieceContainer.style.top = this.getPxString(piece.pageY);
			pieceContainer.style.left = this.getPxString(piece.pageX);

			groupContainer.append(pieceContainer);
			this.setPiecePositionsWithinContainer(pieceContainer);

			if(piece.isSolved && !this.getDataAttributeValue(groupContainer, 'data-is-solved')){
				this.setElementAttribute(groupContainer, 'data-is-solved', true);
			}

			this.canvas.appendChild(groupContainer);
		} else {
			this.canvas.appendChild(pieceContainer);
		}

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

		const coverEl = document.createElement('div');
		coverEl.classList.add('puzzle-piece-cover');
		coverEl.style.position = 'absolute';
		coverEl.style.left = '0';
		coverEl.style.top = '0';
		coverEl.style.width = this.getPxString(piece.imgW);
		coverEl.style.height = this.getPxString(piece.imgH);
		coverEl.style.zIndex = 2;
		pieceContainer.appendChild(coverEl);
	}

	initGroupContainerPositions(){
		const groupContainers = document.querySelectorAll('[id^=group-]');
		groupContainers.forEach(container => {
			let id = parseInt(container.getAttribute('id').split('-')[1]);
			let pieces = this.pieces.filter(p => p.group === id);
			let lowestId = Math.min(...pieces.map(p => p.id));
			let topLeftPiece = pieces.find(p => p.id === lowestId);
			container.style.top = this.getPxString(topLeftPiece.containerY);
			container.style.left = this.getPxString(topLeftPiece.containerX);
		})
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

	onMouseDown(e){
		let element, diffX, diffY, thisPiece;

		if(e.which === 1 || this.isMobile){
			const clientPos = this.getClientPos(e);

			if(e.target.classList.contains("puzzle-piece-cover")){
				element = e.target.parentNode;
				thisPiece = this.getPieceFromElement(element, ['piece-id', 'is-solved', 'group']);
				console.log(thisPiece)

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

					if(this.movingElement){
						diffX = clientPos.x - Math.floor(this.movingElement.offsetLeft * this.zoomLevel);
						diffY = clientPos.y - Math.floor(this.movingElement.offsetTop * this.zoomLevel);
					}
				} else {
					this.isMovingSinglePiece = true;
					this.movingElement = this.getElementByPieceId(thisPiece.id);
					diffX = clientPos.x - this.movingElement.offsetLeft * this.zoomLevel;
					diffY = clientPos.y - this.movingElement.offsetTop * this.zoomLevel;					
				}

				this.movingElement.style.zIndex = 10;
			}

			if(e.target.id === "canvas" || e.target.id === "board-area"){
				this.isCanvasMoving = true;
				element = this.canvas;
				this.canvasDiffX = Math.floor(clientPos.x * this.zoomLevel) - Math.floor(element.offsetLeft * this.zoomLevel);
				this.canvasDiffY = Math.floor(clientPos.y * this.zoomLevel) - Math.floor(element.offsetTop * this.zoomLevel);
			}

			this.mouseMoveFunc = this.onMouseMove(diffX, diffY);
			this.isMouseDown = true;

			if(this.isCanvasMoving){
				window.addEventListener('mousemove', this.moveCanvas.bind(this));
			} else {
				window.addEventListener(this.isMobile ? 'touchmove' : 'mousemove', this.mouseMoveFunc);
			}
		}
	}

	getClientPos(e){
		let touches;
		if(this.isMobile){
			touches = e.touches;
		}
		if(this.isMobile && touches.length === 1){
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

	onMouseMove(diffX, diffY){
		return function(e){
			e.preventDefault();
			if(this.isMouseDown){
				// alert(this.movingElement.classList[0])

				// alert('mouse move')
				const clientPos = this.getClientPos(e);
				// alert(`${clientX}, ${clientY}`)
				// alert(`${clientPos.x}, ${clientPos.y}`)
				// alert(`${clientPos.y}, ${this.zoomLevel}, ${diffY}`)
				// alert(clientPos.y / this.zoomLevel)
				// alert((clientPos.y / this.zoomLevel) - (diffY / this.zoomLevel))
				let newPosTop = (clientPos.y / this.zoomLevel) - (diffY / this.zoomLevel);
				let newPosLeft = (clientPos.x / this.zoomLevel) - (diffX / this.zoomLevel);
				// alert(`${newPosLeft}, ${newPosTop}`)
				this.movingElement.style.top = newPosTop + "px";
				this.movingElement.style.left = newPosLeft + "px";
			}
		}.bind(this)
	}

	updatePiecePosition(pId, x, y){
		this.pieces = this.pieces.map(p => {
			if(p.id === pId){
				let update = {
					...p,
					pageX: x,
					pageY: y,
				}

				return update;
			}
			return p;
		})
	}

	updatePiece(pId, ...data){
		this.pieces = this.pieces.map(p => {
			if(p.id === pId){
				let update = {
					...p,
					...data
				}
				return update;
			}
			return p;
		})
	}

	getDataAttributeRaw(el, key){
		return el.getAttribute(`data-${key}`) || undefined;
	}

	getDataAttributeValue(el, key){
		const value = this.getDataAttributeRaw(el, key)
		return value && value !== "undefined" ? value : undefined;
	}

	onMouseUp(e){
		let el;
	
		if(e.target.classList.contains('puzzle-piece-canvas') || e.target.classList.contains('puzzle-piece-cover')){
			el = e.target.parentNode;
		} else if(e.target.classList.contains('puzzle-piece')){
			el = e.target;
		}

		this.isMouseDown = false;
		let pieces;

		if(this.isCanvasMoving){
			this.isCanvasMoving = false;
			this.canvasDiffX = null;
			this.canvasDiffY = null;
		} else if(this.movingElement){
			let hasConnection = false, noneFound = false, connection, i = 0;

			if(!this.isMovingSinglePiece){
				let group = this.getGroup(el);
				const piecesToCheck = this.getCollisionCandidatesInGroup(group);

				while(!hasConnection && !noneFound){
					let p = piecesToCheck[i];
					connection = this.checkConnections(p);
					console.log(connection)
					if(connection){
						// this.debugInfoSetReadout(this.debugInfoRows.lastConnection, connection);

						if(this.soundsEnabled){
							this.clickSound.play();
						}

						this.snapPiece(p, connection);

						const updatedGroup = this.getGroup(p);
						this.updateConnections(updatedGroup);

						if(this.isCornerConnection(connection) || this.shouldMarkAsSolved(p)){
							const piecesInGroup = this.getPiecesInGroup(updatedGroup)
							this.markAsSolved(piecesInGroup);
							if(this.checkCompletion()){
								this.updateElapsedTime(true)
							}
						}

						hasConnection = true;
					} else {
						this.debugInfoSetReadout(this.debugInfoRows.lastConnection, 'None');
					}
	
					if(i === piecesToCheck.length - 1 && !hasConnection){
						noneFound = true;
					}
					
					i++;
				}

				const piecesInCurrentGroup = this.getPiecesInGroup(group);
				const piecesInNewGroup = this.getPiecesInGroup(this.getGroup(el));

				if(hasConnection){
					this.save(piecesInNewGroup);
				} else {
					this.save(piecesInCurrentGroup);
				}
			} else {
				connection = this.checkConnections(el);
				console.log(connection)

				if(connection){
					if(this.soundsEnabled){
						this.clickSound.play();
					}

					this.snapPiece(el, connection);
					this.updateConnections(el);

					if(this.isCornerConnection(connection) && this.shouldMarkAsSolved([el])){
						this.markAsSolved([el]);
						if(this.checkCompletion()){
							this.updateElapsedTime(true)
						}
					}

					if(this.getGroup(el)){
						this.save(this.getPiecesInGroup(this.getGroup(el)))
					} else {
						this.save([el])
					}
				} else {
					this.save([el])
				}

			}

			if(this.movingElement){
				this.movingElement.style.zIndex = 3;
			}

			this.movingElement = null;
			this.movingPieces = [];
			pieces = [];
		}

		window.removeEventListener('mousemove', this.moveCanvas);
		window.removeEventListener('mousemove', this.mouseMoveFunc);
		window.removeEventListener('mouseup', this.onMouseUp);
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

	getAlignmentToPiece(thisPiece, thatPiece){
		const thisId = thisPiece.id;
		const thatId = thatPiece.id;

		if(Utils.isAdjacent(thisPiece.id, thatPiece.id, this.config.piecesPerSideHorizontal)){

		}
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

	shouldMarkAsSolved(pieces){
		if(pieces.length === 1){
			let piece = this.getPieceFromElement(pieces[0], ['jigsaw-type', 'is-solved', 'group']);
			return Utils.isCornerPiece(piece) || this.pieces.filter(p => p.group === pieces[0].group).some(p => Utils.isCornerPiece(p) && p.isSolved)
		} else {
			Array.from(pieces).some(p => {
				let piece = this.getPieceFromElement(p, ['jigsaw-type', 'is-solved']);
				return Utils.isCornerPiece(piece) && piece.isSolved;
			})
		}
	}

	markAsSolved(els){
		let container;
		if(Utils.hasGroup(els[0])){
			container = this.getGroupTopContainer(els[0]);
			this.setElementAttribute(container, 'data-is-solved', true);
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
		var numPiecesFromLeftEdge = 0;
		var numPiecesFromTopEdge = 0;
		var solvedY = boardTop;

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

			currentPiece = this.assignInitialPieceData(curImgX, curImgY, curPageX, curPageY, currentPiece, numPiecesFromLeftEdge, numPiecesFromTopEdge, i);

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

				numPiecesFromLeftEdge = 0;
				numPiecesFromTopEdge++;

				rowCount++;
			} else {
				if(rowCount > 1){
					const nextPieceAbove = this.pieces[this.pieces.length - piecesPerSideHorizontal];

					if(Utils.has(currentPiece, "plug", "top") && Utils.has(nextPieceAbove, "plug", "bottom")){
						curImgY += this.config.connectorSize;
					} else if(Utils.has(currentPiece, "socket", "top") && Utils.has(nextPieceAbove, "socket", "bottom")){
						curImgY -= this.config.connectorSize;
					}
					
					solvedY += Utils.has(nextPieceAbove, 'plug', 'bottom') ? pieceSize : pieceSize - this.config.connectorSize;
				}
				
				if(Utils.has(currentPiece, "socket", "right")){
					curImgX += currentPiece.imgW - this.config.connectorSize;
				} else if(Utils.has(currentPiece, "plug", "right")){
					curImgX += currentPiece.imgW - this.config.connectorSize;
				}

				numPiecesFromLeftEdge ++;
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

	getConnectingPieceIds(el){
		const id = parseInt(this.getDataAttributeValue(el, 'piece-id'));
		const pieceAboveId = id - this.config.piecesPerSideHorizontal;
		const pieceBelowId = id + this.config.piecesPerSideHorizontal;

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
					bottom: this.config.boardBoundary,
					left: this.config.boardBoundary,
				}
			case "top-second-half":
				return {
					top: 0,
					right: this.boardBoundingBox.right,
					bottom: this.config.boardBoundary,
					left: this.config.boardBoundary + this.boardBoundingBox.width / 2,
				}
			case "top-left":
				return {
					top: 0,
					right: this.config.boardBoundary,
					bottom: this.config.boardBoundary,
					left: 0,
				}
			case "right-first-half":
				return {
					top: this.config.boardBoundary,
					right: this.canvasWidth,
					bottom: this.config.boardBoundary + this.boardBoundingBox.height / 2,
					left: this.boardBoundingBox.right,
				}
			case "right-second-half":
				return {
					top: this.config.boardBoundary + this.boardBoundingBox.height / 2,
					right: this.canvasWidth,
					bottom: this.boardBoundingBox.bottom,
					left: this.boardBoundingBox.right,
				}
			case "top-right":
				return {
					top: 0,
					right: this.canvasWidth,
					bottom: this.config.boardBoundary,
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
					top: this.config.boardBoundary + this.boardBoundingBox.height / 2,
					right: this.boardBoundingBox.left,
					bottom: this.boardBoundingBox.bottom,
					left: 0,
				}
			case "left-second-half":
				return {
					top: this.config.boardBoundary,
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
		const totalArea = ((this.canvasWidth * this.canvasHeight) - (this.boardSize.width * this.boardSize.height));
		const pieceSectorSize = totalArea / this.config.selectedNumPieces;

		const sqr = Math.abs(Math.sqrt(pieceSectorSize));
		const area = {w: sqr, h: sqr};

		const quadrants = [
			{x:0,y:0,w:this.canvasWidth,h:this.config.boardBoundary},
			{x:0,y:this.config.boardBoundary,w:this.config.boardBoundary,h:this.boardSize.height},
			{x:this.config.boardBoundary + this.boardSize.width,y:this.config.boardBoundary,w:this.config.boardBoundary,h:this.boardSize.height},
			{x:0,y:this.config.boardBoundary + this.boardSize.height,w:this.canvasWidth,h:this.config.boardBoundary},
		];

		let quad = 0;
		let currentQuadrant = quadrants[quad];
		let xPos = currentQuadrant.x, yPos = currentQuadrant.y;
		let thisSector;
		
		for(let i=0, n=this.config.selectedNumPieces; i<n; i++){
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
		// console.log('renderPiecesAlongEdge', side, pieces, depth)
		console.log('renderPiecesAlongEdge', pieces)
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

					if(edge >= this.config.boardBoundary + this.boardSize.width){
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

					if(edge > this.config.boardBoundary + this.boardSize.height){
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

					if(edge < this.config.boardBoundary - el.offsetWidth){
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

	getRandomPositionOutsideBoardArea(sector){
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

	assignInitialPieceData(imgX, imgY, canvX, canvY, piece, numPiecesFromLeftEdge, numPiecesFromTopEdge, i){
		const pieceDimensions = this.getPieceWidthAndHeightWithConnectors(piece);
		const pos = this.piecePositionMap[i];
		return Object.assign({
			puzzleId: this.puzzleId,
			id: i,
			imgX: imgX,
			imgY: imgY,
			imgW: pieceDimensions.width,
			imgH: pieceDimensions.height,
			pageX: this.config.debug ? canvX : pos.x,
			pageY: this.config.debug ? canvY : pos.y,
			isInnerPiece: Utils.isInnerPiece(piece),
			isVisible: true,
			connections: [],
			numPiecesFromLeftEdge,
			numPiecesFromTopEdge,
		}, piece);
	}

	assignPieceConnections(){
		this.allPieces().forEach(p => {
			this.setElementAttribute(p, 'data-connects-to', JSON.stringify(this.getConnectingPieceIds(p)))
		});
	}

	getConnectorBoundingBox(element, side){
		const piece = this.getPieceByElement(element);
		const hasLeftPlug = Utils.has(piece, "plug", "left");
		const hasTopPlug = Utils.has(piece, "plug", "top");
		const tolerance = this.config.connectorTolerance;
		switch(side){
			case "left":
				return {
					top: element.offsetTop + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
					right: element.offsetLeft + this.config.connectorSize - tolerance,
					bottom: element.offsetTop + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					left: element.offsetLeft + tolerance,
				}
			case "right":
				return {
					top: element.offsetTop + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
					right: element.offsetLeft + element.offsetWidth - tolerance,
					bottom: element.offsetTop + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					left: element.offsetLeft + element.offsetWidth - this.config.connectorSize + tolerance,
				}
			case "bottom":
				return {
					top: element.offsetTop + element.offsetHeight - this.config.connectorSize + tolerance,
					right: element.offsetLeft + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					bottom: element.offsetTop + element.offsetHeight - tolerance,
					left: element.offsetLeft + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
				}
			case "top":
				return {
					top: element.offsetTop + tolerance,
					right: element.offsetLeft + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					bottom: element.offsetTop + this.config.connectorSize - tolerance,
					left: element.offsetLeft + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
				}
		}
	}

	getSolvedConnectorBoundingBox(piece, side){
		const solvedBB = this.getPieceSolvedBoundingBox(piece)
		const hasLeftPlug = Utils.has(piece, "plug", "left");
		const hasTopPlug = Utils.has(piece, "plug", "top");
		const tolerance = this.config.connectorTolerance;
		switch(side){
			case "left":
				return {
					top: solvedBB.top + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
					right: solvedBB.left + this.config.connectorSize - tolerance,
					bottom: solvedBB.top + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					left: solvedBB.left + tolerance,
				}
			case "right":
				return {
					top: solvedBB.top + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
					right: solvedBB.right - tolerance,
					bottom: solvedBB.top + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					left: solvedBB.right - this.config.connectorSize + tolerance,
				}
			case "bottom":
				return {
					top: solvedBB.bottom - this.config.connectorSize + tolerance,
					right: solvedBB.left + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					bottom: solvedBB.bottom - tolerance,
					left: solvedBB.left + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
				}
			case "top":
				return {
					top: solvedBB.top + tolerance,
					right: solvedBB.left + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					bottom: solvedBB.top + this.config.connectorSize - tolerance,
					left: solvedBB.left + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
				}
		}
	}

	getTopLeftCornerBoundingBox(){
		return {
			top: this.config.boardBoundary,
			right: this.config.boardBoundary + this.config.connectorTolerance,
			bottom: this.config.boardBoundary + this.config.connectorTolerance,
			left: this.config.boardBoundary,
		}
	}

	getTopRightCornerBoundingBox(){
		return {
			top: this.config.boardBoundary,
			right: this.canvasWidth - this.config.boardBoundary,
			bottom: this.config.boardBoundary + this.config.connectorTolerance,
			left: this.canvasWidth - this.config.boardBoundary - this.config.connectorTolerance,
		}
	}

	getBottomRightCornerBoundingBox(){
		return {
			top: this.canvasHeight - this.config.boardBoundary - this.config.connectorTolerance,
			right: this.canvasWidth - this.config.boardBoundary,
			bottom: this.canvasHeight - this.config.boardBoundary,
			left: this.canvasWidth - this.config.boardBoundary - this.config.connectorTolerance,
		}
	}

	getBottomLeftCornerBoundingBox(){
		return {
			top: this.canvasHeight - this.config.boardBoundary - this.config.connectorTolerance,
			right: this.config.boardBoundary + this.config.connectorTolerance,
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

	getGroupContainer(arg){
		if(typeof arg === 'number'){
			return document.getElementById(`group-${arg}`);
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
			const p = {
				type: this.getDataAttributeValue(piece, 'jigsaw-type').split(','),
				isSolved: this.getDataAttributeValue(piece, 'is-solved'),
				connections: this.getConnections(piece),
			};
			if(Utils.isInnerPiece(p) && p.connections.length < 4){
				candidates.push(piece)
			}
			if(Utils.isSidePiece(p) && p.connections.length < 3){
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
			// console.log('recurse', el)
			if(el.classList.contains('subgroup') || el.classList.contains('puzzle-piece')){
				// console.log('adding offsets for', el)
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
		const elPositionWithinContainer = {
			top: parseInt(this.getDataAttributeValue(element, 'position-within-container-top')),
			left: parseInt(this.getDataAttributeValue(element, 'position-within-container-left')),
		};

		const piece = this.getPieceFromElement(element, ['jigsaw-type'])

		const hasLeftPlug = Utils.has(piece, "plug", "left");
		const hasTopPlug = Utils.has(piece, "plug", "top");
		const tolerance = this.config.connectorTolerance;

		switch(connector){
			case 'right':
				return {
					top: containerBoundingBox.top + elPositionWithinContainer.top + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
					right: containerBoundingBox.left + elPositionWithinContainer.left + element.offsetWidth - tolerance,
					bottom: containerBoundingBox.top + elPositionWithinContainer.top + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					left: containerBoundingBox.left + elPositionWithinContainer.left + element.offsetWidth - this.config.connectorSize + tolerance
				}
	
			case 'bottom':
				return {
					top: containerBoundingBox.top + elPositionWithinContainer.top + element.offsetHeight - this.config.connectorSize + tolerance,
					right: containerBoundingBox.left + elPositionWithinContainer.left + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					bottom: containerBoundingBox.top + elPositionWithinContainer.top + element.offsetHeight - tolerance,
					left: containerBoundingBox.left + elPositionWithinContainer.left + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
				}
	
			case 'left':
				return {
					top: containerBoundingBox.top + elPositionWithinContainer.top + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance,
					right: containerBoundingBox.left + elPositionWithinContainer.left + this.config.connectorSize - tolerance,
					bottom: containerBoundingBox.top + elPositionWithinContainer.top + (hasTopPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					left: containerBoundingBox.left + elPositionWithinContainer.left + tolerance
				}
	
			case 'top':
				return {
					top: containerBoundingBox.top + elPositionWithinContainer.top + tolerance,
					right: containerBoundingBox.left + elPositionWithinContainer.left + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + this.config.connectorSize - tolerance,
					bottom: containerBoundingBox.top + elPositionWithinContainer.top + this.config.connectorSize - tolerance,
					left: containerBoundingBox.left + elPositionWithinContainer.left + (hasLeftPlug ? this.config.connectorDistanceFromCorner + this.config.connectorSize : this.config.connectorDistanceFromCorner) + tolerance
				}
		}
	}

	getTrueBoundingBox(el){
		const bodyRect = document.body.getBoundingClientRect();
		const elRect = el.getBoundingClientRect();
		const normalisedTop = Math.abs(bodyRect.top);
		const normalisedLeft = Math.abs(bodyRect.left);
		return {
			top: normalisedTop + elRect.top,
			right: normalisedLeft + elRect.right,
			bottom: normalisedTop + elRect.bottom,
			left: normalisedLeft + elRect.left,
			width: elRect.width,
			height: elRect.height,
		};
	}

	getSubContainerBoundingBox(container){
		return {
			top: container.offsetTop,
			right: container.offsetLeft + container.offsetWidth,
			bottom: container.offsetTop + container.offsetHeight,
			left: container.offsetLeft
		}
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

	getPieceSolvedBoundingBox(piece){
		let el = this.getElementByPieceId(piece.id);
		let gridPosX = piece.numPiecesFromLeftEdge === 0 ? this.config.boardBoundary : this.config.boardBoundary + this.config.pieceSize * piece.numPiecesFromLeftEdge;
		let gridPosY = piece.numPiecesFromTopEdge === 0 ? this.config.boardBoundary : this.config.boardBoundary + this.config.pieceSize * piece.numPiecesFromTopEdge;
		return {
			top: (Utils.has(piece, 'plug', 'top') ? gridPosY - this.config.connectorSize : gridPosY),
			right: (Utils.has(piece, 'plug', 'left') ? gridPosX - this.config.connectorSize : gridPosX) + el.offsetWidth,
			bottom: (Utils.has(piece, 'plug', 'top') ? gridPosY - this.config.connectorSize : gridPosY) + el.offsetHeight,
			left: (Utils.has(piece, 'plug', 'left') ? gridPosX - this.config.connectorSize : gridPosX)
		}
	}

	checkConnections(element){
		let containerBoundingBox, targetElement, targetPiece, thisPieceConnectorBoundingBox, solvedPieceConnectorBoundingBox;
	
		let connections = this.getDataAttributeValue(element, 'connections');
		connections = connections || [];

		const piece = {
			id: parseInt(this.getDataAttributeValue(element, 'piece-id')),
			group: this.getGroup(element),
			isSolved: this.getDataAttributeValue(element, 'is-solved'),
			type: this.getType(element),
			connections,
		}
		
		// console.log(element)
		// console.log(piece)

		const hasRightConnector = Utils.has(piece, "plug", "right") || Utils.has(piece, "socket", "right");
		const hasBottomConnector = Utils.has(piece, "plug", "bottom") || Utils.has(piece, "socket", "bottom");
		const hasLeftConnector = Utils.has(piece, "plug", "left") || Utils.has(piece, "socket", "left");
		const hasTopConnector = Utils.has(piece, "plug", "top") || Utils.has(piece, "socket", "top");

		const shouldCompare = targetPiece => piece.group === undefined || piece.group === null || piece.group !== targetPiece.group;

		let elBoundingBox = this.getTrueBoundingBox(element);
		let elBBWithinTolerance = {};

		if(Utils.isTopLeftCorner(piece)){
			elBBWithinTolerance = elBoundingBox;
			elBBWithinTolerance.right = elBoundingBox.left + this.config.connectorTolerance;
			elBBWithinTolerance.bottom = elBoundingBox.top + this.config.connectorTolerance;
			if(this.hasCollision(elBBWithinTolerance, this.getTopLeftCornerBoundingBox())){
				return "top-left";
			}
		}
		if(Utils.isTopRightCorner(piece)){
			elBBWithinTolerance = elBoundingBox;
			elBBWithinTolerance.left = elBoundingBox.right - this.config.connectorTolerance;
			elBBWithinTolerance.bottom = elBoundingBox.top + this.config.connectorTolerance;
			if(this.hasCollision(elBoundingBox, this.getTopRightCornerBoundingBox())){
				return "top-right";
			}
		}
		if(Utils.isBottomRightCorner(piece)){
			elBBWithinTolerance = elBoundingBox;
			elBBWithinTolerance.left = elBoundingBox.right - this.config.connectorTolerance;
			elBBWithinTolerance.top = elBoundingBox.bottom - this.config.connectorTolerance;
			if(this.hasCollision(elBoundingBox, this.getBottomRightCornerBoundingBox())){
				return "bottom-right";
			}
		}
		if(Utils.isBottomLeftCorner(piece)){
			elBBWithinTolerance = elBoundingBox;
			elBBWithinTolerance.right = elBoundingBox.left + this.config.connectorTolerance;
			elBBWithinTolerance.top = elBoundingBox.bottom - this.config.connectorTolerance;
			if(this.hasCollision(elBoundingBox, this.getBottomLeftCornerBoundingBox())){
				return "bottom-left";
			}
		}

		if(hasRightConnector && !piece.connections.includes('right')){
			targetElement = this.getElementByPieceId(piece.id + 1)
			targetPiece = this.getPieceFromElement(targetElement, ['piece-id', 'group', 'is-solved', 'jigsaw-type'])

			if(shouldCompare(targetPiece)){
				if(Utils.hasGroup(piece)){
					let container = this.getGroupTopContainer(element);
					containerBoundingBox = this.getTrueBoundingBox(container);
					thisPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(element, 'right', containerBoundingBox);
				} else {
					thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(element, "right");
				}

				let targetContainer, targetPieceConnectorBoundingBox, targetContainerBoundingBox;

				if(Utils.hasGroup(targetPiece)){
					targetContainer = this.getGroupTopContainer(targetElement);
					targetContainerBoundingBox = this.getTrueBoundingBox(targetContainer);
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(targetElement, "left", targetContainerBoundingBox);
				} else {
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetElement, "left");
				}
				// We aren't targeting an adjacent piece for a floating connection
				solvedPieceConnectorBoundingBox = this.getSolvedConnectorBoundingBox(piece, "right");
				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					return "right";
				} else if(this.hasCollision(thisPieceConnectorBoundingBox, solvedPieceConnectorBoundingBox)){
					return "float";
				}
			}
		}

		if(hasBottomConnector && !piece.connections.includes('bottom')){
			targetElement = this.getElementByPieceId(piece.id + this.config.piecesPerSideHorizontal)
			targetPiece = this.getPieceFromElement(targetElement, ['group', 'jigsaw-type', 'is-solved']);

			if(shouldCompare(targetPiece)){
				// flip
				if(Utils.hasGroup(piece)){
					let container = this.getGroupTopContainer(element);
					containerBoundingBox = this.getTrueBoundingBox(container);
					thisPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(element, 'bottom', containerBoundingBox);
				} else {
					thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(element, "bottom");
				}

				let targetContainer, targetPieceConnectorBoundingBox, targetContainerBoundingBox;
				if(Utils.hasGroup(targetPiece)){
					targetContainer = this.getGroupTopContainer(targetElement);
					targetContainerBoundingBox = this.getTrueBoundingBox(targetContainer);
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(targetElement, "top", targetContainerBoundingBox)
				} else {
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetElement, "top");
				}

				solvedPieceConnectorBoundingBox = this.getSolvedConnectorBoundingBox(piece, "bottom");
				// console.log('checking bottom collision for piece', piece, element)
				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					return "bottom";
				} else if(this.hasCollision(thisPieceConnectorBoundingBox, solvedPieceConnectorBoundingBox)){
					return "float";
				}
			}
		}

		if(hasLeftConnector && !piece.connections.includes('left')){
			targetElement = this.getElementByPieceId(piece.id - 1);
			targetPiece = this.getPieceFromElement(targetElement, ['piece-id', 'group', 'is-solved', 'jigsaw-type'])

			if(shouldCompare(targetPiece)){
				if(!this.isMovingSinglePiece){
					let container = this.getGroupTopContainer(element);
					containerBoundingBox = this.getTrueBoundingBox(container);
					thisPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(element, 'left', containerBoundingBox);
				} else {
					thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(element, "left");
				}

				let targetContainer, targetPieceConnectorBoundingBox, targetContainerBoundingBox;
				// console.log('checking left', Utils.hasGroup(targetPiece), targetPiece)
				if(Utils.hasGroup(targetPiece)){
					targetContainer = this.getGroupTopContainer(targetElement);
					targetContainerBoundingBox = this.getTrueBoundingBox(targetContainer);
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(targetElement, "right", targetContainerBoundingBox);
				} else {
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetElement, "right");
				}

				solvedPieceConnectorBoundingBox = this.getSolvedConnectorBoundingBox(piece, "left");
				// console.log('checking left collision for piece', piece, element)
				// console.log('source BB', thisPieceConnectorBoundingBox)
				// console.log('target BB', targetPieceConnectorBoundingBox)
				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					return "left";
				} else if(this.hasCollision(thisPieceConnectorBoundingBox, solvedPieceConnectorBoundingBox)){
					return "float";
				}
			}
		}

		if(hasTopConnector && !piece.connections.includes('top')){
			targetElement = this.getElementByPieceId(piece.id - this.config.piecesPerSideHorizontal)
			targetPiece = this.getPieceFromElement(targetElement, ['group', 'jigsaw-type', 'is-solved']);

			if(shouldCompare(targetPiece)){ 
				if(Utils.hasGroup(piece)){
					let container = this.getGroupTopContainer(element);
					containerBoundingBox = this.getTrueBoundingBox(container);
					thisPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(element, 'top', containerBoundingBox);
				} else {
					thisPieceConnectorBoundingBox = this.getConnectorBoundingBox(element, "top");
				}

				let targetContainer, targetPieceConnectorBoundingBox, targetContainerBoundingBox;
				if(Utils.hasGroup(targetPiece)){
					targetContainer = this.getGroupTopContainer(targetElement);
					// console.log("checking top connector", element, targetElement, targetContainer)
					targetContainerBoundingBox = this.getTrueBoundingBox(targetContainer);
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBoxInGroup(targetElement, "bottom", targetContainerBoundingBox);
				} else {
					targetPieceConnectorBoundingBox = this.getConnectorBoundingBox(targetElement, "bottom");
				}

				solvedPieceConnectorBoundingBox = this.getSolvedConnectorBoundingBox(piece, "top");
				// console.log('checking top collision for piece', piece, element)
				// console.log('source BB', thisPieceConnectorBoundingBox)
				// console.log('target BB', targetPieceConnectorBoundingBox)
				if(this.hasCollision(thisPieceConnectorBoundingBox, targetPieceConnectorBoundingBox)){
					return "top";
				} else if(this.hasCollision(thisPieceConnectorBoundingBox, solvedPieceConnectorBoundingBox)){
					return "float";
				}
			}
		}
	}

	hasCollision(source, target, sourcePiece, sourceContainer, targetPiece, targetContainer, connection){
		if([source.left, source.right, source.bottom, source.top, target.left, target.top, target.right, target.bottom].includes(NaN)) return false;
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

	snapPiece(el, connection){
		// console.log('snapping piece', el, connection)
		let thisPiece, connectingPiece, connectingPieceEl, thisContainer, thisTopContainer, targetContainer, newPos = {}, oldPos = {}, connectingPieceNewTopPos, connectingPieceNewLeftPos;

		thisPiece = this.getPieceFromElement(el, ['piece-id', 'jigsaw-type']);
		oldPos.top = thisPiece.pageY;
		oldPos.left = thisPiece.pageX;
		const container = this.getGroupContainer(el);

		switch(connection){
			case "float":
				let pos = this.getPieceSolvedBoundingBox(thisPiece);
				if(this.isMovingSinglePiece){
					el.style.top = this.getPxString(pos.top);
					el.style.left = this.getPxString(pos.left);
					this.markAsSolved([thisPiece]);
				} else {
					let elBB = this.getElementBoundingBoxRelativeToTopContainer(el);
					let topContainer = this.getGroupTopContainer(el);
					topContainer.style.top = this.getPxString(pos.top - elBB.top);
					topContainer.style.left = this.getPxString(pos.left - elBB.left);
					this.markAsSolved(this.movingPieces)
				}
				break;
			case "right":
				connectingPieceEl = this.getElementByPieceId(thisPiece.id + 1);
				connectingPiece = this.getPieceFromElement(connectingPieceEl, ['jigsaw-type', 'group']);
				// this.debugInfoSetReadout(this.debugInfoRows.targetEl, `ID: ${connectingPieceEl.getAttribute('data-piece-id')}`);
				
				if(this.isMovingSinglePiece){
					if(Utils.hasGroup(connectingPiece)){
						targetContainer = this.getGroupContainer(connectingPieceEl);
						console.log(targetContainer, connectingPieceEl)
						// this.debugInfoSetReadout(this.debugInfoRows.targetElContainer, `ID: ${targetContainer.getAttribute('id')}`)
						newPos.left = connectingPieceEl.offsetLeft - el.offsetWidth + this.config.connectorSize;
						targetContainer.appendChild(el);
						el.style.left = this.getPxString(newPos.left);
	
						if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop;
						} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = (connectingPieceEl.offsetTop - this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = (connectingPieceEl.offsetTop + this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop;
						} else {
							newPos.top = connectingPieceEl.offsetTop;
						}
	
						el.style.top = newPos.top + "px";
					} else {
						newPos.left = connectingPieceEl.offsetLeft - el.offsetWidth + this.config.connectorSize;
						el.style.left = newPos.left + "px";
						
						if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop;
						} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = (connectingPieceEl.offsetTop - this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = (connectingPieceEl.offsetTop + this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop;
						} else {
							newPos.top = connectingPieceEl.offsetTop;
						}
		
						el.style.top = newPos.top + "px";
					}
				} else {
					if(Utils.hasGroup(connectingPiece)){
						// Snapping two groups together
						// mark	
						targetContainer = this.getGroupContainer(connectingPieceEl);
						let thisContainer = this.getGroupTopContainer(el);

						this.debugInfoSetReadout(this.debugInfoRows.targetEl, `ID: ${connectingPieceEl.getAttribute('id')}`)
						this.debugInfoSetReadout(this.debugInfoRows.targetElContainer, `ID: ${targetContainer.getAttribute('id')}`)

						const thisElOffsetWithinTopContainer = this.getElementBoundingBoxRelativeToTopContainer(el)

						newPos.left = connectingPieceEl.offsetLeft - el.offsetWidth - thisElOffsetWithinTopContainer.left + this.config.connectorSize;

						thisContainer.style.left = this.getPxString(newPos.left);
	
						if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top;
						} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top - this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top + this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top;
						} else {
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top;
						}
	
						thisContainer.style.top = newPos.top + "px";
						targetContainer.appendChild(thisContainer);

						thisContainer.classList.add('subgroup');
					} else {
						const elBB = this.getElementBoundingBoxRelativeToTopContainer(el);

						newPos.left = connectingPieceEl.offsetLeft + this.config.connectorSize - el.offsetWidth - elBB.left;

						if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop - elBB.top;
							connectingPieceNewTopPos = el.offsetTop;
						} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = (connectingPieceEl.offsetTop - this.config.connectorSize) - elBB.top;
							connectingPieceNewTopPos = el.offsetTop + this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = (connectingPieceEl.offsetTop + this.config.connectorSize) - elBB.top;
							connectingPieceNewTopPos = el.offsetTop - this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop - elBB.top;
							connectingPieceNewTopPos = el.offsetTop;
						} else {
							newPos.top = connectingPieceEl.offsetTop - elBB.top;
							connectingPieceNewTopPos = el.offsetTop;
						}

						container.appendChild(connectingPieceEl);
						connectingPieceEl.style.left = this.getPxString(el.offsetLeft + el.offsetWidth - this.config.connectorSize);
						connectingPieceEl.style.top = this.getPxString(connectingPieceNewTopPos);

						thisTopContainer = this.getGroupTopContainer(el);
						thisTopContainer.style.top = this.getPxString(newPos.top);
						thisTopContainer.style.left = this.getPxString(newPos.left);
					}
				}

				break;

			case "left":
				connectingPieceEl = this.getElementByPieceId(thisPiece.id - 1);
				connectingPiece = this.getPieceFromElement(connectingPieceEl, ['jigsaw-type', 'group']);
				this.debugInfoSetReadout(this.debugInfoRows.targetEl, `ID: ${connectingPiece.id}`);


				if(this.isMovingSinglePiece){
					if(Utils.hasGroup(connectingPiece)){
						targetContainer = this.getGroupContainer(connectingPieceEl);
						console.log('target container', targetContainer)
						newPos.left = connectingPieceEl.offsetLeft + connectingPieceEl.offsetWidth - this.config.connectorSize;
						el.style.left = this.getPxString(newPos.left);
	
						if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop;
						} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = (connectingPieceEl.offsetTop - this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = (connectingPieceEl.offsetTop + this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop;
						} else {
							newPos.top = connectingPieceEl.offsetTop;
						}
	
						el.style.top = newPos.top + "px";
						targetContainer.appendChild(el);
					} else {
						newPos.left = connectingPieceEl.offsetLeft + connectingPieceEl.offsetWidth - this.config.connectorSize;
						el.style.left = Math.floor(newPos.left) + "px";
		
						if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop;
						} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = (connectingPieceEl.offsetTop - this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = (connectingPieceEl.offsetTop + this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop;
						} else {
							newPos.top = connectingPieceEl.offsetTop;
						}
		
						el.style.top = newPos.top + "px";
					}
				} else {
					if(Utils.hasGroup(connectingPiece)){
						// Snapping two groups together

						let thisSubContainer = this.getGroupContainer(el);
						let thisContainer = this.getGroupTopContainer(el);
						targetContainer = this.getGroupContainer(connectingPieceEl);

						this.debugInfoSetReadout(this.debugInfoRows.targetEl, `ID: ${connectingPieceEl.getAttribute('id')}`)
						this.debugInfoSetReadout(this.debugInfoRows.targetElContainer, `ID: ${thisSubContainer.getAttribute('id')}`)
						this.debugInfoSetReadout(this.debugInfoRows.targetElTopContainer, `ID: ${thisContainer.getAttribute('id')}`)

						const thisElOffsetWithinTopContainer = this.getElementBoundingBoxRelativeToTopContainer(el)

						newPos.left = connectingPieceEl.offsetLeft + connectingPieceEl.offsetWidth - thisElOffsetWithinTopContainer.left - this.config.connectorSize;

						thisContainer.style.left = this.getPxString(newPos.left);
	
						if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top;
						} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top - this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top + this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top;
						} else {
							newPos.top = connectingPieceEl.offsetTop - thisElOffsetWithinTopContainer.top;
						}
	
						thisContainer.style.top = newPos.top + "px";
						targetContainer.appendChild(thisContainer);

						thisContainer.classList.add('subgroup');
					} else {
						const elBB = this.getElementBoundingBoxRelativeToTopContainer(el);

						newPos.left = connectingPieceEl.offsetLeft - this.config.connectorSize + connectingPieceEl.offsetWidth - elBB.left;

						if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = connectingPieceEl.offsetTop - elBB.top;
							connectingPieceNewTopPos = el.offsetTop;
						} else if(Utils.has(thisPiece, "plug", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = (connectingPieceEl.offsetTop - this.config.connectorSize) - elBB.top;
							connectingPieceNewTopPos = el.offsetTop + this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "plug", "top")){
							newPos.top = (connectingPieceEl.offsetTop + this.config.connectorSize) - elBB.top;
							connectingPieceNewTopPos = el.offsetTop - this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "top") && Utils.has(connectingPiece, "socket", "top")){
							newPos.top = connectingPieceEl.offsetTop - elBB.top;
							connectingPieceNewTopPos = el.offsetTop;
						} else {
							newPos.top = connectingPieceEl.offsetTop - elBB.top;
							connectingPieceNewTopPos = el.offsetTop;
						}

						thisTopContainer = this.getGroupTopContainer(el);
						thisTopContainer.style.top = this.getPxString(newPos.top);
						thisTopContainer.style.left = this.getPxString(newPos.left);

						container.appendChild(connectingPieceEl);
						connectingPieceEl.style.left = this.getPxString(el.offsetLeft - connectingPieceEl.offsetWidth + this.config.connectorSize);
						connectingPieceEl.style.top = this.getPxString(connectingPieceNewTopPos);
					}
				}

				break;
			
			case "bottom":
				connectingPieceEl = this.getElementByPieceId(thisPiece.id  + this.config.piecesPerSideHorizontal);
				connectingPiece = this.getPieceFromElement(connectingPieceEl, ['jigsaw-type', 'group']);
				this.debugInfoSetReadout(this.debugInfoRows.targetEl, `ID: ${connectingPiece.id}`);

				if(this.isMovingSinglePiece){
					if(Utils.hasGroup(connectingPiece)){
						targetContainer = this.getGroupContainer(connectingPieceEl);
						targetContainer.appendChild(el);
						newPos.top = connectingPieceEl.offsetTop - el.offsetHeight + this.config.connectorSize;
						el.style.top = this.getPxString(newPos.top);
	
						if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft;
						} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = (connectingPieceEl.offsetLeft - this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = (connectingPieceEl.offsetLeft + this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft;
						} else {
							newPos.left = connectingPieceEl.offsetLeft;
						}
	
						el.style.left = newPos.left + "px";
					} else {
						newPos.top = connectingPieceEl.offsetTop - el.offsetHeight + this.config.connectorSize;
						el.style.top = this.getPxString(newPos.top);
	
						if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft;
						} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = (connectingPieceEl.offsetLeft - this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = (connectingPieceEl.offsetLeft + this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft;
						} else {
							newPos.left = connectingPieceEl.offsetLeft;
						}
	
						el.style.left = newPos.left + "px";
					}
				} else {
					if(Utils.hasGroup(connectingPiece)){
						// Snapping two groups together
						console.log('snap problem', el, connectingPieceEl)
						targetContainer = this.getGroupContainer(connectingPieceEl);
						thisContainer = this.getGroupTopContainer(el);
						
						this.debugInfoSetReadout(this.debugInfoRows.targetEl, `ID: ${connectingPieceEl.getAttribute('id')}`)
						this.debugInfoSetReadout(this.debugInfoRows.targetElContainer, `ID: ${container.getAttribute('id')}`)
						this.debugInfoSetReadout(this.debugInfoRows.targetElTopContainer, `ID: ${thisContainer.getAttribute('id')}`)

						const thisElOffsetWithinTopContainer = this.getElementBoundingBoxRelativeToTopContainer(el)

						newPos.top = connectingPieceEl.offsetTop + this.config.connectorSize - el.offsetHeight - thisElOffsetWithinTopContainer.top;

						thisContainer.style.top = this.getPxString(newPos.top);
	
						if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left;
						} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left - this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left + this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left;
						} else {
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left;
						}
	
						thisContainer.style.left = newPos.left + "px";
						targetContainer.appendChild(thisContainer);

						thisContainer.classList.add('subgroup');
					} else {
						const elBB = this.getElementBoundingBoxRelativeToTopContainer(el);

						newPos.top = connectingPieceEl.offsetTop - el.offsetHeight + this.config.connectorSize - elBB.top;

						if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft;
						} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = (connectingPieceEl.offsetLeft - this.config.connectorSize) - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft + this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = (connectingPieceEl.offsetLeft + this.config.connectorSize) - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft - this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft;
						} else {
							newPos.left = connectingPieceEl.offsetLeft - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft;
						}

						container.appendChild(connectingPieceEl);
						connectingPieceEl.style.top = this.getPxString(el.offsetTop + el.offsetHeight - this.config.connectorSize);
						connectingPieceEl.style.left = this.getPxString(connectingPieceNewLeftPos);
						
						thisTopContainer = this.getGroupTopContainer(el);
						thisTopContainer.style.top = this.getPxString(newPos.top);
						thisTopContainer.style.left = this.getPxString(newPos.left);
					}
				}

				break;

			case "top":
				connectingPieceEl = this.getElementByPieceId(thisPiece.id - this.config.piecesPerSideHorizontal);
				connectingPiece = this.getPieceFromElement(connectingPieceEl, ['jigsaw-type', 'group']);
				this.debugInfoSetReadout(this.debugInfoRows.targetEl, `ID: ${connectingPiece.id}`);

				if(this.isMovingSinglePiece){
					if(Utils.hasGroup(connectingPiece)){
						targetContainer = this.getGroupContainer(connectingPieceEl);
						newPos.top = connectingPieceEl.offsetTop + connectingPieceEl.offsetHeight - this.config.connectorSize;
						targetContainer.appendChild(el);
						el.style.top = this.getPxString(newPos.top);
	
						if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft;
						} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = (connectingPieceEl.offsetLeft - this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = (connectingPieceEl.offsetLeft + this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft;
						} else {
							newPos.left = connectingPieceEl.offsetLeft;
						}
	
						el.style.left = newPos.left + "px";
					} else {
						newPos.top = connectingPieceEl.offsetTop + connectingPieceEl.offsetHeight - this.config.connectorSize;
						el.style.top = this.getPxString(Math.floor(newPos.top));
		
						if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft;
						} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = (connectingPieceEl.offsetLeft - this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = (connectingPieceEl.offsetLeft + this.config.connectorSize);
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft;
						} else {
							newPos.left = connectingPieceEl.offsetLeft;
						}
		
						el.style.left = newPos.left + "px";
					}
				} else {
					if(Utils.hasGroup(connectingPiece)){
						// Snapping two groups together
						targetContainer = this.getGroupContainer(connectingPieceEl);
						thisContainer = this.getGroupTopContainer(el);

						this.debugInfoSetReadout(this.debugInfoRows.targetEl, `ID: ${connectingPiece.id}`)
						this.debugInfoSetReadout(this.debugInfoRows.targetElContainer, `ID: ${container.getAttribute('id')}`)
						this.debugInfoSetReadout(this.debugInfoRows.targetElTopContainer, `ID: ${thisContainer.getAttribute('id')}`)

						const thisElOffsetWithinTopContainer = this.getElementBoundingBoxRelativeToTopContainer(el)

						newPos.top = connectingPieceEl.offsetTop + connectingPieceEl.offsetHeight - this.config.connectorSize - thisElOffsetWithinTopContainer.top;

						thisContainer.style.top = this.getPxString(newPos.top);
	
						if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left;
						} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left - this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left + this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left;
						} else {
							newPos.left = connectingPieceEl.offsetLeft - thisElOffsetWithinTopContainer.left;
						}
	
						thisContainer.style.left = newPos.left + "px";
						thisContainer.classList.add('subgroup');
						targetContainer.appendChild(thisContainer);
					} else {
						const elBB = this.getElementBoundingBoxRelativeToTopContainer(el);

						newPos.top = connectingPieceEl.offsetTop + connectingPieceEl.offsetHeight - this.config.connectorSize - elBB.top;

						if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = connectingPieceEl.offsetLeft - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft;
						} else if(Utils.has(thisPiece, "plug", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = (connectingPieceEl.offsetLeft - this.config.connectorSize) - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft + this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "plug", "left")){
							newPos.left = (connectingPieceEl.offsetLeft + this.config.connectorSize) - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft - this.config.connectorSize;
						} else if(Utils.has(thisPiece, "socket", "left") && Utils.has(connectingPiece, "socket", "left")){
							newPos.left = connectingPieceEl.offsetLeft - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft;
						} else {
							newPos.left = connectingPieceEl.offsetLeft - elBB.left;
							connectingPieceNewLeftPos = el.offsetLeft;
						}

						thisTopContainer = this.getGroupTopContainer(el);
						thisTopContainer.style.top = this.getPxString(newPos.top);
						thisTopContainer.style.left = this.getPxString(newPos.left);
						
						container.appendChild(connectingPieceEl);
						connectingPieceEl.style.top = this.getPxString(el.offsetTop - connectingPieceEl.offsetHeight + this.config.connectorSize);
						connectingPieceEl.style.left = this.getPxString(connectingPieceNewLeftPos);
					}
				}
				
				break;

			case "top-left":
				if(!this.isMovingSinglePiece){
					let elBB = this.getElementBoundingBoxRelativeToTopContainer(el);
					newPos.left = this.config.boardBoundary - elBB.left;
					let topContainer = this.getGroupTopContainer(el);
					let containerBoundingBox = topContainer.getBoundingClientRect();
					let elBoundingBox = el.getBoundingClientRect();
					newPos.top = this.config.boardBoundary + (containerBoundingBox.top - elBoundingBox.top);
					topContainer.style.top = this.getPxString(newPos.top);
					topContainer.style.left = this.getPxString(newPos.left);
				} else {
					el.style.top = this.getPxString(this.config.boardBoundary);
					el.style.left = this.getPxString(this.config.boardBoundary);
				}
				break;
			case "top-right":
				if(!this.isMovingSinglePiece){
					let topContainer = this.getGroupTopContainer(el);
					let containerBoundingBox = topContainer.getBoundingClientRect();
					let elBoundingBox = el.getBoundingClientRect();
					newPos.top = this.config.boardBoundary + (containerBoundingBox.top - elBoundingBox.top);
					newPos.left = this.canvasWidth - this.config.boardBoundary - el.offsetWidth - (elBoundingBox.left - containerBoundingBox.left);

					topContainer.style.top = this.getPxString(newPos.top);
					topContainer.style.left = this.getPxString(newPos.left);
				} else {
					newPos.top = this.config.boardBoundary;
					newPos.left = this.canvasWidth - this.config.boardBoundary - el.offsetWidth;
					el.style.top = this.getPxString(newPos.top);
					el.style.left = this.getPxString(newPos.left);
				}
				break;
			case "bottom-right":
				if(!this.isMovingSinglePiece){
					let topContainer = this.getGroupTopContainer(el);
					let containerBoundingBox = topContainer.getBoundingClientRect();
					let elBoundingBox = el.getBoundingClientRect();

					newPos.top = this.canvasHeight - this.config.boardBoundary - (elBoundingBox.top - containerBoundingBox.top) - el.offsetHeight;
					newPos.left = this.canvasWidth - this.config.boardBoundary - (elBoundingBox.left - containerBoundingBox.left) - el.offsetWidth;

					topContainer.style.top = this.getPxString(newPos.top);
					topContainer.style.left = this.getPxString(newPos.left);
				} else {
					newPos.top = this.canvasHeight - this.config.boardBoundary - thisPiece.imgH;
					newPos.left = this.canvasWidth - this.config.boardBoundary - thisPiece.imgW;
					el.style.top = newPos.top + "px";
					el.style.left = newPos.left + "px";
				}
				break;
			case "bottom-left":
				if(!this.isMovingSinglePiece){
					let topContainer = this.getGroupTopContainer(el);
					let containerBoundingBox = topContainer.getBoundingClientRect();
					let elBoundingBox = el.getBoundingClientRect();

					newPos.top = this.canvasHeight - this.config.boardBoundary - (elBoundingBox.top - containerBoundingBox.top) - el.offsetHeight;
					newPos.left = this.config.boardBoundary + (elBoundingBox.left - containerBoundingBox.left);

					topContainer.style.top = this.getPxString(newPos.top);
					topContainer.style.left = this.getPxString(newPos.left);
				} else {
					newPos.top = this.canvasHeight - this.config.boardBoundary - thisPiece.imgH;
					newPos.left = this.config.boardBoundary;
					el.style.top = newPos.top + "px";
					el.style.left = newPos.left + "px";
				}
				break;
		}
		
		this.group(el, connectingPieceEl);

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

	getConnectionsForPiece(piece){
		const connections = [];
		const p = this.getPieceFromElement(piece, ['piece-id', 'jigsaw-type', 'group']);

		const pieceTop = !Utils.isTopEdgePiece(p) && this.getElementByPieceId(p.id - this.config.piecesPerSideHorizontal);
		const pieceRight = !Utils.isRightEdgePiece(p) && this.getElementByPieceId(p.id + 1);
		const pieceBottom = !Utils.isBottomEdgePiece(p) && this.getElementByPieceId(p.id + this.config.piecesPerSideHorizontal);
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

	group(pieceAEl, pieceBEl){
		if(!pieceBEl) return;
		const pieceA = this.getPieceFromElement(pieceAEl, ['jigsaw-type', 'group']);
		const pieceB = this.getPieceFromElement(pieceBEl, ['jigsaw-type', 'group']);
		if(!this.isNumber(pieceA.group) && !this.isNumber(pieceB.group)){
			this.createGroup(pieceAEl, pieceBEl);
		} else if(pieceA.group > -1 && !this.isNumber(pieceB.group)){
			this.addToGroup(pieceBEl, pieceA.group)
		} else if(!this.isNumber(pieceA.group) && pieceB.group > -1){
			this.addToGroup(pieceAEl, pieceB.group)
		} else {
			this.mergeGroups(pieceAEl, pieceBEl)
		}
	}

	getPxString(value){
		return value + 'px';
	}

	createGroupContainer(pieceAEl, pieceBEl, group){
		const leftPos =  Math.min(pieceAEl.offsetLeft, pieceBEl.offsetLeft);
		const topPos =  Math.min(pieceAEl.offsetTop, pieceBEl.offsetTop);
		const container = document.createElement('div');
		container.setAttribute('id', `group-${group}`);
		container.classList.add('group-container');
		container.style.top = this.getPxString(topPos);
		container.style.left = this.getPxString(leftPos);
		container.style.width = this.getPxString(this.config.pieceSize);
		container.style.height = this.getPxString(this.config.pieceSize);

		container.appendChild(pieceAEl);
		container.appendChild(pieceBEl);
		container.style.position = 'absolute';
		this.canvas.appendChild(container);

		const pieceA = this.getPieceFromElement(pieceAEl, ['piece-id', 'jigsaw-type']);
		const pieceB = this.getPieceFromElement(pieceBEl, ['piece-id', 'jigsaw-type']);

		if(pieceA.id === pieceB.id - 1 || pieceA.id === pieceB.id + 1){
			// piece A has horizontal connection with piece B
			if(pieceA.id === pieceB.id - 1){
				pieceAEl.style.left = this.getPxString(0);
				pieceBEl.style.left = this.getPxString(pieceAEl.offsetWidth - this.config.connectorSize);
			} else {
				pieceBEl.style.left = this.getPxString(0);
				pieceAEl.style.left = this.getPxString(pieceBEl.offsetWidth - this.config.connectorSize);
			}

			if(Utils.has(pieceA, "plug", "top") && Utils.has(pieceB, "plug", "top")){
				pieceAEl.style.top = this.getPxString(0);
				pieceBEl.style.top = this.getPxString(0);
			} else if(Utils.has(pieceA, "plug", "top") && Utils.has(pieceB, "socket", "top")){
				pieceAEl.style.top = this.getPxString(0);
				pieceBEl.style.top = this.getPxString(this.config.connectorSize);
			} else if(Utils.has(pieceA, "socket", "top") && Utils.has(pieceB, "plug", "top")){
				pieceAEl.style.top = this.getPxString(this.config.connectorSize);
				pieceBEl.style.top = this.getPxString(0);
			} else if(Utils.has(pieceA, "socket", "top") && Utils.has(pieceB, "socket", "top")){
				pieceAEl.style.top = this.getPxString(0);
				pieceBEl.style.top = this.getPxString(0);
			} else {
				pieceAEl.style.top = this.getPxString(0);
				pieceBEl.style.top = this.getPxString(0);
			}
		} else if(pieceA.id < pieceB.id - 1 || pieceA.id > pieceB.id + 1){
			// piece A has vertical connection with piece B
			if(pieceA.id < pieceB.id - 1){
				pieceAEl.style.top = this.getPxString(0);
				pieceBEl.style.top = this.getPxString(pieceAEl.offsetHeight - this.config.connectorSize);
			} else {
				pieceBEl.style.top = this.getPxString(0);
				pieceAEl.style.top = this.getPxString(pieceBEl.offsetHeight - this.config.connectorSize);
			}

			if(Utils.has(pieceA, "plug", "left") && Utils.has(pieceB, "plug", "left")){
				pieceAEl.style.left = this.getPxString(0);
				pieceBEl.style.left = this.getPxString(0);
			} else if(Utils.has(pieceA, "plug", "left") && Utils.has(pieceB, "socket", "left")){
				pieceAEl.style.left = this.getPxString(0);
				pieceBEl.style.left = this.getPxString(this.config.connectorSize);
			} else if(Utils.has(pieceA, "socket", "left") && Utils.has(pieceB, "plug", "left")){
				pieceAEl.style.left = this.getPxString(this.config.connectorSize);
				pieceBEl.style.left = this.getPxString(0);
			} else if(Utils.has(pieceA, "socket", "left") && Utils.has(pieceB, "socket", "left")){
				pieceAEl.style.left = this.getPxString(0);
				pieceBEl.style.left = this.getPxString(0);
			} else {
				pieceAEl.style.left = this.getPxString(0);
				pieceBEl.style.left = this.getPxString(0);
			}
		}

		this.setPiecePositionsWithinContainer(pieceAEl);
		this.setPiecePositionsWithinContainer(pieceBEl);
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
		// console.log('createGroup', elementA, elementB)
		const groupId = new Date().getTime();

		this.createGroupContainer(elementA, elementB, groupId)
		const pieceAPosWithinContainer = this.getElementBoundingBoxRelativeToTopContainer(elementA);
		const pieceBPosWithinContainer = this.getElementBoundingBoxRelativeToTopContainer(elementB);
		this.setElementAttribute(elementA, "data-group", groupId)
		this.setElementAttribute(elementA, "data-position-within-container-left", pieceAPosWithinContainer.left)
		this.setElementAttribute(elementA, "data-position-within-container-top", pieceAPosWithinContainer.top)
		this.setElementAttribute(elementB, "data-group", groupId)
		this.setElementAttribute(elementB, "data-position-within-container-left", pieceBPosWithinContainer.left)
		this.setElementAttribute(elementB, "data-position-within-container-top", pieceBPosWithinContainer.top)


		// flip
		if(this.isGroupSolved(groupId)){
			this.setElementAttribute(elementA, "data-is-solved", true)
			this.setElementAttribute(elementB, "data-is-solved", true)
		}

		this.save([elementA, elementB])
	}

	getPiecesInGroup(group){
		return document.querySelectorAll(`[data-group='${group}']`)
	}

	assignPiecesToTopGroup(pieces){
		const container = this.getGroupTopContainer(pieces[0]);
		const group = this.getGroupFromContainer(container);
		pieces.forEach(p => this.setElementAttribute(p, 'data-group', group));
	}

	addPiecesToGroup(pieces, group){
		console.log('addPiecesToGroup', pieces, group)
		
		const isTargetGroupSolved = this.isGroupSolved(group);

		pieces.forEach(p => {
			this.setElementAttribute(p, "data-connections", this.getConnectionsForPiece(p).join(', '))
			this.setElementAttribute(p, "data-group", group)

			if(isTargetGroupSolved){
				this.setElementAttribute(p, "data-is-solved", true)
			}	
		});

		const piecesInTargetGroup = this.getPiecesInGroup(group);
		piecesInTargetGroup.forEach(p =>{
			this.setElementAttribute(p, "data-connections", this.getConnectionsForPiece(p).join(', '))
		})
	}

	addToGroup(piece, group){
		const formerGroup = this.getGroup(piece);
		const otherPiecesInFormerGroup = this.getPiecesInGroup(formerGroup);

		if(otherPiecesInFormerGroup.length > 0){
			this.addPiecesToGroup(otherPiecesInFormerGroup, group)
		}

		this.setElementAttribute(piece, "data-group", group)

		if(this.isGroupSolved(group)){
			this.setElementAttribute(piece, "data-is-solved", true)
		}

		const posInGroup = this.getElementBoundingBoxRelativeToTopContainer(piece);
		this.setElementAttribute(piece, 'data-position-within-container-top', posInGroup.top);
		this.setElementAttribute(piece, 'data-position-within-container-left', posInGroup.left);

		const pieceIsSolved = this.getPieceFromElement(piece, ['is-solved']).isSolved;
		const piecesInNewGroup = this.getPiecesInGroup(group);

		if(pieceIsSolved){
			piecesInNewGroup.forEach(el => this.setElementAttribute(el, 'data-is-solved', true))
		}
	}
	
	mergeGroups(pieceA, pieceB){
		const pieceAGroup = this.getGroup(pieceA);
		const pieceBGroup = this.getGroup(pieceB);
		const piecesInGroupA = this.getPiecesInGroup(pieceAGroup);
		const piecesInGroupB = this.getPiecesInGroup(pieceBGroup);

		let pieces, targetGroup;

		if(piecesInGroupA.length > piecesInGroupB.length){
			pieces = piecesInGroupB;
			targetGroup = pieceAGroup;
		} else {
			pieces = piecesInGroupA;
			targetGroup = pieceBGroup;
		}

		this.addPiecesToGroup(pieces, targetGroup);
		// const allPieces = this.getPiecesInGroup(targetGroup)
		// this.assignPiecesToTopGroup(allPieces);
		this.setPiecePositionsWithinContainer([...piecesInGroupA, ...piecesInGroupB]);
	}

	isGroupSolved(group){
		return Array.from(this.getPiecesInGroup(group)).some(p => this.getIsSolved(p));
	}

	initiFullImagePreviewer(){
		const boardAreaElRect = this.boardAreaEl.getBoundingClientRect();
		this.fullImageViewerEl.style.left = boardAreaElRect.left + "px";
		this.fullImageViewerEl.style.top = boardAreaElRect.top + "px";
		this.fullImageViewerEl.setAttribute('width', boardAreaElRect.width);
		this.fullImageViewerEl.setAttribute('height', boardAreaElRect.height);
		const previewctx = this.fullImageViewerEl.getContext('2d');
		previewctx.drawImage(
			this.SourceImage, 
			this.config.selectedOffsetX,
			this.config.selectedOffsetY,
			Math.round(boardAreaElRect.width),
			Math.round(boardAreaElRect.height),
			0,
			0, 
			Math.round(boardAreaElRect.width), 
			Math.round(boardAreaElRect.height)
		)
	}

	checkCompletion(){
		return this.pieces.filter(p => p.isSolved).length === this.pieces.length;
	}

	getPieceFromElement(el, keys){
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
				data.imgX = parseInt(this.getDataAttributeValue(el, 'imgX'));
			}
			if(k == 'imgy'){
				data.imgY = parseInt(this.getDataAttributeValue(el, 'imgY'));
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
				data.type = this.getDataAttributeValue(el, 'jigsaw-type').split(',').map(n => parseInt(n));
			}
			if(k == 'connections'){
				const connections = this.getDataAttributeValue(el, 'connections');
				data.connections = connections ? connections.split(',') : [];
			}
			if(k == 'connects-to'){
				data.connectsTo = this.getDataAttributeValue(el, 'connects-to').toString();
			}
			if(k == 'is-inner-piece'){
				const isInnerPiece = this.getDataAttributeValue(el, 'is-inner-piece');
				data.isInnerPiece = isInnerPiece == "true" ? true : false;
			}
			if(k == 'is-solved'){
				let groupIsSolved;
				if(this.getGroup(el)){
					const container = this.getGroupTopContainer(el);
					if(this.getDataAttributeValue(container, 'is-solved')){
						groupIsSolved = true;
					}
				}
				data.isSolved = this.getIsSolved(el) || groupIsSolved;
			}
			if(k == 'group'){
				data.group = this.getGroup(el);
			}

			data.pageX = el.offsetLeft;
			data.pageY = el.offsetTop;

			if(Utils.hasGroup({group: this.getGroup(el)})){
				let posInContainer = this.getElementBoundingBoxRelativeToTopContainer(el);
				let container = this.getGroupTopContainer(el);
				data.containerX = container.offsetLeft;
				data.containerY = container.offsetTop;
				data.pageX = posInContainer.left;
				data.pageY = posInContainer.top;
			}
		})
		return data;
	}

	// Deprecated
	getPieceDataForPersistence(el){
		const data = {
			puzzleId: this.puzzleId,
			id: parseInt(this.getDataAttributeValue(el, 'piece-id')),
			_id: parseInt(this.getDataAttributeValue(el, 'piece-id-in-persistence')),
			imgX: parseInt(this.getDataAttributeValue(el, 'imgX')),
			imgY: parseInt(this.getDataAttributeValue(el, 'imgY')),
			imgW: parseInt(this.getDataAttributeValue(el, 'imgW')),
			imgH: parseInt(this.getDataAttributeValue(el, 'imgH')),
			pageX: el.offsetLeft,
			pageY: el.offsetTop,
			type: "",
			group: this.getGroup(el),
			connectsTo: this.getDataAttributeValue(el, 'connects-to').toString(),
			connections: connections ? connections.split(',') : undefined,
			isSolved: this.getDataAttributeValue(el, 'is-solved'),
			isInnerPiece: isInnerPiece == "true" ? true : false,
			numPiecesFromTopEdge: parseInt(this.getDataAttributeValue(el, 'num-pieces-from-top-edge')),
			numPiecesFromLeftEdge: parseInt(this.getDataAttributeValue(el, 'num-pieces-from-left-edge')),
		}

		if(Utils.hasGroup(el)){
			let posInContainer = this.getElementBoundingBoxRelativeToTopContainer(el);
			let container = this.getGroupTopContainer(el);
			data.containerX = container.offsetLeft;
			data.containerY = container.offsetTop;
			data.pageX = posInContainer.left;
			data.pageY = posInContainer.top;
		}

		return data;
	}	

	setElementIdsFromPersistence(pieces){
		const allPieces = this.allPieces();
		pieces.map(p => {
			let { imgX, imgY, _id } = p;
			imgX = "" + imgX;
			imgY = "" + imgY;
			const el = Utils.querySelectorFrom(`[data-imgx='${imgX}'][data-imgy='${imgY}']`, allPieces)[0];
			this.setElementAttribute(el, 'data-piece-id-in-persistence', _id)
		})
	}

	async save(pieces){
		const payload = [];
		const allKeys = [
			'piece-id', 'piece-id-in-persistence', 'puzzle-id', 'imgx', 'imgy', 'imgw', 'imgh', 'num-pieces-from-top-edge', 'num-pieces-from-left-edge', 'jigsaw-type', 'connections', 'connects-to', 'is-inner-piece', 'is-solved', 'group',
		];
		pieces.forEach( p => payload.push(this.getPieceFromElement(p, allKeys)) )

		const isFirstSave = !payload[0]._id;
		fetch(`/api/pieces/${this.puzzleId}`, {
			method: isFirstSave ? 'post' : 'put',
			headers: {
				'Content-Type': 'Application/json'
			},
			body: JSON.stringify(payload)
		})
		.then( res => res.json() )
		.then( res => {
			if(isFirstSave){
				console.log(res)
				this.setElementIdsFromPersistence(res)
			}
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
