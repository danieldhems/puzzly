export declare const PuzzleSizes: {
    numPieces: number;
    piecesPerSide: number;
}[];
export declare const LOCAL_STORAGE_PUZZLY_PROGRESS_KEY = "LOCAL_STORAGE_PUZZLY_PROGRESS_KEY";
export declare const LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY = "LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY";
export declare const PUZZLE_PIECE_CLASSES: string[];
export declare const PIECE_SIZE = 100;
export declare const ZOOM_INTERVALS: number[];
export declare const ELEMENT_IDS: {
    SOLVED_PUZZLE_AREA: string;
    SOLVED_CONTAINER: string;
    SOLVED_CANVAS: string;
    PLAY_BOUNDARY: string;
    STAGE: string;
    PIECES_CONTAINER: string;
    BRIDGE: string;
    POCKETS: string;
    DRAGANDSELECT_CONTAINER: string;
    POCKET_DRAG_CONTAINER: string;
};
export declare const SOLVING_AREA_SIZE_PERCENTAGE = 15;
export declare const EVENT_TYPES: {
    PIECE_PICKUP: string;
    PIECE_DROP: string;
    CHANGE_SCALE: string;
    PUZZLE_LOADED: string;
    RESIZE: string;
    CLEAR_BRIDGE: string;
    DRAGANDSELECT_ACTIVE: string;
    DRAGANDSELECT_PIECES_SELECTED: string;
    ADD_TO_POCKET: string;
    POCKET_PICKUP: string;
    POCKET_PUTDOWN: string;
    RETURN_TO_CANVAS: string;
    MOVE_FINISHED: string;
    CONNECTION_MADE: string;
    SAVE: string;
    SAVE_IN_PROGRESS: string;
    SAVE_SUCCESSFUL: string;
    NEW_GROUP: string;
    GROUP_CREATED: string;
};
export declare const SIDES: {
    TOP: string;
    RIGHT: string;
    BOTTOM: string;
    LEFT: string;
};
export declare const SHAPE_TYPES: {
    PLAIN: number;
    NATURAL: number;
};
export declare const SHADOW_OFFSET_RATIO = 0.025;
export declare const CONNECTOR_TOLERANCE_AMOUNT = 40;
export declare const FLOAT_TOLERANCE_AMOUNT = 20;
