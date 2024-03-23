import { PuzzleSizes } from "./constants";
import puzzleGenerator from "./puzzleGenerator";
import Puzzly from "./Puzzly";
import { PuzzleCreationResponse, PuzzleCreatorOptions } from "./types";
import Utils from "./utils";

export interface SourceImage {
  dimensions: {
    width: number;
    height: number;
  };
  previewPath: string;
  fullSizePath: string;
  imageName: string;
  filename: string;
  width: number;
  height: number;
}

export interface Crop {
  selectedOffsetX: number;
  selectedOffsetY: number;
  selectedWidth: number;
  selectedHeight: number;
  hasCrop: boolean;
}

export interface ImageCropData {
  currX: number;
  currY: number;
  diffX: number;
  diffY: number;
  width: number;
  height: number;
  inUse: boolean;
}

export interface DebugOptions {
  noDispersal: boolean;
  highlightConnectingPieces: boolean;
}

export default class PuzzlyCreator {
  selectedNumPieces: number;
  piecesPerSide: number;
  sourceImage: SourceImage;
  crop: Crop;
  image: File;
  imageCropData: ImageCropData;
  cropNotNeeded: boolean;
  debugOptions: DebugOptions;
  boardSize: number;
  imagePreviewType: string;
  puzzleSizeInputField: HTMLInputElement;
  puzzleSizeInputLabel: HTMLLabelElement;
  chkHighlights: HTMLInputElement;
  chkNoDispersal: HTMLInputElement;
  imagePreviewEl: HTMLImageElement;
  imageUpload: HTMLInputElement;
  newPuzzleForm: HTMLDivElement;
  startBtn: HTMLInputElement;
  puzzleSizeField: HTMLInputElement;
  imageUploadPreviewEl: HTMLImageElement & {
    naturalWidth: number;
    naturalHeight: number;
  };
  fullSizeImageHidden: HTMLElement;
  imageCropElement: HTMLElement;
  imageCropDragHandle: HTMLDivElement;
  imageCropDragHandles: NodeListOf<HTMLElement>;
  imageCropDragHandleTL: HTMLElement;
  imageCropDragHandleTR: HTMLElement;
  imageCropDragHandleBR: HTMLElement;
  imageCropDragHandleBL: HTMLElement;
  imagePreviewTypeToggleRadio: HTMLInputElement;
  imagePreviewTypeAlwaysOnRadio: HTMLInputElement;
  imageCropDragHandlesInUse: boolean;
  puzzleToImageRatio: number;
  imageSize: number;
  imageCropVisible: boolean;
  selectedOffsetX: number;
  selectedOffsetY: number;
  selectedWidth: number;
  selectedHeight: number;
  integration: boolean;

  constructor() {
    this.boardSize = Math.ceil((window.innerHeight / 100) * 40);
    this.imagePreviewType = "toggle";

    this.puzzleSizeInputField = document.querySelector(
      "#puzzle-size-input-field"
    ) as this["puzzleSizeInputField"];
    this.puzzleSizeInputLabel = document.querySelector(
      "#puzzle-size-input-label"
    ) as this["puzzleSizeInputLabel"];
    this.chkHighlights = document.querySelector(
      "#chk-highlights"
    ) as this["chkHighlights"];
    this.chkNoDispersal = document.querySelector(
      "#chk-no-disperse"
    ) as this["chkNoDispersal"];
    this.imagePreviewEl = document.querySelector(
      "#puzzle-setup--image_preview"
    ) as this["imagePreviewEl"];
    this.imageUpload = document.querySelector(
      "#upload-fld"
    ) as this["imageUpload"];
    this.newPuzzleForm = document.querySelector(
      "#form-container"
    ) as this["newPuzzleForm"];
    this.startBtn = document.querySelector("#start-btn") as this["startBtn"];
    this.puzzleSizeField = document.getElementById(
      "puzzle-size-input-field"
    ) as this["puzzleSizeField"];
    this.imageUploadPreviewEl = document.getElementById(
      "puzzle-setup--image_preview-imgEl"
    ) as this["imageUploadPreviewEl"];
    this.fullSizeImageHidden = document.getElementById(
      "full-size-image"
    ) as this["fullSizeImageHidden"];
    this.imageCropElement = document.getElementById(
      "image-crop"
    ) as this["imageCropElement"];
    this.imageCropDragHandles = document.querySelectorAll(
      ".image-crop-drag-handle"
    );
    this.imageCropDragHandleTL = document.querySelector(
      "#image-crop-drag-handle-tl"
    ) as this["imageCropDragHandleTL"];
    this.imageCropDragHandleTR = document.querySelector(
      "#image-crop-drag-handle-tr"
    ) as this["imageCropDragHandleTR"];
    this.imageCropDragHandleBR = document.querySelector(
      "#image-crop-drag-handle-br"
    ) as this["imageCropDragHandleBR"];
    this.imageCropDragHandleBL = document.querySelector(
      "#image-crop-drag-handle-bl"
    ) as this["imageCropDragHandleBL"];

    this.imagePreviewTypeToggleRadio = document.querySelector(
      "#image-preview-type-toggle"
    ) as this["imagePreviewTypeToggleRadio"];
    this.imagePreviewTypeAlwaysOnRadio = document.querySelector(
      "#image-preview-type-always-on"
    ) as this["imagePreviewTypeAlwaysOnRadio"];

    this.imageCropDragHandlesInUse = false;

    this.crop = {
      selectedOffsetX: 0,
      selectedOffsetY: 0,
      selectedWidth: 0,
      selectedHeight: 0,
      hasCrop: false,
    };

    this.sourceImage = {
      dimensions: {
        width: 0,
        height: 0,
      },
      previewPath: "",
      fullSizePath: "",
      imageName: "",
      filename: "",
      width: 0,
      height: 0,
    };

    this.debugOptions = {
      noDispersal: false,
      highlightConnectingPieces: false,
    };

    this.addEventListeners();
    this.setDefaultNumPieces();
    this.showForm();

    this.integration = window.location.href.indexOf("integration=true") > -1;
  }

  showForm() {
    this.newPuzzleForm.style.display = "flex";
  }

  setDefaultNumPieces() {
    this.puzzleSizeField.value = "0";
    const defaultPuzzleSize = PuzzleSizes[0];
    this.puzzleSizeInputLabel.textContent = (this.selectedNumPieces =
      defaultPuzzleSize.numPieces).toString();
    this.piecesPerSide = defaultPuzzleSize.piecesPerSide;
  }

  addEventListeners() {
    this.puzzleSizeInputField.addEventListener(
      "input",
      function (e: InputEvent) {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        this.puzzleSizeInputLabel.textContent = this.selectedNumPieces =
          PuzzleSizes[parseInt(target.value)].numPieces;
      }.bind(this)
    );

    this.imagePreviewTypeToggleRadio.addEventListener("change", () => {
      this.imagePreviewType = "toggle";
    });

    this.imagePreviewTypeAlwaysOnRadio.addEventListener("change", () => {
      this.imagePreviewType = "alwaysOn";
    });

    this.chkHighlights.addEventListener(
      "input",
      function (e: InputEvent) {
        this.debugOptions.highlightConnectingPieces = (
          e.target as HTMLInputElement
        ).checked;
      }.bind(this)
    );

    this.chkNoDispersal.addEventListener(
      "input",
      function (e: InputEvent) {
        this.debugOptions.noDispersal = (e.target as HTMLInputElement).checked;
      }.bind(this)
    );

    this.puzzleSizeField.addEventListener(
      "change",
      function (e: InputEvent) {
        e.preventDefault();
        this.selectedNumPieces =
          PuzzleSizes[parseInt((e.target as HTMLInputElement).value)].numPieces;
      }.bind(this)
    );

    this.imageUpload.addEventListener(
      "change",
      this.onImageUploadChange.bind(this)
    );
    this.imageCropElement.addEventListener(
      "mousedown",
      this.onImageCropMouseDown.bind(this)
    );
    this.imageCropElement.addEventListener(
      "mouseup",
      this.onImageCropMouseUp.bind(this)
    );
    this.imageUploadPreviewEl.addEventListener(
      "load",
      this.onImagePreviewLoad.bind(this)
    );
    this.fullSizeImageHidden.addEventListener(
      "load",
      this.onFullSizeImageLoad.bind(this)
    );
    this.startBtn.addEventListener("click", this.onStartBtnClick.bind(this));
  }

  onImageUploadChange(e: MouseEvent) {
    // e.preventDefault();
    this.upload()
      .then(
        function (d: Response) {
          this.onUploadSuccess(d);
        }.bind(this)
      )
      .catch(
        function (err: Error) {
          this.onUploadFailure(err);
        }.bind(this)
      );
  }

  onStartBtnClick(e: SubmitEvent) {
    e.preventDefault();
    this.createPuzzle();
  }

  onUploadSuccess(response: { data: SourceImage }) {
    console.log("onUploadSuccess", response);

    if (response.data) {
      this.imagePreviewEl.style.display = "flex";
      this.sourceImage.previewPath = (
        this.imageUploadPreviewEl as HTMLImageElement
      ).src = response.data.previewPath;
      this.sourceImage.fullSizePath = (
        this.fullSizeImageHidden as HTMLImageElement
      ).src = response.data.fullSizePath;
      this.sourceImage.imageName = response.data.filename;

      this.sourceImage.dimensions.width = response.data.width;
      this.sourceImage.dimensions.height = response.data.height;
      this.cropNotNeeded = response.data.width === response.data.height;

      const { width, height } = this.sourceImage.dimensions;

      // Forcing square puzzles for now
      // TODO: Revisit when we support rectangular puzzles
      const imageSize = Math.min(width, height);

      this.puzzleToImageRatio = this.boardSize / imageSize;
      this.imageSize = imageSize;
    }
  }

  onImagePreviewLoad() {
    // console.log('image info', e)

    if (this.cropNotNeeded) {
      this.setPuzzleImageOffsetAndWidth(true);
      if (this.imageCropVisible) {
        this.destroyImageCrop();
      }
    } else {
      this.initiateImageCrop();
    }

    this.imagePreviewEl.style.display = "block";
  }

  onFullSizeImageLoad(e: Response) {
    console.log(e);
  }

  onUploadFailure(response: string) {
    console.log("onUploadFailure", response);
    this.imagePreviewEl.textContent = response;
  }

  setPuzzleImageOffsetAndWidth(noCrop = false) {
    if (noCrop) {
      this.selectedOffsetX = 0;
      this.selectedOffsetY = 0;
      this.selectedWidth = this.imageUploadPreviewEl.naturalWidth;
      this.selectedHeight = this.imageUploadPreviewEl.naturalWidth;
    } else {
      const leftPos = this.imageCropElement.offsetLeft;
      const topPos = this.imageCropElement.offsetTop;
      const width = this.imageCropElement.clientWidth;

      const cropLeftOffsetPercentage =
        (leftPos / this.imageUploadPreviewEl.naturalWidth) * 100;
      const cropTopOffsetPercentage =
        (topPos / this.imageUploadPreviewEl.naturalHeight) * 100;
      const cropWidthPercentage =
        (width / this.imageUploadPreviewEl.naturalWidth) * 100;

      this.crop.selectedOffsetX =
        (this.imageUploadPreviewEl.naturalWidth / 100) *
        cropLeftOffsetPercentage;
      this.crop.selectedOffsetY =
        (this.imageUploadPreviewEl.naturalHeight / 100) *
        cropTopOffsetPercentage;
      this.crop.selectedWidth =
        (this.imageUploadPreviewEl.naturalWidth / 100) * cropWidthPercentage;
      this.crop.selectedHeight = this.crop.selectedWidth;

      this.crop.hasCrop = true;
    }
  }

  setImageCropDragHandles() {
    this.imageCropDragHandles.forEach((el) => (el.style.display = "block"));
    this.imageCropDragHandleTL.style.top =
      this.imageCropElement.offsetTop -
      this.imageCropDragHandleTL.clientHeight +
      "px";
    this.imageCropDragHandleTL.style.left =
      this.imageCropElement.offsetLeft -
      this.imageCropDragHandleTL.clientWidth +
      "px";
    this.imageCropDragHandleTR.style.top =
      this.imageCropElement.offsetTop -
      this.imageCropDragHandleTL.clientHeight +
      "px";
    this.imageCropDragHandleTR.style.left =
      this.imageCropElement.offsetLeft +
      this.imageCropElement.offsetWidth +
      "px";
    this.imageCropDragHandleBR.style.top =
      this.imageCropElement.offsetTop +
      this.imageCropElement.offsetHeight +
      "px";
    this.imageCropDragHandleBR.style.left =
      this.imageCropElement.offsetLeft +
      this.imageCropElement.offsetWidth +
      "px";
    this.imageCropDragHandleBL.style.top =
      this.imageCropElement.offsetTop +
      this.imageCropElement.offsetHeight +
      "px";
    this.imageCropDragHandleBL.style.left =
      this.imageCropElement.offsetLeft -
      this.imageCropDragHandleBL.clientWidth +
      "px";

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

  onImageCropMouseDown(e: MouseEvent) {
    e.preventDefault();
    const el = e.target as HTMLElement;
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

    const moveListener = this.imageCropElement.addEventListener(
      "mousemove",
      function (e: MouseEvent) {
        this.onImageCropMove(e, limitToAxis);
      }.bind(this)
    );

    window.addEventListener(
      "mouseup",
      function (e: MouseEvent) {
        e.preventDefault();
        this.setPuzzleImageOffsetAndWidth();
        this.imageCropElement.removeEventListener("mousemove", moveListener);
        this.imageCropData.inUse = false;
      }.bind(this)
    );
  }

  onImageCropMove(e: MouseEvent, axis = null) {
    e.preventDefault();
    const newX = e.clientX - this.imageCropData.diffX;
    const newY = e.clientY - this.imageCropData.diffY;

    if (
      this.imageCropData.inUse &&
      this.imageCropWithinBounds(newX, newY, axis)
    ) {
      if ((axis && axis === "y") || !axis) {
        this.imageCropElement.style.top = newY + "px";
      }
      if ((axis && axis === "x") || !axis) {
        this.imageCropElement.style.left = newX + "px";
      }
      if (this.imageCropData.inUse) {
        this.setImageCropDragHandles();
      }
    }
  }

  imageCropWithinBounds(newX: number, newY: number, axis = null) {
    const elBoundingBox = {
      top: newY,
      right: newX + this.imageCropElement.clientWidth,
      bottom: newY + this.imageCropElement.clientHeight,
      left: newX,
    };
    const containerBoundingBox = this.imagePreviewEl.getBoundingClientRect();

    if (axis && axis === "x") {
      return (
        elBoundingBox.left >= Math.ceil(this.imageUploadPreviewEl.offsetLeft) &&
        elBoundingBox.right <=
          Math.ceil(
            this.imageUploadPreviewEl.offsetLeft +
              this.imageUploadPreviewEl.offsetWidth
          )
      );
    }
    if (axis && axis === "y") {
      return (
        elBoundingBox.top >= Math.ceil(this.imageUploadPreviewEl.offsetTop) &&
        elBoundingBox.bottom <=
          Math.ceil(
            this.imageUploadPreviewEl.offsetTop +
              this.imageUploadPreviewEl.offsetHeight
          )
      );
    }
    return (
      elBoundingBox.left >= Math.ceil(containerBoundingBox.left) &&
      elBoundingBox.right <= Math.ceil(containerBoundingBox.right) &&
      elBoundingBox.top >= Math.ceil(containerBoundingBox.top) &&
      elBoundingBox.bottom <= Math.ceil(containerBoundingBox.bottom)
    );
  }

  onImageCropMouseUp(e: MouseEvent) {
    e.preventDefault();
    if (this.imageCropData.inUse) {
      this.imageCropData.inUse = false;
    }
  }

  initiateImageCrop() {
    this.imageCropElement.style.display = "block";
    this.setImageCropSizeAndPosition();

    this.imageCropVisible = true;

    window.addEventListener(
      "resize",
      this.setImageCropSizeAndPosition.bind(this)
    );
  }

  setImageCropSizeAndPosition() {
    const el = this.imageUploadPreviewEl;
    const width = el.naturalWidth;
    const height = el.naturalHeight;

    if (width === height) return;

    const cropSize = width > height ? height : width;

    this.imageCropElement.style.top =
      this.imageUploadPreviewEl.offsetTop + "px";
    this.imageCropElement.style.left =
      this.imageUploadPreviewEl.offsetLeft + "px";
    this.imageCropElement.style.height = cropSize + "px";
    this.imageCropElement.style.width = cropSize + "px";

    this.setImageCropDragHandles();
    this.setPuzzleImageOffsetAndWidth();
  }

  destroyImageCrop() {
    this.imageCropElement.style.display = "none";
    this.imageCropDragHandles.forEach((el) => (el.style.display = "none"));
    window.removeEventListener("resize", this.setImageCropSizeAndPosition);
  }

  upload() {
    const fileFld = document.querySelector("#upload-fld") as HTMLInputElement;
    const files = fileFld.files as FileList;
    if (files.length > 0) {
      this.image = files[0] as File;
    }
    console.log("image to upload", this.image);

    const fd = new FormData();
    fd.append("files[]", this.image);
    fd.append("previewWidth", this.imagePreviewEl.offsetWidth.toString());
    fd.append("previewHeight", this.imagePreviewEl.offsetHeight.toString());
    fd.append("boardSize", this.boardSize.toString());
    fd.append("integration", this.integration + "");

    return fetch("/api/upload", {
      body: fd,
      method: "POST",
    }).then((response) => response.json());
  }

  getCropData(imageEl: HTMLImageElement) {
    let widthPercentage,
      heightPercentage,
      leftOffsetPercentage,
      topOffsetPercentage;
    const imageWidth = imageEl.offsetWidth;
    const imageHeight = imageEl.offsetHeight;

    if (imageWidth > imageHeight) {
      widthPercentage = (this.imageCropElement.offsetWidth / imageWidth) * 100;
      leftOffsetPercentage =
        (parseInt(this.imageCropElement.style.left) / imageWidth) * 100;
      topOffsetPercentage = 0;
      heightPercentage = 100;
    } else {
      heightPercentage =
        (this.imageCropElement.offsetHeight / imageHeight) * 100;
      topOffsetPercentage =
        (parseInt(this.imageCropElement.style.top) / imageHeight) * 100;
      leftOffsetPercentage = 0;
      widthPercentage = 100;
    }

    return {
      widthPercentage,
      heightPercentage,
      topOffsetPercentage,
      leftOffsetPercentage,
    };
  }

  getImageDimensions(imageEl: HTMLImageElement) {
    return imageEl.offsetWidth !== imageEl.offsetHeight
      ? this.getCropData(imageEl)
      : {
          topOffsetPercentage: 0,
          leftOffsetPercentage: 0,
          heightPercentage: 100,
          widthPercentage: 100,
        };
  }

  async createPuzzle(options = null) {
    const piecesPerSideHorizontal = Math.sqrt(this.selectedNumPieces);
    const piecesPerSideVertical = Math.sqrt(this.selectedNumPieces);

    const puzzleData: PuzzleCreatorOptions = {
      ...this.sourceImage,
      ...this.crop,
      ...this.getImageDimensions(this.imageUploadPreviewEl),
      stageWidth: window.innerWidth,
      stageHeight: window.innerHeight,
      debugOptions: this.debugOptions,
      selectedNumPieces: this.selectedNumPieces,
      imagePreviewType: this.imagePreviewType,
      originalImageSize: this.sourceImage.dimensions,
      boardSize: this.boardSize,
      imageSize: this.imageSize,
      puzzleToImageRatio: this.puzzleToImageRatio,
      integration: this.integration,
    };

    const makePuzzleImageResponse = await fetch("/api/makePuzzleImage", {
      body: JSON.stringify(options || puzzleData),
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
      },
    });

    const { puzzleImagePath } = await makePuzzleImageResponse.json();

    const generator = await puzzleGenerator(puzzleImagePath, puzzleData);

    const { spriteEncodedString, pieces } =
      await generator.generateDataForPuzzlePieces();

    // const { width, height } = puzzleData.originalImageSize;

    // const img = new Image(width, height);
    // img.src = spriteEncodedString;

    // const getFormDataForImgFile = await fetch(img.src)
    //   .then((response) => response.blob())
    //   .then((response) => {
    //     console.log("fetched image from base64 string", response);

    //     const imgFile = new File([response], "testfile.png", {
    //       type: "image/png",
    //     });
    //     const formData = new FormData();
    //     formData.append("files[]", imgFile);
    //     return formData;
    //   });

    // const spriteUploadResult = await fetch("api/uploadPuzzleSprite", {
    //   method: "POST",
    //   body: getFormDataForImgFile,
    // });

    Object.assign(puzzleData, {
      spriteEncodedString,
      puzzleImagePath,
      pieces,
      pieceSize: generator.pieceSize,
    });

    fetch("/api/puzzle", {
      body: JSON.stringify(puzzleData),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(
        function (response: PuzzleCreationResponse) {
          console.log("response", response);
          const puzzleId = response._id;

          Utils.insertUrlParam("puzzleId", puzzleId);

          this.newPuzzleForm.style.display = "none";

          window.Puzzly = new Puzzly(puzzleId, {
            ...puzzleData,
            _id: response._id,
            pieceSize: response.pieceSize,
            pieces: response.pieces,
            spritePath: response.spritePath,
            previewPath: response.previewPath,
          });
        }.bind(this)
      )
      .catch(function (err) {
        console.log(err);
      });
  }
}

window.PuzzlyCreator = PuzzlyCreator;
