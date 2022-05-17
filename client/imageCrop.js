export default class ImageCrop {
	constructor(image){
		this.image = image;

		this.imageCropElement = document.getElementById('image-crop');
		this.imageCropDragHandles = document.querySelectorAll('.image-crop-drag-handle');
		this.imageCropDragHandleTL = document.querySelector('#image-crop-drag-handle-tl');
		this.imageCropDragHandleTR = document.querySelector('#image-crop-drag-handle-tr');
		this.imageCropDragHandleBR = document.querySelector('#image-crop-drag-handle-br');
		this.imageCropDragHandleBL = document.querySelector('#image-crop-drag-handle-bl');

		this.imageCropDragHandlesInUse = false;
	}	
}



function setImageCropDragHandles(){
	imageCropDragHandles.forEach(el => el.style.display = "block")

	imageCropDragHandleTL.style.top = 0 - imageCropDragHandleTL.clientHeight + "px";
	imageCropDragHandleTL.style.left = imageCrop.offsetLeft - imageCropDragHandleTL.clientWidth + "px";
	
	imageCropDragHandleTR.style.top = 0 - imageCropDragHandleTL.clientHeight + "px";
	imageCropDragHandleTR.style.left = imageCrop.offsetLeft + imageCrop.offsetWidth + "px";
	
	imageCropDragHandleBR.style.top = imageCrop.offsetTop + imageCrop.offsetHeight + "px";
	imageCropDragHandleBR.style.left = imageCrop.offsetLeft + imageCrop.offsetWidth + "px";

	imageCropDragHandleBL.style.top = imageCrop.offsetTop + imageCrop.offsetHeight + "px";
	imageCropDragHandleBL.style.left = imageCrop.offsetLeft - imageCropDragHandleBL.clientWidth + "px";

	this.imageCropDragHandlesInUse = true;
}

this.imageCropElement.addEventListener('mousedown', function(e){
	const el = e.target;
	const diffX = e.clientX - el.offsetLeft;
	const diffY = e.clientY - el.offsetTop;
	const w = imageUploadPreviewEl.offsetWidth;
	const h = imageUploadPreviewEl.offsetHeight;

	PuzzlyCreator.imageCrop = {
		currX: el.offsetLeft,
		currY: el.offsetTop,
		diffX,
		diffY,
		width: el.clientWidth,
		height: el.clientHeight,
		isMoving: true,
	};

	const limitToAxis = w > h ? "x" : h > w ? "y" : null;

	const moveListener = this.imageCropElement.imageCrop.addEventListener('mousemove', (e) => onImageCropMove(e, limitToAxis));
	this.imageCropElement.imageCrop.addEventListener('mouseup', function(e){
		this.imageCropElement.imageCrop.removeEventListener('mousemove', moveListener);
		PuzzlyCreator.imageCrop.isMoving = false;
		setPuzzleImageOffsetAndWidth(e.target);
	})
});

function setPuzzleImageOffsetAndWidth(cropElement, noCrop = false){
	// Comms between this class and Puzzly class?
	if(noCrop){
		PuzzlyCreator.puzzleSetup.selectedOffsetX = 0;
		PuzzlyCreator.puzzleSetup.selectedWidth = imageUploadPreviewEl.naturalWidth;
	} else {
		const leftPos = cropElement.offsetLeft;
		const width = cropElement.clientWidth;
		const cropLeftOffsetPercentage = leftPos / imageUploadPreviewEl.offsetWidth * 100;
		const cropWidthPercentage = width / imageUploadPreviewEl.offsetWidth * 100;
	
		PuzzlyCreator.puzzleSetup.selectedOffsetX = imageUploadPreviewEl.naturalWidth / 100 * cropLeftOffsetPercentage;
		PuzzlyCreator.puzzleSetup.selectedWidth = imageUploadPreviewEl.naturalWidth / 100 * cropWidthPercentage;
	}
}

function imageCropWithinBounds(newX, newY, axis = null){
	const elBoundingBox = {
		top: newY,
		right: newX + this.imageCropElement.clientWidth,
		bottom: newY + this.imageCropElement.clientHeight,
		left: newX
	};
	const containerBoundingBox = imagePreviewEl.getBoundingClientRect();

	if(axis && axis === "x"){
		return elBoundingBox.left >= Math.ceil(this.image.offsetLeft) && elBoundingBox.right <= Math.ceil(this.image.offsetLeft + this.image.offsetWidth);
	}
	if(axis && axis === "y"){
		return elBoundingBox.top >= Math.ceil(this.image.offsetTop) && elBoundingBox.bottom <= Math.ceil(this.image.offsetTop + this.image.offsetHeight);
	}
	return elBoundingBox.left >= Math.ceil(containerBoundingBox.left) && elBoundingBox.right <= Math.ceil(containerBoundingBox.right) && elBoundingBox.top >= Math.ceil(containerBoundingBox.top) && elBoundingBox.bottom <= Math.ceil(containerBoundingBox.bottom);
}

function onImageCropMove(e, axis = null){
	const newX = e.clientX - PuzzlyCreator.imageCrop.diffX;
	const newY = e.clientY - PuzzlyCreator.imageCrop.diffY;

	if(PuzzlyCreator.imageCrop.isMoving && imageCropWithinBounds(newX, newY, axis)){
		if(axis && axis === "y" || !axis){
			this.imageCropElement.style.top = newY + "px";
		}
		if(axis && axis === "x" || !axis){
			this.imageCropElement.style.left = newX + "px";
		}
		if(this.imageCropDragHandlesInUse){
			this.setImageCropDragHandles();
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

function initiateImageCrop(imageEl){
	const width = imageEl.offsetWidth;
	const height = imageEl.offsetHeight;
	if(width === height) return;

	imageCrop.style.display = "block";
	imageCrop.id = "image-crop";
	imageCrop.style.top = imageEl.offsetTop + "px";
	imageCrop.style.left = imageEl.offsetLeft + "px";
	imageCrop.style.height = height > width ? width + "px" : height + "px";
	imageCrop.style.width = width > height ? height + "px" : width + "px";
	setImageCropDragHandles();
}