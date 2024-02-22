"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHAPE_TYPES = exports.SHADOW_OFFSET_RATIO = exports.SIDES = exports.EVENT_TYPES = exports.SOLVING_AREA_SIZE_PERCENTAGE = exports.ELEMENT_IDS = exports.ZOOM_INTERVALS = exports.PIECE_SIZE = exports.PUZZLE_PIECE_CLASSES = exports.LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY = exports.LOCAL_STORAGE_PUZZLY_PROGRESS_KEY = exports.PuzzleSizes = void 0;
exports.PuzzleSizes = [
    { numPieces: 9, piecesPerSide: 3 },
    { numPieces: 16, piecesPerSide: 4 },
    { numPieces: 25, piecesPerSide: 5 },
    { numPieces: 36, piecesPerSide: 6 },
    { numPieces: 49, piecesPerSide: 7 },
    { numPieces: 64, piecesPerSide: 8 },
    { numPieces: 81, piecesPerSide: 9 },
    { numPieces: 100, piecesPerSide: 10 },
    { numPieces: 121, piecesPerSide: 11 },
    { numPieces: 144, piecesPerSide: 12 },
    { numPieces: 169, piecesPerSide: 13 },
    { numPieces: 196, piecesPerSide: 14 },
    { numPieces: 256, piecesPerSide: 16 },
    { numPieces: 324, piecesPerSide: 18 },
    { numPieces: 484, piecesPerSide: 22 },
    { numPieces: 576, piecesPerSide: 24 },
    { numPieces: 676, piecesPerSide: 26 },
];
exports.LOCAL_STORAGE_PUZZLY_PROGRESS_KEY = "LOCAL_STORAGE_PUZZLY_PROGRESS_KEY";
exports.LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY = "LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY";
exports.PUZZLE_PIECE_CLASSES = ["puzzle-piece", "puzzle-piece-fg"];
exports.PIECE_SIZE = 100;
exports.ZOOM_INTERVALS = [1, 1.5, 2.5];
exports.ELEMENT_IDS = {
    SOLVED_PUZZLE_AREA: "solved-puzzle-area",
    SOLVED_CONTAINER: "group-container-1111",
    SOLVED_CANVAS: "group-canvas-1111",
    PLAY_BOUNDARY: "play-boundary",
    STAGE: "stage",
    PIECES_CONTAINER: "pieces-container",
    BRIDGE: "bridge",
    POCKETS: "pockets",
    DRAGANDSELECT_CONTAINER: "selected-pieces-container",
    POCKET_DRAG_CONTAINER: "active-pieces-container",
};
exports.SOLVING_AREA_SIZE_PERCENTAGE = 15;
exports.EVENT_TYPES = {
    PIECE_PICKUP: "PIECE_PICKUP",
    PIECE_DROP: "PIECE_DROP",
    CHANGE_SCALE: "CHANGE_SCALE",
    PUZZLE_LOADED: "PUZZLE_LOADED",
    RESIZE: "RESIZE",
    CLEAR_BRIDGE: "CLEAR_BRIDGE",
    DRAGANDSELECT_ACTIVE: "DRAGANDSELECT_ACTIVE",
    DRAGANDSELECT_PIECES_SELECTED: "DRAGANDSELECT_PIECES_SELECTED",
    ADD_TO_POCKET: "ADD_TO_POCKET",
    POCKET_PICKUP: "POCKET_PICKUP",
    POCKET_PUTDOWN: "POCKET_PUTDOWN",
    RETURN_TO_CANVAS: "RETURN_TO_CANVAS",
    MOVE_FINISHED: "MOVE_FINISHED",
    CONNECTION_MADE: "CONNECTION_MADE",
    SAVE: "SAVE",
    SAVE_IN_PROGRESS: "SAVE_IN_PROGRESS",
    SAVE_SUCCESSFUL: "SAVE_SUCCESSFUL",
    NEW_GROUP: "NEW_GROUP",
    GROUP_CREATED: "GROUP_CREATED",
};
exports.SIDES = {
    TOP: "TOP",
    RIGHT: "RIGHT",
    BOTTOM: "BOTTOM",
    LEFT: "LEFT",
};
exports.SHADOW_OFFSET_RATIO = 0.01;
exports.SHAPE_TYPES = {
    PLAIN: 1,
    NATURAL: 2,
};
