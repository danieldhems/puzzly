import { SquareShapedPuzzleDefinitions } from "./constants";
import puzzleGenerator from "./puzzleGenerator";
import PuzzleImpressionOverlay from "./PuzzleImpressionOverlay";
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

export interface DebugOptions {
  noDispersal: boolean;
  highlightConnectingPieces: boolean;
}

export default class PuzzlyCreator {
  selectedNumPieces: number;
  piecesPerSideHorizontal: number;
  piecesPerSideVertical: number;
  sourceImage: SourceImage;
  /**
   * Puzzle target area
   * 
   * The following properties describe the overlay element for the uploaded image
   * which shows the user which portion of the image the puzzle will be
   * generated from.
   *
   */
  puzzleTargetAreaOffsetLeft: number;
  puzzleTargetAreaOffsetTop: number;
  puzzleTargetAreaWidth: number;
  puzzleTargetAreaHeight: number;
  puzzleTargetAreaCalculatedWidth: number;
  puzzleTargetAreaCalculatedHeight: number;
  puzzleTargetAreaElement: HTMLElement;
  /* End puzzleTargetArea properties */
  debugOptions: DebugOptions;
  boardWidth: number;
  boardHeight: number;
  puzzleSizeInputField: HTMLInputElement;
  puzzleSizeInputLabel: HTMLLabelElement;
  chkHighlights: HTMLInputElement;
  chkNoDispersal: HTMLInputElement;
  imagePreviewEl: HTMLImageElement;
  imageUploadField: HTMLInputElement;
  newPuzzleForm: HTMLDivElement;
  startBtn: HTMLInputElement;
  puzzleSizeField: HTMLInputElement;
  fullSizePath: string;
  imageUploadPreviewEl: HTMLImageElement & {
    naturalWidth: number;
    naturalHeight: number;
  };
  PuzzleImpressionOverlay: PuzzleImpressionOverlay;
  isIntegration: boolean;

  constructor() {
    if (window.innerHeight < window.innerWidth) {
      this.boardHeight = Math.ceil((window.innerHeight / 100) * 40);
      this.boardWidth = this.boardHeight;
    } else if (window.innerWidth < window.innerHeight) {
      this.boardWidth = Math.ceil((window.innerWidth / 100) * 40);
      this.boardHeight = this.boardWidth;
    }

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
    this.imageUploadField = document.querySelector(
      "#upload-fld"
    ) as this["imageUploadField"];
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
    this.puzzleTargetAreaElement = document.getElementById(
      "image-crop"
    ) as this["puzzleTargetAreaElement"];

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

    this.isIntegration = window.location.href.indexOf("isIntegration=true") > -1;
  }

  showForm() {
    this.newPuzzleForm.style.display = "flex";
  }

  setDefaultNumPieces() {
    this.puzzleSizeField.value = "0";
    const defaultPuzzleSize = SquareShapedPuzzleDefinitions[0];
    this.puzzleSizeInputLabel.textContent = (this.selectedNumPieces =
      defaultPuzzleSize.numPieces).toString();
    this.piecesPerSideHorizontal = defaultPuzzleSize.piecesPerSide;
    this.piecesPerSideVertical = defaultPuzzleSize.piecesPerSide;
  }

  addEventListeners() {
    this.puzzleSizeInputField.addEventListener(
      "input",
      function (e: InputEvent) {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        this.puzzleSizeInputLabel.textContent = this.selectedNumPieces =
        SquareShapedPuzzleDefinitions[parseInt(target.value)].numPieces;
      }.bind(this)
    );

    // this.imagePreviewTypeToggleRadio.addEventListener("change", () => {
    //   this.imagePreviewType = "toggle";
    // });

    // this.imagePreviewTypeAlwaysOnRadio.addEventListener("change", () => {
    //   this.imagePreviewType = "alwaysOn";
    // });

    // this.chkHighlights.addEventListener(
    //   "input",
    //   function (e: InputEvent) {
    //     this.debugOptions.highlightConnectingPieces = (
    //       e.target as HTMLInputElement
    //     ).checked;
    //   }.bind(this)
    // );

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
        SquareShapedPuzzleDefinitions[parseInt((e.target as HTMLInputElement).value)].numPieces;
      }.bind(this)
    );

    this.imageUploadField.addEventListener(
      "change",
      this.onImageUploadChange.bind(this)
    );

    this.imageUploadPreviewEl.addEventListener(
      "load",
      this.onImagePreviewLoad.bind(this)
    );

    window.addEventListener("PuzzlyPuzzleImpressionMoved", this.onOverlayMove.bind(this))

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

  onOverlayMove(event: CustomEvent) {
    console.log(event.detail);
    const { left, top } = event.detail;
    this.puzzleTargetAreaOffsetLeft = left;
    this.puzzleTargetAreaOffsetTop = top;

    this.setPuzzleImageOffsetAndWidth();
}

  onStartBtnClick(e: SubmitEvent) {
    e.preventDefault();
    this.createPuzzle();
  }

  onUploadSuccess(response: { data: SourceImage }) {
    console.log("onUploadSuccess", response);

    if (response.data) {
      this.imagePreviewEl.style.display = "flex";
      // (
      //   this.imagePreviewEl as HTMLImageElement
      // ).style.backgroundImage = "url("+response.data.fullSizePath+")";
      (
        this.imageUploadPreviewEl as HTMLImageElement
      ).src = response.data.fullSizePath;
      this.sourceImage.imageName = response.data.filename;
      this.fullSizePath = response.data.fullSizePath;

      this.sourceImage.dimensions.width = response.data.width;
      this.sourceImage.dimensions.height = response.data.height;
    }
  }

  onImagePreviewLoad() {
    // console.log('image info', e)
      
    this.PuzzleImpressionOverlay = new PuzzleImpressionOverlay({ targetElement: this.imageUploadPreviewEl, isSquareOptionSelected: true })
    this.imagePreviewEl.classList.remove("js-hidden");
    console.log("PuzzleImpressionOverlay", this.PuzzleImpressionOverlay)
  }

  onFullSizeImageLoad(e: Response) {
    console.log(e);
  }

  onUploadFailure(response: string) {
    console.log("onUploadFailure", response);
    this.imagePreviewEl.textContent = response;
  }

  setPuzzleImageOffsetAndWidth() {
      const leftPos = this.puzzleTargetAreaOffsetLeft;
      const topPos = this.puzzleTargetAreaOffsetTop;

      const cropLeftOffsetPercentage =
        Math.floor((leftPos / this.imageUploadPreviewEl.naturalWidth) * 100);
      const cropTopOffsetPercentage =
      Math.floor((topPos / this.imageUploadPreviewEl.naturalHeight) * 100);
      const cropWidthPercentage =
        Math.floor((this.puzzleTargetAreaWidth / this.imageUploadPreviewEl.naturalWidth) * 100);
      const cropHeightPercentage =
      Math.floor((this.puzzleTargetAreaWidth / this.imageUploadPreviewEl.naturalWidth) * 100);

      this.puzzleTargetAreaOffsetLeft =
        (this.imageUploadPreviewEl.naturalWidth / 100) *
        cropLeftOffsetPercentage;
      this.puzzleTargetAreaOffsetTop =
        (this.imageUploadPreviewEl.naturalHeight / 100) *
        cropTopOffsetPercentage;
      this.puzzleTargetAreaCalculatedWidth =
        (this.imageUploadPreviewEl.naturalWidth / 100) * cropWidthPercentage;
      this.puzzleTargetAreaCalculatedHeight =
        (this.imageUploadPreviewEl.naturalWidth / 100) * cropHeightPercentage;
  }

  upload(): Promise<Response> {
    const fileFld = document.querySelector("#upload-fld") as HTMLInputElement;
    const files = fileFld.files as FileList;
    
    let image;
    if (files.length > 0) {
      image = files[0] as File;
      console.log("image to upload", image);
    }

    const fd = new FormData();

    if(image){
      fd.append("files[]", image);
    }

    fd.append("previewWidth", this.imagePreviewEl.offsetWidth.toString());
    fd.append("previewHeight", this.imagePreviewEl.offsetHeight.toString());
    fd.append("boardSize", this.boardHeight.toString());
    fd.append("integration", this.isIntegration + "");

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

    const imageWidth = this.sourceImage.dimensions.width;
    const imageHeight = this.sourceImage.dimensions.height;

    console.log("image width", imageWidth)
    console.log("crop width", this.puzzleTargetAreaWidth)

    if (imageWidth > imageHeight) {
      widthPercentage = (this.puzzleTargetAreaWidth / imageWidth) * 100;
      leftOffsetPercentage =
        (this.puzzleTargetAreaOffsetLeft / imageWidth) * 100;
      topOffsetPercentage = 0;
      heightPercentage = 100;
    } else {
      heightPercentage =
        (this.puzzleTargetAreaHeight / imageHeight) * 100;
      topOffsetPercentage =
        (this.puzzleTargetAreaOffsetTop / imageHeight) * 100;
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

  async createPuzzle(options: Record<any, any> | null = null) {
    const makePuzzleImageRequestData = {
      ...this.sourceImage,
      ...this.getImageDimensions(this.imageUploadPreviewEl),
      imagePath: this.fullSizePath,
      originalImageSize: this.sourceImage.dimensions,
      resizeWidth: this.boardWidth,
      resizeHeight: this.boardHeight,
      isIntegration: this.isIntegration,
    };

    let makePuzzleImageRequest = makePuzzleImageRequestData;
    if(options) {
      makePuzzleImageRequest = {
        ...makePuzzleImageRequest,
        ...options,
      };
    }
    const makePuzzleImageResponse = await fetch("/api/makePuzzleImage", {
      body: JSON.stringify(makePuzzleImageRequest),
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
      },
    });

    const { puzzleImagePath } = await makePuzzleImageResponse.json();

    const puzzleCreatorOptions: PuzzleCreatorOptions = {

    }

    const generator = await puzzleGenerator(puzzleImagePath, puzzleCreatorOptions);

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
      connectorSize: generator.connectorSize,
      connectorDistanceFromCorner: generator.connectorDistanceFromCorner,
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
            connectorSize: response.connectorSize,
            connectorDistanceFromCorner: response.connectorDistanceFromCorner,
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
