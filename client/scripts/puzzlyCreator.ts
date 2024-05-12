import { normalize } from "path/win32";
import { MINIMUM_NUMBER_OF_PIECES, MINIMUM_NUMBER_OF_PIECES_PER_SIDE, PIECE_SIZE, SquareShapedPuzzleDefinitions } from "./constants";
import puzzleGenerator from "./puzzleGenerator";
import PuzzleImpressionOverlay from "./PuzzleImpressionOverlay";
import Puzzly from "./Puzzly";
import { PuzzleAxis, PuzzleCreationResponse, PuzzleCreatorOptions, PuzzleSize } from "./types";
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
  puzzleSizes: PuzzleSize[];
  selectedPuzzleSize: PuzzleSize;
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
    this.showForm();

    this.puzzleSizeInputField.value = 1 + "";

    if (!this.puzzleSizes) {
      this.puzzleSizeInputField.disabled = true;
    }

    this.isIntegration = window.location.href.indexOf("isIntegration=true") > -1;
  }

  showForm() {
    this.newPuzzleForm.style.display = "flex";
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

  getPuzzleSizes(
    imageWidth: number,
    imageHeight: number,
    minimumPieceSize: number,
    minimumNumberOfPieces: number
  ) {

    const shortSide: PuzzleAxis | null =
      imageWidth < imageHeight ? PuzzleAxis.Horizontal
        : imageHeight < imageWidth ? PuzzleAxis.Vertical
          : null;

    let n: number = MINIMUM_NUMBER_OF_PIECES_PER_SIDE;
    let divisionResult: number;

    const puzzleSizes: PuzzleSize[] = [];

    if (shortSide) {
      do {
        let puzzleWidth: number;
        let puzzleHeight: number;
        let numberOfPiecesOnLongSide: number;

        divisionResult = Math.ceil(
          shortSide === PuzzleAxis.Horizontal
            ? imageWidth / n
            : imageHeight / n
        );

        const puzzleSize = {} as PuzzleSize;

        puzzleSize.imageWidth = imageWidth;
        puzzleSize.imageHeight = imageHeight;
        puzzleSize.pieceSize = divisionResult;

        if (shortSide === PuzzleAxis.Horizontal) {
          // Portrait puzzle
          puzzleWidth = imageWidth;
          const longSideConfig = this.getConfigForForAdjacentSideByPieceSize(
            imageHeight,
            divisionResult
          );
          numberOfPiecesOnLongSide = longSideConfig.numberOfPieces;
          puzzleHeight = longSideConfig.totalLength;

          puzzleSize.numberOfPiecesHorizontal = n;
          puzzleSize.numberOfPiecesVertical = numberOfPiecesOnLongSide;
          puzzleSize.puzzleWidth = imageWidth;
          puzzleSize.puzzleHeight = puzzleHeight;
        } else {
          // Landscape puzzle
          puzzleHeight = imageHeight;
          const longSideConfig = this.getConfigForForAdjacentSideByPieceSize(
            imageWidth,
            divisionResult
          );
          numberOfPiecesOnLongSide = longSideConfig.numberOfPieces;
          puzzleWidth = longSideConfig.totalLength;

          puzzleSize.numberOfPiecesHorizontal = numberOfPiecesOnLongSide;
          puzzleSize.numberOfPiecesVertical = n;
          puzzleSize.puzzleWidth = puzzleWidth;
          puzzleSize.puzzleHeight = imageHeight;
        }

        puzzleSize.totalNumberOfPieces = n * numberOfPiecesOnLongSide;

        puzzleSizes.push(puzzleSize);

        n = n + 1;
      } while (divisionResult > minimumPieceSize)

      return puzzleSizes;
    } else {
      // Square puzzles
    }
  }

  /**
  * Calculate the maximum number of pieces we can have along a given edge
  * by simple addition based on a known size.
  * 
  * i.e. keep adding the known piece size while it still fits within the length
  * 
  * Use this to get the number of pieces for the longer edge once we know
  * the number of pieces and their sizes for the shorter egde.
  * 
  * @param edgeLength number
  * @param interval number
  * @returns { numberOfPieces: number, totalLength: number }
  */
  getConfigForForAdjacentSideByPieceSize(
    edgeLength: number,
    pieceSize: number,
  ): {
    numberOfPieces: number,
    totalLength: number
  } {
    let n: number = 0;
    let sum: number = 0;
    let done = false;

    while (!done) {
      const newValue = sum + pieceSize;
      if (newValue < edgeLength) {
        sum = newValue;
        n++;
      } else {
        done = true;
      }
    }

    return {
      numberOfPieces: n,
      totalLength: sum
    }
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

    const { width, height } = this.sourceImage.dimensions;
    this.puzzleSizes = this.getPuzzleSizes(
      width,
      height,
      PIECE_SIZE,
      MINIMUM_NUMBER_OF_PIECES
    ) as PuzzleSize[];

    console.log("puzzle sizes", this.puzzleSizes)

    this.puzzleSizeInputField.disabled = false;
    this.updatePuzzleSizeField(this.puzzleSizes);

    this.puzzleSizeInputField.addEventListener("input", (event: InputEvent) => {
      const eventTarget = event.target as HTMLInputElement;
      const value = parseInt(eventTarget.value);

      const highlightedPuzzleSize: PuzzleSize = this.puzzleSizes[value - 1];

      if (this.puzzleSizes) {
        this.puzzleSizeInputLabel.textContent = highlightedPuzzleSize.totalNumberOfPieces + "";
        this.PuzzleImpressionOverlay.update(highlightedPuzzleSize);
      }

    })

    const puzzleImpressionOverlayConfig = {
      targetElement: this.imageUploadPreviewEl,
      selectedPuzzleSize: this.selectedPuzzleSize,
      isSquareOptionSelected: false
    };

    this.PuzzleImpressionOverlay = new PuzzleImpressionOverlay(puzzleImpressionOverlayConfig);
    this.imagePreviewEl.classList.remove("js-hidden");
    console.log("PuzzleImpressionOverlay", this.PuzzleImpressionOverlay)
  }

  updatePuzzleSizeField(puzzleSizes: PuzzleSize[]) {
    this.selectedPuzzleSize = puzzleSizes[0];
    this.puzzleSizeInputField.min = 1 + "";
    this.puzzleSizeInputField.max = this.puzzleSizes.length + "";
    this.puzzleSizeInputLabel.textContent = this.selectedPuzzleSize.totalNumberOfPieces + "";
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

    if (image) {
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
    if (options) {
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

    // const puzzleCreatorOptions: PuzzleCreatorOptions = {

    // }

    // const generator = await puzzleGenerator(puzzleImagePath, puzzleCreatorOptions);

    // const { spriteEncodedString, pieces } =
    //   await generator.generateDataForPuzzlePieces();

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

    // const puzzleData = {
    //   spriteEncodedString,
    //   puzzleImagePath,
    //   pieces,
    //   pieceSize: generator.pieceSize,
    //   connectorSize: generator.connectorSize,
    //   connectorDistanceFromCorner: generator.connectorDistanceFromCorner,
    // });

    /*
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
      */
  }
}

window.PuzzlyCreator = PuzzlyCreator;
