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
















