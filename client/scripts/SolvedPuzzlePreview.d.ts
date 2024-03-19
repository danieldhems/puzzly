import { SolvedPuzzlePreviewType } from "./types";
export default class SolvedPuzzlePreview {
    fullImageViewerEl: HTMLDivElement | null;
    controlElement: HTMLSpanElement | null;
    showBtn: HTMLSpanElement | null;
    hideBtn: HTMLSpanElement | null;
    previewImage: HTMLImageElement;
    imagePreviewType: SolvedPuzzlePreviewType;
    isPreviewActive: boolean;
    isControlAvailable: boolean;
    constructor(imagePreviewType: SolvedPuzzlePreviewType);
    setupFullImagePreviewer(): void;
    togglePreviewer(): void;
}
