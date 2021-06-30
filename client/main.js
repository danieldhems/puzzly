import Puzzly from './puzzly.js';
const puzzleSizes = {
	small: {
		piecesPerSideHorizontal: 10,
		piecesPerSideVertical: 7,
		pieceSize: 120,
	},
	medium: {
		piecesPerSideHorizontal: 15,
		piecesPerSideVertical: 12,
		pieceSize: 90,
	},
	large: {
		piecesPerSideHorizontal: 27,
		piecesPerSideVertical: 20,
		pieceSize: 60,
	},
};

var imageUploadForm = document.querySelector('#image-upload');
var puzzleSelectionForm = document.querySelector('#puzzle-selection');
var imageCrop = document.querySelector('#image-crop');

const puzzleSizeField = document.querySelector("[name='puzzle-size']");

puzzleSizeField.addEventListener('change', function(e){
	e.preventDefault();
	const selection = puzzleSizes[e.target.value];
	const width = selection.piecesPerSideHorizontal * selection.pieceSize;
	const height = selection.piecesPerSideVertical * selection.pieceSize;
	imageCrop.style.width = width + "px";
	imageCrop.style.height = height + "px";
});

imageUploadForm.addEventListener('submit', function(e){
	e.preventDefault();
	upload();
});

puzzleSelectionForm.addEventListener('submit', function(e){
	e.preventDefault();
	createPuzzle();
});

function onUploadSuccess(response){
	const imagePreviewEl = document.querySelector('#canvas');
	const imageEl = document.createElement('img');
	imageEl.src = response.data.path;
	imagePreviewEl.appendChild(imageEl);

}

function onUploadFailure(response){
	console.log(response);
}

function upload(){
	const image = document.querySelector('[type=file]').files;
	
	const fd = new FormData();
	fd.append('files[]', image[0])

	fetch('/api/upload', {
		body: fd,
		method: 'POST',
	})
	.then( response => response.json() )
	.then( function(d){
		onUploadSuccess(d);
	}).catch( function(err){
		onUploadFailure(err);
	});
}

function createPuzzle(){
	const puzzleSize = document.querySelector('[name=puzzle-size]').selected;
	const userInput = {
		puzzleSize,
	}

	fetch('/api/puzzle', {
		body: JSON.stringify(userInput),
		method: 'POST',
	})
	.then( response => response.json() )
	.then( function(response){
		const puzzleId = response.puzzleId;
		window.location.href = `puzzle?id=${puzzleId}`;
	}).catch( function(err){
		console.log(err);
	});
}
