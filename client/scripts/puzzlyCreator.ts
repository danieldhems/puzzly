import { MINIMUM_NUMBER_OF_PIECES, PIECE_SIZE, SOLVING_AREA_SCREEN_PORTION, SquareShapedPuzzleDefinitions } from "./constants";
import puzzleGenerator, { addPuzzleDataToPieces, generatePieces, getConnectorDimensions } from "./puzzleGenerator";
import PuzzleImpressionOverlay from "./PuzzleImpressionOverlay";
import Puzzly from "./Puzzly";
import { PuzzleAxis, PuzzleConfig, PuzzleCreationResponse, PuzzleShapes } from "./types";
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
  puzzleConfigs: {
    rectangularPuzzleConfigs: PuzzleConfig[];
    squarePuzzleConfigs: PuzzleConfig[];
  };
  activePuzzleConfigs: PuzzleConfig[];
  selectedPuzzleConfig: PuzzleConfig;
  selectedPuzzleShape: PuzzleShapes;
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
  puzzleOptionsContainer: HTMLDivElement;
  puzzleSizeField: HTMLInputElement;
  puzzleShapeInputField: HTMLInputElement;
  puzzleShapeFieldContainer: HTMLDivElement;
  fullSizePath: string;
  imageUploadPreviewEl: HTMLImageElement & {
    naturalWidth: number;
    naturalHeight: number;
  };
  PuzzleImpressionOverlay: PuzzleImpressionOverlay;
  isIntegration: boolean;

  constructor() {


    this.puzzleOptionsContainer = document.querySelector(
      "#puzzle-setup--options"
    ) as this["puzzleOptionsContainer"];

    this.puzzleSizeInputField = document.querySelector(
      "#puzzle-size-input-field"
    ) as this["puzzleSizeInputField"];
    this.puzzleSizeInputLabel = document.querySelector(
      "#puzzle-size-input-label"
    ) as this["puzzleSizeInputLabel"];

    this.puzzleShapeFieldContainer = document.querySelector(
      "#puzzle-setup--puzzle-shape .field-container"
    ) as this["puzzleShapeFieldContainer"];

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

    this.showForm();
    this.addGeneralEventListeners();

    this.selectedPuzzleShape = PuzzleShapes.Rectangle;

    if (!this.puzzleConfigs) {
      this.puzzleSizeInputField.disabled = true;
    }

    this.isIntegration = window.location.href.indexOf("isIntegration=true") > -1;
  }

  setPuzzleSize(selectedShape: PuzzleShapes, imageWidth: number, imageHeight: number) {
    switch (selectedShape) {
      case PuzzleShapes.Square:
        if (window.innerHeight < window.innerWidth) {
          this.boardHeight = Math.ceil((window.innerHeight / 100) * 40);
          this.boardWidth = this.boardHeight;
        } else if (window.innerWidth < window.innerHeight) {
          this.boardWidth = Math.ceil((window.innerWidth / 100) * 40);
          this.boardHeight = this.boardWidth;
        }
        break;
      case PuzzleShapes.Rectangle:

    }
  }

  setPuzzleShapeFieldValues() {
    Object.keys(PuzzleShapes).forEach((key) => {
      const container = document.createElement("div");
      container.classList.add("form-radio-container");

      const fieldId = `puzzle-shape-${key.toLowerCase()}-input-field`;

      const fieldLabel = document.createElement("label");
      fieldLabel.setAttribute("for", fieldId);
      fieldLabel.textContent = key;

      const fieldInput = document.createElement("input");
      fieldInput.type = "radio";
      fieldInput.id = fieldId;
      fieldInput.value = key;
      fieldInput.name = "input-puzzle_shape";

      if (key === PuzzleShapes.Rectangle) {
        fieldInput.checked = true;
      }

      this.puzzleShapeFieldContainer.appendChild(fieldLabel);
      this.puzzleShapeFieldContainer.appendChild(fieldInput);

      fieldInput.addEventListener(
        "input",
        function (e: InputEvent) {
          e.preventDefault();
          const target = e.target as HTMLInputElement;
          this.selectedPuzzleShape = target.value;

          let selectedConfigs;
          switch (this.selectedPuzzleShape) {
            case PuzzleShapes.Square:
              selectedConfigs = this.puzzleConfigs.squarePuzzleConfigs;
              break;
            case PuzzleShapes.Rectangle:
              selectedConfigs = this.puzzleConfigs.rectangularPuzzleConfigs;
              break;
          }

          this.activePuzzleConfigs = this.getPuzzleConfigsForSelectedShape(target.value);
          console.log(this.activePuzzleConfigs)

          if (this.activePuzzleConfigs) {
            this.PuzzleImpressionOverlay.setImpressions(this.activePuzzleConfigs);
            this.PuzzleImpressionOverlay.setActiveImpression(this.activePuzzleConfigs[0]);
            this.updatePuzzleSizeField(this.activePuzzleConfigs);
          }
        }.bind(this)
      );
    })
  }

  showForm() {
    this.newPuzzleForm.style.display = "flex";
  }

  showPuzzleConfigFields() {
    this.puzzleOptionsContainer.classList.remove("js-hidden")
  }

  addGeneralEventListeners() {
    this.imageUploadField.addEventListener(
      "change",
      this.onImageUploadChange.bind(this)
    );

    this.imageUploadPreviewEl.addEventListener(
      "load",
      this.onImagePreviewLoad.bind(this)
    );

    this.startBtn.addEventListener("click", this.onStartBtnClick.bind(this));
  }

  addPuzzleOptionEventListeners() {
    this.puzzleSizeInputField.addEventListener("input", (event: InputEvent) => {
      const eventTarget = event.target as HTMLInputElement;
      const value = parseInt(eventTarget.value);

      const highlightedPuzzleSize: PuzzleConfig = this.activePuzzleConfigs[value - 1];

      if (this.puzzleConfigs) {
        this.puzzleSizeInputLabel.textContent = highlightedPuzzleSize.totalNumberOfPieces + "";
        this.PuzzleImpressionOverlay.setActiveImpression(highlightedPuzzleSize);
        this.selectedPuzzleConfig = highlightedPuzzleSize;
      }
    })

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

    window.addEventListener("PuzzlyPuzzleImpressionMoved", this.onOverlayMove.bind(this))
  }

  getPuzzleSizes(
    imageWidth: number,
    imageHeight: number,
    minimumPieceSize: number,
    minimumNumberOfPieces: number,
  ): {
    rectangularPuzzleConfigs: PuzzleConfig[];
    squarePuzzleConfigs: PuzzleConfig[];
  } {
    const shortSide: PuzzleAxis | null =
      imageWidth < imageHeight ? PuzzleAxis.Horizontal
        : imageHeight < imageWidth ? PuzzleAxis.Vertical
          : null;

    let n: number = Math.floor(Math.sqrt(minimumNumberOfPieces));
    let divisionResult: number;

    const rectangularPuzzleConfigs: PuzzleConfig[] = [];
    const squarePuzzleConfigs: PuzzleConfig[] = [];

    do {
      let puzzleWidth: number;
      let puzzleHeight: number;

      divisionResult = Math.floor(
        shortSide === PuzzleAxis.Horizontal
          ? imageWidth / n
          : imageHeight / n
      );

      const { connectorSize } = getConnectorDimensions(divisionResult);

      const puzzleConfig = {} as PuzzleConfig;

      if (shortSide) {
        let numberOfPiecesOnLongSide: number;

        puzzleConfig.imageWidth = imageWidth;
        puzzleConfig.imageHeight = imageHeight;
        puzzleConfig.pieceSize = divisionResult;
        puzzleConfig.connectorSize = connectorSize;

        let longSideConfig;

        switch (shortSide) {
          case PuzzleAxis.Horizontal:
            // Portrait puzzle
            longSideConfig = this.getConfigForForAdjacentSideByPieceSize(
              imageHeight,
              divisionResult
            );
            numberOfPiecesOnLongSide = longSideConfig.numberOfPieces;
            puzzleHeight = longSideConfig.totalLength;

            puzzleConfig.numberOfPiecesHorizontal = n;
            puzzleConfig.numberOfPiecesVertical = numberOfPiecesOnLongSide;
            puzzleConfig.puzzleWidth = divisionResult * n;
            puzzleConfig.puzzleHeight = divisionResult * numberOfPiecesOnLongSide;
            break;

          case PuzzleAxis.Vertical:
            // Landscape puzzle
            longSideConfig = this.getConfigForForAdjacentSideByPieceSize(
              imageWidth,
              divisionResult
            );
            numberOfPiecesOnLongSide = longSideConfig.numberOfPieces;
            puzzleWidth = longSideConfig.totalLength;

            puzzleConfig.numberOfPiecesHorizontal = numberOfPiecesOnLongSide;
            puzzleConfig.numberOfPiecesVertical = n;
            puzzleConfig.puzzleWidth = divisionResult * numberOfPiecesOnLongSide;
            puzzleConfig.puzzleHeight = divisionResult * n;
            break;
        }

        puzzleConfig.totalNumberOfPieces = n * numberOfPiecesOnLongSide;
        rectangularPuzzleConfigs.push(puzzleConfig);
      }

      // Square puzzles
      const config = {
        numberOfPiecesHorizontal: n,
        numberOfPiecesVertical: n,
        totalNumberOfPieces: n * n,
        pieceSize: divisionResult,
        connectorSize,
        imageWidth,
        imageHeight,
        puzzleWidth: divisionResult * n,
        puzzleHeight: divisionResult * n,
      };
      squarePuzzleConfigs.push(config);

      n = n + 1;

    } while (divisionResult >= minimumPieceSize)

    return {
      rectangularPuzzleConfigs,
      squarePuzzleConfigs,
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
    const { rectangularPuzzleConfigs, squarePuzzleConfigs } = this.getPuzzleSizes(
      width,
      height,
      PIECE_SIZE,
      MINIMUM_NUMBER_OF_PIECES,
    );

    this.puzzleConfigs = {
      rectangularPuzzleConfigs,
      squarePuzzleConfigs,
    };

    console.log(rectangularPuzzleConfigs)

    this.activePuzzleConfigs = this.getPuzzleConfigsForSelectedShape(this.selectedPuzzleShape);
    this.selectedPuzzleConfig = this.activePuzzleConfigs[0];

    const puzzleImpressionOverlayConfig = {
      targetElement: this.imageUploadPreviewEl,
      puzzleConfigs: this.activePuzzleConfigs,
      selectedPuzzleConfig: this.selectedPuzzleConfig,
    };

    const rectanglePuzzleSets = this.puzzleConfigs.rectangularPuzzleConfigs.map((config) => generatePieces(config));
    const squarePuzzleSets = this.puzzleConfigs.squarePuzzleConfigs.map((config) => generatePieces(config));

    this.PuzzleImpressionOverlay = new PuzzleImpressionOverlay(puzzleImpressionOverlayConfig);
    this.imagePreviewEl.classList.remove("js-hidden");

    this.updatePuzzleSizeField(this.getPuzzleConfigsForSelectedShape(this.selectedPuzzleShape));
    this.puzzleSizeInputField.value = 1 + "";
    this.puzzleSizeInputField.disabled = false;

    this.setPuzzleShapeFieldValues();
    this.addPuzzleOptionEventListeners();
    this.getCropData();
  }

  getPuzzleConfigsForSelectedShape(shape: PuzzleShapes) {
    switch (shape) {
      case PuzzleShapes.Rectangle:
        return this.puzzleConfigs.rectangularPuzzleConfigs;
      case PuzzleShapes.Square:
        return this.puzzleConfigs.squarePuzzleConfigs;
    }
  }

  updatePuzzleSizeField(puzzleConfigs: PuzzleConfig[]) {
    this.selectedPuzzleConfig = puzzleConfigs[0];
    this.puzzleSizeInputField.min = 1 + "";
    this.puzzleSizeInputField.max = puzzleConfigs.length + "";
    this.puzzleSizeInputField.value = 1 + "";
    this.puzzleSizeInputLabel.textContent = this.selectedPuzzleConfig.totalNumberOfPieces + "";
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
      // console.log("image to upload", image);
    }

    const fd = new FormData();

    if (image) {
      fd.append("files[]", image);
    }

    fd.append("previewWidth", this.imagePreviewEl.offsetWidth.toString());
    fd.append("previewHeight", this.imagePreviewEl.offsetHeight.toString());
    // fd.append("boardSize", this.boardHeight.toString());
    fd.append("integration", this.isIntegration + "");

    return fetch("/api/upload", {
      body: fd,
      method: "POST",
    }).then((response) => response.json());
  }

  getCropData() {
    let widthPercentage,
      heightPercentage,
      leftOffsetPercentage,
      topOffsetPercentage;

    const imageWidth = this.sourceImage.dimensions.width;
    const imageHeight = this.sourceImage.dimensions.height;

    const { top, left, width, height } = this.PuzzleImpressionOverlay.getPositionAndDimensions();
    const { offsetWidth, offsetHeight } = this.imageUploadPreviewEl;

    widthPercentage = Math.floor((width / offsetWidth) * 100);
    heightPercentage = Math.floor((height / offsetHeight) * 100);
    leftOffsetPercentage =
      Math.floor(
        (Math.abs(left) / offsetWidth) * 100
      );
    topOffsetPercentage =
      Math.floor(
        (Math.abs(top) / offsetHeight) * 100
      );

    return {
      imageWidth,
      imageHeight,
      topOffsetPercentage,
      leftOffsetPercentage,
      widthPercentage,
      heightPercentage
    };
  }

  getPuzzleDimensions(puzzleConfig: Pick<PuzzleConfig, "imageWidth" | "imageHeight" | "numberOfPiecesHorizontal" | "numberOfPiecesVertical">) {
    const { imageWidth, imageHeight, numberOfPiecesHorizontal, numberOfPiecesVertical } = puzzleConfig;
    const smallerLength = Math.min(imageWidth, imageHeight);
    const largerLength = Math.max(imageWidth, imageHeight);

    const isSquare = numberOfPiecesHorizontal === numberOfPiecesVertical;
    const aspectRatio = smallerLength / largerLength;

    let width: number, height: number;
    if (window.innerWidth < window.innerHeight) {
      height = window.innerHeight / 100 * SOLVING_AREA_SCREEN_PORTION;
      return {
        height,
        width: isSquare ? height : height * aspectRatio,
      }

    } else if (window.innerHeight < window.innerWidth) {
      width = window.innerWidth / 100 * SOLVING_AREA_SCREEN_PORTION;
      return {
        width,
        height: isSquare ? width : width * aspectRatio,
      }
    } else {
      width = window.innerWidth / 100 * SOLVING_AREA_SCREEN_PORTION;
      return {
        width,
        height: width,
      }
    }
  }



  async createPuzzle(options: Record<any, any> | null = null) {
    const pieces = generatePieces(this.selectedPuzzleConfig);
    const cropData = this.getCropData();

    // console.log("crop data", cropData)

    const puzzleDimensions = this.getPuzzleDimensions(this.selectedPuzzleConfig);
    const mappedPieces = addPuzzleDataToPieces(pieces, this.selectedPuzzleConfig, puzzleDimensions)
    console.log("mapped pieces", mappedPieces)


    const makePuzzleImageResponse = await fetch("/api/makePuzzleImage", {
      body: JSON.stringify({
        ...cropData,
        dimensions: this.sourceImage.dimensions,
        imageName: this.sourceImage.imageName,
        resizeWidth: Math.floor(puzzleDimensions.width),
        resizeHeight: Math.floor(puzzleDimensions.height),
      }),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });

    const { puzzleImagePath } = await makePuzzleImageResponse.json();

    const data = {
      ...this.selectedPuzzleConfig,
      imageName: this.sourceImage.imageName,
      debugOptions: this.debugOptions,
      pieces: mappedPieces,
      isIntegration: this.isIntegration,
    }

    fetch("/api/puzzle", {
      body: JSON.stringify(data),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(
        function (response: any) {
          // console.log("response", response);
          const puzzleId = response._id;

          Utils.insertUrlParam("puzzleId", puzzleId);

          this.newPuzzleForm.style.display = "none";

          window.Puzzly = new Puzzly(puzzleId, {
            ...data,
            _id: response._id,
            connectorDistanceFromCorner: response.connectorDistanceFromCorner,
            previewPath: response.previewPath,
            puzzleImagePath,
            boardWidth: puzzleDimensions.width,
            boardHeight: puzzleDimensions.height,
          });
        }.bind(this)
      )
      .catch(function (err) {
        console.log(err);
      });
  }
}

window.PuzzlyCreator = PuzzlyCreator;
