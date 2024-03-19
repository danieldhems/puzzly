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
    constructor();
    showForm(): void;
    setDefaultNumPieces(): void;
    addEventListeners(): void;
    onImageUploadChange(): void;
    onStartBtnClick(e: SubmitEvent): void;
    onUploadSuccess(response: {
        data: SourceImage;
    }): void;
    onImagePreviewLoad(): void;
    onFullSizeImageLoad(e: Response): void;
    onUploadFailure(response: string): void;
    setPuzzleImageOffsetAndWidth(noCrop?: boolean): void;
    setImageCropDragHandles(): void;
    onImageCropMouseDown(e: MouseEvent): void;
    onImageCropMove(e: MouseEvent, axis?: null): void;
    imageCropWithinBounds(newX: number, newY: number, axis?: null): boolean;
    onImageCropMouseUp(e: MouseEvent): void;
    initiateImageCrop(): void;
    setImageCropSizeAndPosition(): void;
    destroyImageCrop(): void;
    upload(): Promise<any>;
    getCropData(imageEl: HTMLImageElement): {
        widthPercentage: number;
        heightPercentage: number;
        topOffsetPercentage: number;
        leftOffsetPercentage: number;
    };
    getImageDimensions(imageEl: HTMLImageElement): {
        widthPercentage: number;
        heightPercentage: number;
        topOffsetPercentage: number;
        leftOffsetPercentage: number;
    };
    createPuzzle(options?: null): Promise<void>;
}
